import React from 'react';
import { useContentUpload } from '../hooks/useContentUpload';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentUploadResult } from './ContentUploadResult';
import { ErrorManager } from './ErrorManager';

interface ContentUploadProps {
  jobId?: string;
  onReset?: () => void;
}

export function ContentUpload({ jobId, onReset }: ContentUploadProps) {
  const {
    status,
    progress,
    result,
    error,
    submitContent,
    resetState: internalReset,
    retryLastSubmission,
    retryCount
  } = useContentUpload(jobId);

  const handleReset = () => {
    internalReset();
    onReset?.();
  };

  if (status === 'error' && error) {
    return <ErrorManager error={error} onRetry={retryLastSubmission} onReset={handleReset} retryCount={retryCount} />;
  }

  if (status === 'uploading' || status === 'polling') {
    return <ContentUploadProgress progress={progress} step="Procesando" status="Analizando contenido..." />;
  }

  if (status === 'complete' && result) {
    return <ContentUploadResult result={result} onReset={handleReset} />; // Pass handleReset to clear App state too
  }

  return <ContentUploadForm onSubmit={submitContent} isSubmitting={status !== 'idle'} />;
}

