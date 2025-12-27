import React, { useState, useEffect } from 'react';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import { supabase } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScreenshotImage } from './ScreenshotImage';
import { api } from '@/services/api';
import { useAuth } from '../providers/AuthProvider';

interface ContentUploadResultProps {
  result: any;
  onReset: () => void;
  mode?: 'ai' | 'human';
}

export function ContentUploadResult({ result, onReset, mode }: ContentUploadResultProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);
  const [newsScreenshot, setNewsScreenshot] = useState<string | null>(null);
  const [reportedBy, setReportedBy] = useState<string | null>('Cargando...');

  const resultType = result?.type || result?.meta?.type;

  // IMAGE ANALYSIS DETECTION - Support all known formats
  const isImageAnalysis =
    resultType === 'image_analysis' ||
    (result?.human_report && (result?.raw_forensics || result?.file_info?.dimensions)) ||
    (result?.details && Array.isArray(result.details) && result?.summary?.global_verdict) ||
    (result?.summary && result?.summary.global_verdict !== undefined) ||
    (result?.file_info?.dimensions) ||
    (result?.meta?.file_info?.dimensions);

  // AUDIO ANALYSIS DETECTION
  const isAudioAnalysis = resultType === 'audio_analysis';

  const {
    title,
    caseNumber,
    fullResult
  } = result;

  const createdAt = fullResult?.created_at || result?.full_result?.created_at || new Date().toISOString();

  useEffect(() => {
    const fetchAuthor = async () => {
      if (fullResult?.reported_by?.name) {
        setReportedBy(fullResult.reported_by.name);
        return;
      }

      const userId = fullResult?.user_id || result?.user_id;
      if (!userId) {
        setReportedBy('Desconocido');
        return;
      }
      try {
        const profile = await api.profile.getById(session, userId);
        setReportedBy(profile.full_name || profile.email || 'Desconocido');
      } catch (error) {
        console.error("Error fetching author profile:", error);
        setReportedBy('Desconocido');
      }
    };

    fetchAuthor();
  }, [fullResult, result, session]);

  useEffect(() => {
    const existingScreenshot = fullResult?.metadata?.screenshot || fullResult?.screenshot || result?.screenshot;
    if (existingScreenshot) {
      setNewsScreenshot(existingScreenshot);
    }
  }, [fullResult, result]);

  const handleSubmitDiagnosis = async (diagnosis: any) => {
    setIsSubmittingDiagnosis(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No user found');

      console.log('Submitting diagnosis:', diagnosis);

      const { error } = await supabase.functions.invoke('human-diagnosis', {
        body: {
          caseId: result.id || fullResult?.id,
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

  const contentType = isImageAnalysis ? 'image' : isAudioAnalysis ? 'audio' : 'text';

  return (
    <>
      <ScreenshotImage
        submittedUrl={fullResult?.url || result?.url || null}
        width={1200}
        height={800}
        onImageLoad={setNewsScreenshot}
      />
      <UnifiedAnalysisView
        data={fullResult || result}
        contentType={contentType}
        onReset={onReset}
        onSubmitDiagnosis={handleSubmitDiagnosis}
        isSubmittingDiagnosis={isSubmittingDiagnosis}
        caseNumber={caseNumber || fullResult?.id?.slice(0, 8)}
        timestamp={createdAt}
        reportedBy={reportedBy}
        title={title || fullResult?.source_data?.title || (contentType === 'image' ? 'Análisis Forense de Imagen' : contentType === 'audio' ? 'Análisis Forense de Audio' : 'Análisis de Texto')}
        screenshot={newsScreenshot}
        mode={mode}
      />
    </>
  );
}
