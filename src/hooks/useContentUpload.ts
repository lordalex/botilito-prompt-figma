import { useState, useEffect, useRef } from 'react';
// Asegúrate de que esta importación exista o ajústala a tu servicio de texto actual
import { performAnalysis as performTextAnalysis } from '../services/contentAnalysisService';
import { imageAnalysisService, convertFileToBase64 } from '../services/imageAnalysisService';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

const POLLING_INTERVAL = 3000;

export function useContentUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'polling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmissionRef = useRef<any>(null);

  const resetState = () => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  // Helper to simulate progress while waiting for async service
  const startFakeProgress = () => {
    setProgress(30);
    pollingRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 1000);
  };

  const stopFakeProgress = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const submitContent = async (
    content: string,
    files: File[],
    contentType: ContentType,
    transmissionMedium: TransmissionVector
  ) => {
    resetState();
    lastSubmissionRef.current = { content, files, contentType, transmissionMedium };
    setStatus('uploading');
    setProgress(10);

    try {
      if (files && files.length > 0) {
        // --- FLUJO IMAGEN ---
        setStatus('polling'); // Usamos 'polling' para indicar proceso en "back" aunque ahora sea await
        startFakeProgress();

        // El servicio ahora maneja todo el ciclo (submit + polling interno)
        const analysisResult = await imageAnalysisService.submitImage(files[0]);

        stopFakeProgress();
        setResult(analysisResult);
        setProgress(100);
        setStatus('complete');
      } else {
        // --- FLUJO TEXTO ---
        const textResult = await performTextAnalysis(content, transmissionMedium, (p: number) => {
          setProgress(p);
        });
        setResult(textResult);
        setStatus('complete');
      }
    } catch (err: any) {
      console.error(err);
      stopFakeProgress();
      setStatus('error');
      setError({ message: err.message || 'Error al procesar la solicitud.' });
    }
  };

  const retryLastSubmission = () => {
    if (lastSubmissionRef.current) {
      submitContent(
        lastSubmissionRef.current.content,
        lastSubmissionRef.current.files,
        lastSubmissionRef.current.contentType,
        lastSubmissionRef.current.transmissionMedium
      );
    }
  };

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  return { status, progress, result, error, submitContent, resetState, retryLastSubmission };
}

