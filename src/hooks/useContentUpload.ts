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
        const originalFile = files[0];

        // Reconstruct the file object to work around potential environment/dev server issues
        console.log('[useContentUpload] Reconstructing File object to avoid potential environment issues.');
        const file = new File([originalFile], originalFile.name, { type: originalFile.type });

        setFileName(file.name);
        setFileSize(file.size);
        switch (contentType) {
          case 'audio': {
            // --- AUDIO FLOW (No Polling - Notifications handle status) ---
            console.log('[useContentUpload] Starting Audio Flow (Submit Only)');
            startFakeProgress();

            const { jobId, result: fastResult } = await audioAnalysisService.submitJob(file);
            console.log('[useContentUpload] Audio Job Submitted:', jobId);

            // Build result object with job metadata for informational display
            const audioResult: any = fastResult || {
              jobId,
              status: 'pending',
              type: 'audio_analysis',
              fileName: file.name,
              fileSize: file.size,
              submittedAt: new Date().toISOString(),
            };

            // Add local audio URL for playback preview
            try {
              const objectUrl = URL.createObjectURL(file);
              audioResult.local_audio_url = objectUrl;
            } catch (e) {
              console.error("Failed to create object URL for audio", e);
            }

            stopFakeProgress();
            setResult(audioResult);
            setProgress(100);
            setStatus('complete');
            break;
          }
          case 'video': 
          case 'imagen': {
            // --- IMAGE FLOW (No Polling - Notifications handle status) ---
            console.log('[useContentUpload] Starting Image Flow (Submit Only)');
            startFakeProgress();

            try {
              console.log('[useContentUpload] Awaiting imageAnalysisService.submitJob...');
              const { jobId, result: fastResult } = await imageAnalysisService.submitJob(file);
              console.log('[useContentUpload] Image Job Submitted:', jobId);

              // Build result object with job metadata for informational display
              const imageResult: any = fastResult || {
                jobId,
                status: 'pending',
                type: 'image_analysis',
                fileName: file.name,
                fileSize: file.size,
                submittedAt: new Date().toISOString(),
              };

              // Add local image URL for preview
              try {
                const objectUrl = URL.createObjectURL(file);
                imageResult.local_image_url = objectUrl;
                imageResult.jobId = jobId; // Preserve jobId
              } catch (e) {
                console.error("Failed to create object URL", e);
              }

              stopFakeProgress();
              setResult(imageResult);
              setProgress(100);
              setStatus('complete');
            } catch (imgErr) {
              console.error('[useContentUpload] Image Analysis Error:', imgErr);
              throw imgErr;
            }
            break;
          }
          default:
            console.warn(`[useContentUpload] Unexpected content type with file: ${contentType}`);
            throw new Error(`Tipo de contenido inesperado con archivo: ${contentType}`);
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
          setStatus('complete'); // Triggers success view (CaseRegisteredView) immediately as per logic
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

