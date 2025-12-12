import React, { useState } from 'react';
import { performAnalysisWithPipeline } from '../services/contentAnalysisService';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentAnalysisView } from './ContentAnalysisView';
import { ErrorManager } from './ErrorManager';

export function ContentUpload() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ step: string; status: string }>({ step: '', status: '' });
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const handleStartAnalysis = async (
    content: string, 
    files: File[], 
    contentType: ContentType, 
    transmissionMedium: TransmissionVector
  ) => {
    setLastSubmission({ content, files, contentType, transmissionMedium });
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);
    setAiAnalysis(null);
    setRetryCount(0);

    try {
      const result = await performAnalysisWithPipeline(content, (progressUpdate) => {
        setProgress(progressUpdate);
      });
      setAiAnalysis(result);
      setAnalysisComplete(true);
    } catch (err: any) {
      setError({ message: err.message || 'Ocurrió un error desconocido durante el análisis.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAiAnalysis(null);
    setError(null);
    setProgress({ step: '', status: '' });
    setLastSubmission(null);
    setRetryCount(0);
  };

  const handleRetry = () => {
    if (lastSubmission && retryCount < 3) {
      setRetryCount(retryCount + 1);
      handleStartAnalysis(
        lastSubmission.content,
        lastSubmission.files,
        lastSubmission.contentType,
        lastSubmission.transmissionMedium
      );
    }
  };

  if (error) {
    return <ErrorManager error={error} onRetry={handleRetry} onReset={handleReset} retryCount={retryCount} />;
  }

  if (isAnalyzing) {
    return <ContentUploadProgress step={progress.step} status={progress.status} />;
  }
  
  if (analysisComplete && aiAnalysis) {
    return (
      <ContentAnalysisView 
        contentToAnalyze={lastSubmission.content}
        analysisResult={aiAnalysis}
      />
    );
  }

  return <ContentUploadForm onSubmit={handleStartAnalysis} isSubmitting={isAnalyzing} />;
}
