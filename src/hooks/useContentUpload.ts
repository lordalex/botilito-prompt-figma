import { useState, useEffect, useRef } from 'react';
// Asegúrate de que esta importación exista o ajústala a tu servicio de texto actual
import { performAnalysis as performTextAnalysis } from '../services/contentAnalysisService'; 
import { submitImageAnalysis, getJobStatus, convertFileToBase64 } from '../services/imageAnalysisService';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 20;

export function useContentUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'polling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const lastSubmissionRef = useRef<any>(null);

  const resetState = () => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const startPolling = (jobId: string) => {
    setStatus('polling');
    attemptsRef.current = 0;

    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      try {
        const jobStatus = await getJobStatus(jobId);
        // Simular avance visual
        setProgress((prev) => Math.min(prev + 5, 90));

        if (jobStatus.status === 'completed' && jobStatus.result) {
          clearInterval(pollingRef.current!);
          setResult(jobStatus.result);
          setProgress(100);
          setStatus('complete');
        } else if (jobStatus.status === 'failed') {
          throw new Error(jobStatus.error || 'El análisis falló en el servidor.');
        } else if (attemptsRef.current >= MAX_POLLING_ATTEMPTS) {
          throw new Error('Tiempo de espera agotado.');
        }
      } catch (err: any) {
        clearInterval(pollingRef.current!);
        setStatus('error');
        setError({ message: err.message });
      }
    }, POLLING_INTERVAL);
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
        const base64 = await convertFileToBase64(files[0]);
        setProgress(30);
        
        const response = await submitImageAnalysis(base64);
        setProgress(50);

        if (response.status === 'completed') {
          setResult(response.result);
          setProgress(100);
          setStatus('complete');
        } else {
          startPolling(response.job_id);
        }
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

