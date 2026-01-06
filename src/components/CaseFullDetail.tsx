import React, { useState } from 'react';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import { transformTextAnalysisToUI } from '../services/textAnalysisService';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateCaseCode, ContentType, TransmissionVector } from '@/utils/caseCodeGenerator';

interface CaseFullDetailProps {
    data: any;
    onClose: () => void;
}

export function CaseFullDetail({ data, onClose }: CaseFullDetailProps) {
    const { toast } = useToast();
    const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);

    // Initial detection of type
    const rawData = data.credibilityScore !== undefined ? data.fullResult : data;
    const resultType = rawData?.type || rawData?.meta?.type;

    const isImageAnalysis =
        resultType === 'image_analysis' ||
        (rawData?.human_report && (rawData?.raw_forensics || rawData?.file_info?.dimensions)) ||
        (rawData?.details && Array.isArray(rawData.details) && rawData?.summary?.global_verdict) ||
        (rawData?.summary && rawData?.summary.global_verdict !== undefined) ||
        (rawData?.file_info?.dimensions) ||
        (rawData?.meta?.file_info?.dimensions);

    const isAudioAnalysis = resultType === 'audio_analysis';
    const contentType = isImageAnalysis ? 'image' : isAudioAnalysis ? 'audio' : 'text';

    // Transformation for text if needed
    const transformedData = contentType === 'text'
        ? (data.credibilityScore !== undefined ? data : transformTextAnalysisToUI(data))
        : rawData;

    const { fullResult } = transformedData;
    const createdAt = fullResult?.created_at || rawData?.created_at;
    const reportedBy = fullResult?.reported_by?.name || rawData?.reported_by?.name || 'Desconocido';
    const title = fullResult?.source_data?.title || rawData?.source_data?.title || (contentType === 'image' ? 'Análisis Forense de Imagen' : contentType === 'audio' ? 'Análisis Forense de Audio' : 'Análisis de Texto');

    // Helper to map content type for code generation
    const getContentTypeCode = (type: string): ContentType => {
        const typeMap: Record<string, ContentType> = { 'image': 'imagen', 'audio': 'audio', 'text': 'texto' };
        return typeMap[type] || 'texto';
    };

    // Helper to map vector
    const getVectorCode = (vector?: string): TransmissionVector => {
        if (!vector) return 'Web';
        const vectorMap: Record<string, TransmissionVector> = {
            'whatsapp': 'WhatsApp', 'facebook': 'Facebook', 'twitter': 'Twitter/X', 'x': 'Twitter/X',
            'instagram': 'Instagram', 'tiktok': 'TikTok', 'youtube': 'YouTube', 'telegram': 'Telegram',
            'web': 'Web', 'email': 'Email', 'sms': 'SMS'
        };
        return vectorMap[vector.toLowerCase()] || 'Web';
    };

    const caseVector = fullResult?.metadata?.vector || rawData?.metadata?.vector || rawData?.vector || 'Web';
    const caseNumber = fullResult?.display_id || fullResult?.displayId || rawData?.display_id || rawData?.displayId ||
        generateCaseCode(getContentTypeCode(contentType), getVectorCode(caseVector));

    const handleSubmitDiagnosis = async (diagnosis: any) => {
        setIsSubmittingDiagnosis(true);
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('No user found');

            const { error } = await supabase.functions.invoke('human-diagnosis', {
                body: {
                    caseId: fullResult?.id || rawData?.id,
                    diagnosis: diagnosis,
                    userId: user.user.id
                }
            });

            if (error) throw error;

            toast({
                title: "Diagnóstico Enviado",
                description: "Tu diagnóstico humano ha sido registrado exitosamente.",
            });
        } catch (error: any) {
            console.error('Error submitting diagnosis:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo enviar el diagnóstico.",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingDiagnosis(false);
        }
    };

    return (
        <div className="relative">
            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <UnifiedAnalysisView
                data={transformedData}
                contentType={contentType}
                onReset={onClose}
                onSubmitDiagnosis={handleSubmitDiagnosis}
                isSubmittingDiagnosis={isSubmittingDiagnosis}
                caseNumber={caseNumber}
                timestamp={createdAt}
                reportedBy={reportedBy}
                title={title}
                screenshot={fullResult?.metadata?.screenshot || rawData?.metadata?.screenshot || fullResult?.screenshot || rawData?.screenshot}
            />
        </div>
    );
}
