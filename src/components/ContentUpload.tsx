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

  // Mostrar vista de caso registrado automáticamente cuando el análisis está completo
  if (status === 'complete' && result) {
    // Extraer datos del resultado para el CaseRegisteredView
    // Helper: try several places where backend may put filename/size
    const extractedFilename =
      fileName ||
      result.file_info?.name ||
      result.fullResult?.metadata?.file_name ||
      result.fullResult?.metadata?.filename ||
      result.fullResult?.details?.[0]?.insights?.[0]?.data?.filename ||
      result.fullResult?.details?.[0]?.original ||
      undefined;

    // Use fileSize from hook (original File.size) as primary source
    const rawSize =
      fileSize ??
      result.file_info?.size_bytes ??
      result.fullResult?.metadata?.file_size ??
      result.fullResult?.metadata?.size ??
      result.fullResult?.details?.[0]?.insights?.[0]?.data?.size ??
      undefined;

    const extractedFileSize =
      rawSize !== undefined && rawSize !== null && rawSize > 0
        ? `${(Number(rawSize) / 1024).toFixed(2)} KB`
        : undefined;

    // Detect content type from various response structures
    const detectContentType = (): 'texto' | 'imagen' | 'video' | 'audio' | 'url' => {
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

    const caseData = {
      caseCode:
        result.caseNumber ||
        result.fullResult?.displayId ||
        `I-TL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
          .toString(36)
          .substring(2, 5)
          .toUpperCase()}`,
      createdAt: result.fullResult?.created_at || result.meta?.timestamp || new Date().toISOString(),
      contentType: detectContentType(),
      analysisType: result.theme || 'Forense',
      fileName: extractedFilename,
      fileSize: extractedFileSize,
      vector: transmissionVector || result.vectores?.[0] || result.fullResult?.metadata?.vector || 'Telegram',
    };

    return <CaseRegisteredView caseData={caseData} onReportAnother={handleReset} />;
  }

  if (status === 'uploading' || status === 'polling') {
    return (
      <ContentUploadProgress
        progress={progress}
        step="Procesando"
        status="Extrayendo metadatos y características..."
        fileName={fileName}
      />
    );
  }

  return <ContentUploadForm onSubmit={submitContent} isSubmitting={status !== 'idle'} />;
}
