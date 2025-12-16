import React from 'react';
import { useContentAnalysis } from '../hooks/useContentAnalysis';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentAnalysisView } from './ContentAnalysisView';
import { ImageAnalysisResultDisplay } from './ImageAnalysisResultDisplay';
import { ErrorManager } from './ErrorManager';

export function ContentUpload() {
  const {
    isAnalyzing,
    progress,
    analysisComplete,
    imageAnalysisComplete,
    error,
    aiAnalysis,
    imageAnalysisResult,
    lastSubmission,
    retryCount,
    handleStartAnalysis,
    handleReset,
    handleRetry
  } = useContentAnalysis();

  if (error) {
    return <ErrorManager error={error} onRetry={handleRetry} onReset={handleReset} retryCount={retryCount} />;
  }

  if (isAnalyzing) {
    return <ContentUploadProgress step={progress.step} status={progress.status} />;
  }
  
  if (imageAnalysisComplete && imageAnalysisResult) {
    return <ImageAnalysisResultDisplay result={imageAnalysisResult} onReset={handleReset} />;
  }

  if (analysisComplete && aiAnalysis) {
    return (
      <ContentAnalysisView 
        contentToAnalyze={lastSubmission.content}
        analysisResult={aiAnalysis}
        onAnalyzeAnother={handleReset}
      />
    );
  }

  return <ContentUploadForm onSubmit={handleStartAnalysis} isSubmitting={isAnalyzing} />;
}
