import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { performAnalysisWithPipeline } from '../services/contentAnalysisService';
import { performImageAnalysis } from '../services/imageAnalysisService';
import type { AnalysisResult as ImageAnalysisResult } from '../services/imageAnalysisTypes';
import { ContentType, TransmissionVector } from '../utils/caseCodeGenerator';

export const useContentAnalysis = () => {
    const { session } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState<{ step: string; status: string }>({ step: '', status: '' });
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [imageAnalysisComplete, setImageAnalysisComplete] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResult | null>(null);
    const [lastSubmission, setLastSubmission] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleStartAnalysis = async (
        content: string,
        files: File[],
        contentType: ContentType,
        transmissionMedium: TransmissionVector
    ) => {
        setLastSubmission({ content, files, contentType, transmissionMedium });
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setImageAnalysisComplete(false);
        setError(null);
        setAiAnalysis(null);
        setImageAnalysisResult(null);
        setRetryCount(0);

        try {
            if (files && files.length > 0 && files[0].type.startsWith('image/')) {
                // Handle Image Analysis
                const imageFile = files[0];
                const imageBase64 = await fileToBase64(imageFile);
                setProgress({ step: 'image_analysis', status: 'Analizando imagen...' });
                const result = await performImageAnalysis(session, imageBase64);
                setImageAnalysisResult(result);
                setImageAnalysisComplete(true);
            } else {
                // Handle Text/URL Analysis
                const result = await performAnalysisWithPipeline(content, (progressUpdate) => {
                    setProgress(progressUpdate);
                });
                setAiAnalysis(result);
                setAnalysisComplete(true);
            }
        } catch (err: any) {
            setError({ message: err.message || 'Ocurrió un error desconocido durante el análisis.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setIsAnalyzing(false);
        setAnalysisComplete(false);
        setImageAnalysisComplete(false);
        setAiAnalysis(null);
        setImageAnalysisResult(null);
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

    return {
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
    };
};
