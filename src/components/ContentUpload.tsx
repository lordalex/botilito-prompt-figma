import React, { useState } from 'react';
import { useContentUpload } from '../hooks/useContentUpload';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentUploadResult } from './ContentUploadResult';
import { ErrorManager } from './ErrorManager';

interface ContentUploadProps {
  jobId?: string;
  jobType?: string;
  onReset?: () => void;
  mode?: 'ai' | 'human';
}

export function ContentUpload({ jobId, jobType, onReset, mode }: ContentUploadProps) {
  const [showResult, setShowResult] = useState(false);
  const {
    status,
    progress,
    jobStep,
    result,
    error,
    fileName,
    submitContent,
    resetState: internalReset,
    retryLastSubmission,
    retryCount
  } = useContentUpload(jobId, jobType);

  const currentMode = mode || 'ai';

  const handleReset = () => {
    internalReset();
    setShowResult(false);
    onReset?.();
  };

  const handleViewResult = () => {
    // Mostrar el resultado cuando el usuario hace clic
    setShowResult(true);
  };

  if (status === 'error' && error) {
    return <ErrorManager error={error} onRetry={retryLastSubmission} onReset={handleReset} retryCount={retryCount} />;
  }

  if (status === 'uploading' || status === 'polling' || (status === 'complete' && !showResult)) {
    return (
      <ContentUploadProgress
        progress={progress}
        step={jobStep || "Procesando"}
        status={jobStep === 'Analyzing' ? "Botilito está analizando la veracidad..." : "Extrayendo metadatos y características..."}
        fileName={fileName}
        onViewResult={handleViewResult}
      />
    );
  }

  if (status === 'complete' && result && showResult) {
    return <ContentUploadResult result={result} onReset={handleReset} mode={currentMode} />; // Pass handleReset to clear App state too
  }

  return <ContentUploadForm onSubmit={submitContent} isSubmitting={status !== 'idle'} />;
}

