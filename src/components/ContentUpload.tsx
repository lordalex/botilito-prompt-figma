import React from 'react';
import { useContentUpload } from '../hooks/useContentUpload';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentUploadResult } from './ContentUploadResult';
import { ErrorManager } from './ErrorManager';

export function ContentUpload() {
  const { 
    status, 
    progress, 
    result, 
    error, 
    submitContent, 
    resetState, 
    retryLastSubmission 
  } = useContentUpload();

  if (status === 'error' && error) {
    return <ErrorManager error={error} onRetry={retryLastSubmission} onReset={resetState} />;
  }

  if (status === 'uploading' || status === 'polling') {
    return <ContentUploadProgress progress={progress} />;
  }
  
  if (status === 'complete' && result) {
    return <ContentUploadResult result={result} onReset={resetState} />;
  }

  return <ContentUploadForm onSubmit={submitContent} isSubmitting={status !== 'idle'} />;
}

