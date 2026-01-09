import { useState, useEffect, useRef } from 'react';
import { performAnalysis as performTextAnalysis } from '../services/contentAnalysisService';
import { imageAnalysisService, convertFileToBase64 } from '../services/imageAnalysisService';
import { audioAnalysisService } from '../services/audioAnalysisService';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

const POLLING_INTERVAL = 3000;

/**
 * useContentUpload Hook (v1.3.0)
 * 
 * Updated for Lazy Polling architecture:
 * - Removed registerTask calls (server handles job registration automatically)
 * - Hook still polls locally for immediate UI feedback during active upload
 * - Server tracks jobs via notifications API for cross-session persistence
 * - Notifications will be updated when user polls /inbox endpoint
 */
export function useContentUpload(initialJobId?: string, initialJobType?: string) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'polling' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [transmissionVector, setTransmissionVector] = useState<TransmissionVector | undefined>(undefined);
  const [originalContentType, setOriginalContentType] = useState<ContentType | undefined>(undefined);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmissionRef = useRef<any>(null);

  const resetState = () => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    setFileName(undefined);
    setFileSize(undefined);
    setTransmissionVector(undefined);
    setOriginalContentType(undefined);
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
    setTransmissionVector(transmissionMedium);
    setOriginalContentType(contentType);
    setStatus('uploading');
    setProgress(10);

    try {
      if (files && files.length > 0) {
        const file = files[0];
        setFileName(file.name);
        setFileSize(file.size);
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

          // Note: Server automatically registers this job in notifications system
          // No need to call registerTask - removed for v1.3.0 Lazy Polling

          let finalResult = fastResult;

          // Poll for result if not immediately available
          if (!finalResult && jobId) {
            const poll = async () => {
              while (true) {
                await new Promise(r => setTimeout(r, 2000));
                const status = await audioAnalysisService.getJobStatus(jobId);
                if (status.status === 'completed') {
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

          // Note: Server automatically registers this job in notifications system
          // No need to call registerTask - removed for v1.3.0 Lazy Polling

          let finalResult = fastResult;

          if (!finalResult && jobId) {
            const poll = async () => {
              while (true) {
                await new Promise(r => setTimeout(r, 2000));
                const status = await imageAnalysisService.getJobStatus(jobId);
                if (status.status === 'completed') {
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
                local_image_url: objectUrl,
                jobId // Preserve jobId in the result
              };
            } catch (e) {
              console.error("Failed to create object URL", e);
            }
          } else if (finalResult) {
            // Even if no file, preserve jobId
            finalResult = {
              ...finalResult,
              jobId
            };
          }

          stopFakeProgress();
          setResult(finalResult);
          setProgress(100);
          setStatus('complete');
        }
      } else {
        // --- TEXT/URL FLOW ---
        // If contentType is 'url', store the URL as fileName for display
        if (contentType === 'url' && content) {
          // Extract URL from content (in case content has extra text)
          const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch) {
            setFileName(urlMatch[0]);
          } else {
            setFileName(content);
          }
        }

        const textResult = await performTextAnalysis(content, transmissionMedium, (p: number) => {
          setProgress(p);
        });

        // Handling the new response type (Pending Job)
        // Note: Server automatically registers text analysis jobs in notifications system
        if (textResult && 'jobId' in textResult && textResult.status === 'pending') {
          setResult(textResult);
          setStatus('polling'); // Triggers success view (CaseRegisteredView) immediately as per logic
        } else {
          setResult(textResult);
          setStatus('complete');
        }
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
    if (!initialJobId || !initialJobType) return;

    const restoreJob = async () => {
      setStatus('polling');
      startFakeProgress();

      const check = async () => {
        try {
          let statusRes;
          let result;

          if (initialJobType === 'image_analysis') {
            statusRes = await imageAnalysisService.getJobStatus(initialJobId);
            if (statusRes.status === 'completed') {
              result = await imageAnalysisService.getAnalysisResult(initialJobId);
            }
          } else if (initialJobType === 'audio_analysis') {
            statusRes = await audioAnalysisService.getJobStatus(initialJobId);
            if (statusRes.status === 'completed') {
              result = await audioAnalysisService.getAudioAnalysisResult(initialJobId);
            }
          } else {
            // Basic text analysis doesn't have polling restoration in this hook
            setError("No se puede restaurar este tipo de análisis.");
            setStatus('error');
            stopFakeProgress();
            return;
          }

          if (statusRes.status === 'completed') {
            setResult(result);
            setStatus('complete');
            setProgress(100);
            stopFakeProgress();
          } else if (statusRes.status === 'failed') {
            setError(statusRes.error || 'Job failed');
            setStatus('error');
            stopFakeProgress();
          } else {
            // Still running, check again
            setProgress(prev => Math.min(90, prev + 10));
            setTimeout(check, POLLING_INTERVAL);
          }
        } catch (e) {
          console.error("Restoration error", e);
          setError("Failed to load job");
          setStatus('error');
          stopFakeProgress();
        }
      };
      check();
    };
    restoreJob();
  }, [initialJobId, initialJobType]);

  return { status, progress, result, error, fileName, fileSize, transmissionVector, originalContentType, submitContent, resetState, retryLastSubmission, retryCount };
}

