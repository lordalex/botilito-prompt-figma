import React, { useState, useMemo } from 'react';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { transformHumanCaseToUI } from '@/services/analysisPresentationService';
import { generateDisplayId } from '@/utils/humanVerification/api';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

interface CaseDetailViewProps {
    caseId: string;
    onBackToList: () => void;
    onVerificationSuccess?: (caseId: string) => void;
    mode?: 'ai' | 'human';
}

/**
 * CaseDetailView - Entry point for viewing case details from Historial.
 * 
 * Uses:
 * - useCaseDetail hook (behavior) for data fetching
 * - transformHumanCaseToUI (service) for data transformation
 * - UnifiedAnalysisView (UI) for presentation
 */
export function CaseDetailView({
    caseId,
    onBackToList,
    onVerificationSuccess,
    mode = 'ai'  // Default to AI view for historial
}: CaseDetailViewProps) {
    const { caseDetail, loading, error, reload } = useCaseDetail(caseId);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Transform case data for UnifiedAnalysisView
    const transformedData = useMemo(() => {
        if (!caseDetail) return null;
        return transformHumanCaseToUI(caseDetail);
    }, [caseDetail]);

    // Handle diagnosis submission (if in human mode)
    const handleSubmitDiagnosis = async (diagnosis: any) => {
        setIsSubmitting(true);
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('No user found');

            const { error } = await supabase.functions.invoke('human-diagnosis', {
                body: {
                    caseId: caseId,
                    diagnosis: diagnosis,
                    userId: user.user.id
                }
            });

            if (error) throw error;

            toast({
                title: "Diagnóstico Enviado",
                description: "Tu diagnóstico humano ha sido registrado exitosamente.",
            });

            onVerificationSuccess?.(caseId);
        } catch (error: any) {
            console.error('Error submitting diagnosis:', error);
            toast({
                title: "Error",
                description: error.message || "No se pudo enviar el diagnóstico.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando detalles del caso...</p>
            </div>
        );
    }

    // Error state
    if (error || !caseDetail) {
        return (
            <div className="text-center p-8 space-y-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <p className="text-lg font-medium">{error || 'Caso no encontrado.'}</p>
                <Button variant="outline" onClick={onBackToList}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la lista
                </Button>
            </div>
        );
    }

    // Determine content type from case data
    // The API might return different values for submission_type
    const getContentType = (): 'text' | 'image' | 'audio' => {
        const detail = caseDetail as any;
        // Check if it's forensic analysis with image/audio data
        const isForensic = transformedData?.raw?.metadata?.is_forensic || detail.metadata?.is_forensic;
        if (isForensic) {
            const hasImageDetails = transformedData?.raw?.all_documents?.[0]?.result?.details?.[0]?.original_frame;
            if (hasImageDetails) return 'image';

            // Check for audio in submission_type when forensic
            if (detail.submission_type?.toLowerCase?.().includes('audio')) return 'audio';
        }

        // Check submission_type
        const submissionType = detail.submission_type?.toLowerCase?.() || '';
        if (submissionType.includes('image') || submissionType === 'media') return 'image';
        if (submissionType.includes('audio')) return 'audio';

        return 'text';
    };
    const contentType = getContentType();

    const detail = caseDetail as any;

    return (
        <UnifiedAnalysisView
            data={transformedData}
            contentType={contentType}
            mode={mode}
            title={detail.title || 'Detalle del Caso'}
            caseNumber={generateDisplayId(detail)}
            timestamp={detail.created_at}
            reportedBy={detail.metadata?.reported_by?.name || 'Comunidad'}
            screenshot={detail.metadata?.screenshot}
            onReset={onBackToList}
            onSubmitDiagnosis={handleSubmitDiagnosis}
            isSubmittingDiagnosis={isSubmitting}
            hideVoting={mode === 'ai'}
        />
    );
}

