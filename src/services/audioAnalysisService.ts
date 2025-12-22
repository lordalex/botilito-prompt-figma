import { supabase } from '@/utils/supabase/client';
import { AUDIO_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import {
    AudioAnalysisResult,
    AudioJobStatusResponse,
    AudioApiAnalysisResult,
} from '@/types/audioAnalysis';

const POLLING_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 90; // 4.5 minutes max for audio processing

/**
 * Convert audio file to Base64 string
 */
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Poll job status until completion
 */
async function pollJobStatus(jobId: string, token: string, file?: File): Promise<AudioAnalysisResult> {
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
        attempts++;

        const response = await fetch(`${AUDIO_ANALYSIS_BASE_URL}/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 404 && attempts < 5) continue;
            throw new Error(`Polling failed: ${response.status}`);
        }

        const data: AudioJobStatusResponse = await response.json();

        if (data.status === 'completed') {
            const apiResult = data.result || data.payload;

            if (apiResult) {
                // Map the API result to the UI result type
                const forensics = apiResult?.metadata?.analysis?.forensics;
                const confidenceScore = forensics?.confidence_score; // API score is 0-100

                const finalResult: AudioAnalysisResult = {
                    type: 'audio_analysis',
                    meta: {
                        job_id: data.id,
                        timestamp: data.created_at || new Date().toISOString(),
                        status: data.status,
                    },
                    assets: apiResult?.metadata?.assets,
                    file_info: file ? {
                        name: file.name,
                        size_bytes: file.size,
                        mime_type: file.type,
                        duration_seconds: apiResult?.metadata?.duration || 0,
                        created_at: new Date().toISOString()
                    } : undefined,
                    human_report: {
                        summary: apiResult?.content,
                        transcription: {
                            text: apiResult?.transcription,
                        },
                        audio_forensics: {
                            authenticity_score: confidenceScore ? (100 - confidenceScore) / 100 : 1, // Inverted and normalized to 0-1
                            manipulation_detected: forensics?.is_synthetic || false,
                            anomalies: forensics?.explanation ? [forensics.explanation] : [],
                        },
                        verdict: {
                            conclusion: forensics?.is_synthetic
                                ? `Se detectó manipulación (${forensics.manipulation_type})`
                                : apiResult?.content || 'No se detectó manipulación.', // Use main content as fallback
                            confidence: confidenceScore ? confidenceScore / 100 : 0, // Normalized to 0-1
                            risk_level: 'medium', // This could be improved
                        }
                    },
                    raw_results_summary: {
                        duration_seconds: apiResult?.metadata?.duration,
                    }
                };
                return finalResult;
            }
        }

        if (data.status === 'failed') {
            throw new Error(data.error?.message || 'Audio analysis failed');
        }
    }

    throw new Error('Audio analysis timed out');
}

export const audioAnalysisService = {
    /**
     * Submit audio file for analysis
     * Returns job ID for async processing
     */
    submitJob: async (file: File): Promise<{ jobId?: string; result?: AudioAnalysisResult }> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        // Convert audio file to base64 (same pattern as image analysis)
        const base64 = await convertFileToBase64(file);

        const useCache = import.meta.env.VITE_USE_CACHE === 'true';

        const response = await fetch(`${AUDIO_ANALYSIS_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                audio_base64: base64,
                use_cache: useCache
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Submission failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'completed' && data.result) {
            // Job completed synchronously, transform the result now.
            const apiResult = data.result;
            const forensics = apiResult?.metadata?.analysis?.forensics;
            const confidenceScore = forensics?.confidence_score; // API score is 0-100

            const finalResult: AudioAnalysisResult = {
                type: 'audio_analysis',
                meta: {
                    job_id: apiResult.id, // use id from result object
                    timestamp: apiResult.created_at || new Date().toISOString(),
                    status: data.status,
                },
                assets: apiResult?.metadata?.assets,
                file_info: file ? {
                    name: file.name,
                    size_bytes: file.size,
                    mime_type: file.type,
                    duration_seconds: apiResult?.metadata?.duration || 0,
                    created_at: new Date().toISOString()
                } : undefined,
                human_report: {
                    summary: apiResult?.content,
                    transcription: {
                        text: apiResult?.transcription,
                    },
                    audio_forensics: {
                        authenticity_score: confidenceScore ? (100 - confidenceScore) / 100 : 1, // Inverted and normalized to 0-1
                        manipulation_detected: forensics?.is_synthetic || false,
                        anomalies: forensics?.explanation ? [forensics.explanation] : [],
                    },
                    verdict: {
                        conclusion: forensics?.is_synthetic
                            ? `Se detectó manipulación (${forensics.manipulation_type})`
                            : apiResult?.content || 'No se detectó manipulación.', // Use main content as fallback
                        confidence: confidenceScore ? confidenceScore / 100 : 0, // Normalized to 0-1
                        risk_level: 'medium', // This could be improved
                    }
                },
                raw_results_summary: {
                    duration_seconds: apiResult?.metadata?.duration,
                }
            };
            return { jobId: apiResult.id, result: finalResult };
        }

        return { jobId: data.job_id };
    },

    /**
     * Submit audio and wait for result (blocking)
     */
    submitAudio: async (file: File): Promise<AudioAnalysisResult> => {
        const { jobId } = await audioAnalysisService.submitJob(file);
        if (!jobId) throw new Error("No Job ID returned");

        const { data: { session } } = await supabase.auth.getSession();
        return await pollJobStatus(jobId, session?.access_token || '', file);
    },

    /**
     * Get job status by ID
     */
    getJobStatus: async (jobId: string): Promise<AudioJobStatusResponse> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch(`${AUDIO_ANALYSIS_BASE_URL}/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        return await response.json();
    },

    /**
     * Get completed analysis result
     */
    getAudioAnalysisResult: async (jobId: string): Promise<AudioAnalysisResult> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');
        
        // We need to poll to get the final result
        return await pollJobStatus(jobId, session.access_token);
    }
};
