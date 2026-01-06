import { useState, useEffect, useCallback } from 'react';
import { analysisPipeline, checkAnalysisStatusOnce } from '../lib/analysisPipeline';
import { useNotifications } from '@/providers/NotificationProvider';

export interface AnalysisPollingResult {
    analysisResult: { result: any, user_id: string } | null;
    isLoading: boolean;
    error: string | null;
    progress: { step: string; status: string; percent?: number };
    currentJobId: string | undefined;
    startNewAnalysis: (content: string) => Promise<void>;
    resetAnalysis: () => void;
}

export function useAnalysisPolling(initialJobId?: string): AnalysisPollingResult {
    const [analysisResult, setAnalysisResult] = useState<{ result: any, user_id: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!!initialJobId);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ step: string; status: string; percent?: number }>({ step: 'init', status: 'Iniciando...' });
    const [currentJobId, setCurrentJobId] = useState<string | undefined>(initialJobId);

    const { registerTask } = useNotifications();

    // Polling Effect
    useEffect(() => {
        if (!currentJobId || analysisResult) return;

        let pollingActive = true;
        const poll = async () => {
            try {
                const status = await checkAnalysisStatusOnce(currentJobId);
                if (!pollingActive) return;

                setProgress({
                    step: status.progress?.step || status.current_step || 'processing',
                    status: status.status,
                    percent: status.progress?.percent
                });

                if (status.status === 'completed' && status.result) {
                    setAnalysisResult({ result: status.result, user_id: status.user_id });
                    setIsLoading(false);
                    pollingActive = false;
                } else if (status.status === 'failed') {
                    setError(status.error?.message || 'Analysis failed during polling');
                    setIsLoading(false);
                    pollingActive = false;
                } else {
                    setTimeout(poll, 3000);
                }
            } catch (err) {
                console.error(err);
                setTimeout(poll, 3000);
            }
        };

        poll();
        return () => { pollingActive = false; };
    }, [currentJobId, analysisResult]);

    const startNewAnalysis = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analysisPipeline(
                content,
                (p) => setProgress(p),
                (jobId) => {
                    setCurrentJobId(jobId);
                    registerTask(jobId, 'text_analysis');
                }
            );
            setAnalysisResult(result);
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    }, [registerTask]);

    const resetAnalysis = useCallback(() => {
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        setCurrentJobId(undefined);
        setProgress({ step: 'init', status: 'Iniciando...' });
    }, []);

    return {
        analysisResult,
        isLoading,
        error,
        progress,
        currentJobId,
        startNewAnalysis,
        resetAnalysis
    };
}
