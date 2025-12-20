import { useState, useEffect, useRef } from 'react';
import { performAnalysis as performTextAnalysis } from '../services/contentAnalysisService';
import { imageAnalysisService, convertFileToBase64 } from '../services/imageAnalysisService';
import { audioAnalysisService } from '../services/audioAnalysisService';
import { useNotifications } from '@/providers/NotificationProvider';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

const POLLING_INTERVAL = 3000;

export function useContentUpload(initialJobId?: string) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'polling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // We need to use RegisterTask
  const { registerTask } = useNotifications();

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
        const file = files[0];
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        // Detect if it's an audio file
        const isAudioFile = fileType.startsWith('audio/') ||
          fileName.endsWith('.wav') ||
          fileName.endsWith('.mp3') ||
          fileName.endsWith('.ogg') ||
          fileName.endsWith('.m4a') ||
          fileName.endsWith('.flac');

        if (isAudioFile) {
          // --- AUDIO FLOW ---
          setStatus('polling');
          startFakeProgress();

          const { jobId, result: fastResult } = await audioAnalysisService.submitJob(file);

          if (jobId) {
            registerTask(jobId, 'audio_analysis', { filename: file.name });
          }

          let finalResult = fastResult;

          // Poll for result if not immediately available
          if (!finalResult && jobId) {
            const poll = async () => {
              while (true) {
                await new Promise(r => setTimeout(r, 2000));
                const status = await audioAnalysisService.getJobStatus(jobId);
                if (status.status === 'completed' && status.result) {
                  return await audioAnalysisService.getAudioAnalysisResult(jobId);
                }
                if (status.status === 'failed') throw new Error(status.error?.message || 'Failed');
              }
            };
            finalResult = await poll();
          }

          // Add local audio URL for playback
          if (finalResult && file) {
            try {
              const objectUrl = URL.createObjectURL(file);
              finalResult = {
                ...finalResult,
                local_audio_url: objectUrl
              };
            } catch (e) {
              console.error("Failed to create object URL for audio", e);
            }
          }

          stopFakeProgress();
          setResult(finalResult);
          setProgress(100);
          setStatus('complete');
        } else {
          // --- IMAGE FLOW ---
          setStatus('polling');
          startFakeProgress();

          const { jobId, result: fastResult } = await imageAnalysisService.submitJob(file);

          if (jobId) {
            registerTask(jobId, 'image_analysis', { filename: file.name });
          }

          let finalResult = fastResult;

          if (!finalResult && jobId) {
            const poll = async () => {
              while (true) {
                await new Promise(r => setTimeout(r, 2000));
                const status = await imageAnalysisService.getJobStatus(jobId);
                if (status.status === 'completed' && status.result) {
                  return await imageAnalysisService.getAnalysisResult(jobId);
                }
                if (status.status === 'failed') throw new Error(typeof status.error === 'string' ? status.error : status.error?.message || 'Failed');
              }
            };
            finalResult = await poll();
          }

          if (finalResult && file) {
            try {
              const objectUrl = URL.createObjectURL(file);
              finalResult = {
                ...finalResult,
                local_image_url: objectUrl
              };
            } catch (e) {
              console.error("Failed to create object URL", e);
            }
          }

          stopFakeProgress();
          setResult(finalResult);
          setProgress(100);
          setStatus('complete');
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
      stopFakeProgress();
      setStatus('error');
      setError(err?.message || 'Error al procesar la solicitud.');
    }
  };

  const retryLastSubmission = () => {
    if (lastSubmissionRef.current) {
      setRetryCount(prev => prev + 1);
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

  // Restore job if ID provided
  useEffect(() => {
    if (!initialJobId) return;

    const restoreJob = async () => {
      setStatus('polling');
      // Simple poll loop for restoration
      // In a real app we might want to share this polling logic or use the provider
      // But here we need local state (result/progress)

      const check = async () => {
        try {
          const statusRes = await imageAnalysisService.getJobStatus(initialJobId);
          if (statusRes.status === 'completed') {
            // Fetch full result
            const result = await imageAnalysisService.getAnalysisResult(initialJobId);
            setResult(result);
            setStatus('complete');
            setProgress(100);
          } else if (statusRes.status === 'failed') {
            setError(statusRes.error || 'Job failed');
            setStatus('error');
          } else {
            // Still running
            setProgress(50); // Indeterminate
            setTimeout(check, 3000);
          }
        } catch (e) {
          console.error("Restoration error", e);
          setError("Failed to load job");
          setStatus('error');
        }
      };
      check();
    };
    restoreJob();
  }, [initialJobId]);

  return { status, progress, result, error, submitContent, resetState, retryLastSubmission, retryCount };
}

