import { supabase } from '@/utils/supabase/client';
import { AUDIO_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import {
    AudioAnalysisResult,
    AudioJobStatusResponse,
    AudioFileInfo,
    ChainOfCustodyEvent
} from '@/types/audioAnalysis';

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 90; // 3 minutes max for audio processing

/**
 * Convert audio file to Base64
 */
export const convertAudioToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Enrich audio analysis result with client-side data
 */
function enrichAudioResult(result: AudioAnalysisResult, file?: File): AudioAnalysisResult {
    // Add chain of custody if missing
    if (!result.chain_of_custody || result.chain_of_custody.length === 0) {
        result.chain_of_custody = [
            {
                timestamp: result.meta.timestamp,
                action: "Audio recibido",
                actor: "Sistema Botilito",
                details: "Archivo de audio cargado y procesamiento iniciado.",
                hash: "pending-hash"
            },
            {
                timestamp: new Date().toISOString(),
                action: "Análisis completado",
                actor: "Motor de Análisis de Audio",
                details: "Transcripción, análisis forense y verificación completados."
            }
        ];
    }

    // Add file info if missing
    if (!result.file_info && file) {
        result.file_info = {
            name: file.name,
            size_bytes: file.size,
            mime_type: file.type,
            duration_seconds: 0, // Will be filled by backend
            created_at: new Date().toISOString()
        };
    }

    return result;
}

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

        if (data.status === 'completed' && data.result) {
            return enrichAudioResult(data.result, file);
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

        // Convert audio to base64 (same pattern as image analysis)
        const base64 = await convertAudioToBase64(file);

        const response = await fetch(`${AUDIO_ANALYSIS_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                audio_base64: base64,
                type: 'audio'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Submission failed: ${response.status}`);
        }

        const data = await response.json();
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
        const status = await audioAnalysisService.getJobStatus(jobId);
        if (status.status === 'completed' && status.result) {
            return enrichAudioResult(status.result);
        }
        throw new Error(`Job not complete (Status: ${status.status})`);
    }
};
