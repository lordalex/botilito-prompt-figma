import { useState, useEffect, useRef } from 'react';
// Asegúrate de que esta importación exista o ajústala a tu servicio de texto actual
import { performAnalysis as performTextAnalysis } from '../services/contentAnalysisService';
import { imageAnalysisService, convertFileToBase64 } from '../services/imageAnalysisService';
import { useNotifications } from '@/providers/NotificationProvider'; // Import Hook
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
        // --- FLUJO IMAGEN ---
        setStatus('polling');
        startFakeProgress();

        // Use non-blocking submission
        const { jobId, result: fastResult } = await imageAnalysisService.submitJob(files[0]);

        if (jobId) {
          // REGISTER THE TASK IMMEDIATELY
          registerTask(jobId, 'image_analysis', { filename: files[0].name });
        }

        let finalResult = fastResult;

        // If we don't have a result yet, we must poll (because this hook drives the loading screen)
        // Even though NotificationProvider tracks it, we want local result too.
        if (!finalResult && jobId) {
          // We can reuse the service's poll helper manually or rely on our 'polling' status
          // Since `submitImage` (legacy) does exactly this, let's just await the result
          // effectively blocking this view but allowing the Notification Center to show it running.

          // BUT: The original issue was "starting... doesn't add notification".
          // By registering above, we fix that.

          // We still need to wait for result to show it in THIS view.
          const { data: { session } } = await import('@/utils/supabase/client').then(m => m.supabase.auth.getSession());
          // We can't import pollJobStatus since it's not exported, but we can use getJobStatus loop or just call the legacy wrapper?
          // Actually `imageAnalysisService.submitImage` calls `submitJob` then polls.
          // We can't call `submitImage` again because it would re-submit.

          // We need to poll manually here or assume `NotificationProvider` updates us?
          // `useContentUpload` manages local state. 
          // Ideally we just wait.

          // Let's implement a simple poll loop here or call a helper.
          // Since I can't easily import `pollJobStatus` (not exported from service object), 
          // I will implement a loop using `imageAnalysisService.getJobStatus`

          const poll = async () => {
            while (true) {
              await new Promise(r => setTimeout(r, 2000));
              const status = await imageAnalysisService.getJobStatus(jobId);
              if (status.status === 'completed' && status.result) {
                return await imageAnalysisService.getAnalysisResult(jobId);
              }
              if (status.status === 'failed') throw new Error(status.error || 'Failed');
            }
          };
          finalResult = await poll();
        }

        stopFakeProgress();
        setResult(finalResult);
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
            setError({ message: statusRes.error || 'Job failed' });
            setStatus('error');
          } else {
            // Still running
            setProgress(50); // Indeterminate
            setTimeout(check, 3000);
          }
        } catch (e) {
          console.error("Restoration error", e);
          setError({ message: "Failed to load job" });
          setStatus('error');
        }
      };
      check();
    };
    restoreJob();
  }, [initialJobId]);

  return { status, progress, result, error, submitContent, resetState, retryLastSubmission, retryCount };
}

