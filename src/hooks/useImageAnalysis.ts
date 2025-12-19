import { useState } from 'react';
import { AnalysisResult } from '@/types/imageAnalysis';
import { imageAnalysisService } from '@/services/imageAnalysisService';

interface UseImageAnalysisReturn {
    analyzeImage: (file: File) => Promise<void>;
    data: AnalysisResult | null;
    loading: boolean;
    error: string | null;
    reset: () => void;
}

export const useImageAnalysis = (): UseImageAnalysisReturn => {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeImage = async (file: File) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await imageAnalysisService.submitImage(file);
            setData(result);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'Error analyzing image');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    return {
        analyzeImage,
        data,
        loading,
        error,
        reset
    };
};
