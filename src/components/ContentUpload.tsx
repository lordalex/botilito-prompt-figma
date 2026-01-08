import { useContentUpload } from '../hooks/useContentUpload';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentUploadResult } from './ContentUploadResult';
import { CaseRegisteredView } from './CaseRegisteredView';
import { ErrorManager } from './ErrorManager';

interface ContentUploadProps {
  jobId?: string;
  jobType?: string;
  onReset?: () => void;
}

export function ContentUpload({ jobId, jobType, onReset }: ContentUploadProps) {
  const {
    status,
    progress,
    result,
    error,
    fileName,
    fileSize,
    transmissionVector,
    submitContent,
    resetState: internalReset,
    retryLastSubmission,
    retryCount,
  } = useContentUpload(jobId, jobType);

  const handleReset = () => {
    internalReset();
    onReset?.();
  };

  if (status === 'error' && error) {
    return (
      <ErrorManager
        error={error}
        onRetry={retryLastSubmission}
        onReset={handleReset}
        retryCount={retryCount}
      />
    );
  }

  // Mostrar vista de caso registrado automáticamente cuando el análisis está completo o en progreso (polling)
  // User requested to skip the loader/polling view and show success immediately after submission
  if ((status === 'complete' && result) || status === 'polling' || status === 'uploading') {
    // Determine info from result OR local state if result is pending
    const extractedFilename =
      fileName ||
      result?.file_info?.name ||
      result?.fullResult?.metadata?.file_name ||
      result?.fullResult?.metadata?.filename ||
      result?.fullResult?.details?.[0]?.insights?.[0]?.data?.filename ||
      result?.fullResult?.details?.[0]?.original ||
      undefined;

    // Use fileSize from hook (original File.size) as primary source
    const rawSize =
      fileSize ??
      result?.file_info?.size_bytes ??
      result?.fullResult?.metadata?.file_size ??
      result?.fullResult?.metadata?.size ??
      result?.fullResult?.details?.[0]?.insights?.[0]?.data?.size ??
      undefined;

    const extractedFileSize =
      rawSize !== undefined && rawSize !== null && rawSize > 0
        ? `${(Number(rawSize) / 1024).toFixed(2)} KB`
        : undefined;

    // Detect content type from various response structures or fallback to file extension
    const detectContentType = (): 'texto' | 'imagen' | 'video' | 'audio' | 'url' => {
      // If we are polling or uploading, we might not have result type yet, so guess from filename
      if ((status === 'polling' || status === 'uploading') && fileName) {
        const lowerName = fileName.toLowerCase();
        if (lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.avi')) return 'video';
        if (lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a') || lowerName.endsWith('.ogg')) return 'audio';
        if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png')) return 'imagen';
      }

      if (!result) return 'texto'; // Default fallback if no result and no filename (text)

      // Audio response structure: result.type === "audio_analysis" or "audio"
      if (result.type === 'audio_analysis' || result.type === 'audio') return 'audio';

      // Video response structure: check for original_video in raw_forensics or file_info
      if (
        result.file_info?.original_video_url ||
        result.raw_forensics?.[0]?.summary?.original_video ||
        result.type === 'video'
      ) {
        return 'video';
      }

      // Image response structure: result.file_info exists and has data
      if (result.file_info && result.file_info.name && result.file_info.name !== 'image.jpg') return 'imagen';

      // Text analysis structure: result.fullResult.submission_type
      const submissionType = result.fullResult?.submission_type?.toLowerCase();
      if (submissionType) return submissionType as 'texto' | 'imagen' | 'video' | 'audio' | 'url';

      // Fallback: check result.type directly
      if (result.type && ['texto', 'imagen', 'video', 'audio', 'url'].includes(result.type)) {
        return result.type as 'texto' | 'imagen' | 'video' | 'audio' | 'url';
      }

      // Default fallback
      return 'imagen';
    };

    const detectedType = detectContentType();

    const caseData = {
      caseCode:
        result?.caseNumber ||
        result?.fullResult?.displayId ||
        `PENDING-${new Date().toISOString().slice(11, 19).replace(/:/g, '')}`, // Temp ID if polling
      createdAt: result?.fullResult?.created_at || result?.meta?.timestamp || new Date().toISOString(),
      contentType: detectedType,
      analysisType: result?.theme || (detectedType === 'texto' ? 'Desinfodémico' : 'Forense'),
      fileName: extractedFilename,
      fileSize: extractedFileSize,
      vector: transmissionVector || result?.vectores?.[0] || result?.fullResult?.metadata?.vector || 'Telegram',
    };

    return <CaseRegisteredView caseData={caseData} onReportAnother={handleReset} jobId={result?.jobId} />;
  }

  // Loader view is now effectively bypassed by the logic above. 
  // We keep this block only as a theoretical fallback or for states not covered (though currently covered).
  // If we wanted to remove it completely:
  /* 
  if (status === 'uploading' || status === 'polling') {
    return <ContentUploadProgress ... />;
  } 
  */


  return <ContentUploadForm onSubmit={submitContent} isSubmitting={status !== 'idle'} />;
}
