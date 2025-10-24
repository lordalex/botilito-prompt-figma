import React, { useState } from 'react';
import { performAnalysis } from '../services/contentAnalysisService';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';
import { ContentUploadForm } from './ContentUploadForm';
import { ContentUploadProgress } from './ContentUploadProgress';
import { ContentUploadResult } from './ContentUploadResult';
import { ErrorManager } from './ErrorManager';

export function ContentUpload() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  
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

    try {
      const result = await performAnalysis(content, transmissionMedium, (progress, status) => {
        setAnalysisProgress(progress);
      });
      setAiAnalysis(result);
      setAnalysisComplete(true);
    } catch (err: any) {
      setError({ message: err.message || 'Ocurrió un error desconocido durante el análisis.' });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAiAnalysis(null);
    setError(null);
    setAnalysisProgress(0);
    setLastSubmission(null);
  };

  const handleRetry = () => {
    if (lastSubmission) {
      handleStartAnalysis(
        lastSubmission.content,
        lastSubmission.files,
        lastSubmission.contentType,
        lastSubmission.transmissionMedium
      );
    }
  };

  if (error) {
    return <ErrorManager error={error} onRetry={handleRetry} onReset={handleReset} />;
  }

  if (isAnalyzing) {
    return <ContentUploadProgress progress={analysisProgress} />;
  }
  
  if (analysisComplete && aiAnalysis) {
    return (
      <ContentUploadResult 
        result={aiAnalysis} 
        onReset={handleReset} 
      />
    );
  }

  return <ContentUploadForm onSubmit={handleStartAnalysis} isSubmitting={isAnalyzing} />;
}
