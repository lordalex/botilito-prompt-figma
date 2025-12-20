import { useState } from 'react';
import { AnalysisResult } from '@/types/imageAnalysis';
import { imageAnalysisService } from '@/services/imageAnalysisService';
import { useNotifications } from '@/providers/NotificationProvider';

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
    const { registerTask } = useNotifications();

    const analyzeImage = async (file: File) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const initialResult = await imageAnalysisService.submitImage(file);
            let result = initialResult;

            if (result) {
                // Inject local preview
                try {
                    const objectUrl = URL.createObjectURL(file);
                    result = { ...result, local_image_url: objectUrl };
                } catch (e) {
                    console.error("Failed to create object URL", e);
                }
                setData(result);
            }

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
