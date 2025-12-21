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
            // This now correctly waits for the entire polling process to complete
            const result = await imageAnalysisService.submitImage(file);

            // Inject local preview URL for immediate display
            let finalResult = result;
            try {
                const objectUrl = URL.createObjectURL(file);
                finalResult = { ...result, local_image_url: objectUrl };
            } catch (e) {
                console.error("Failed to create object URL for preview", e);
            }

            setData(finalResult);

        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'An unknown error occurred during image analysis.');
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
