import { TEXT_ANALYSIS_BASE_URL } from '../lib/apiEndpoints';
import { JobResponse, AnalysisResult, TextAnalysisUIResult } from '../types/textAnalysis';
import { transformTextAnalysisToUI as centralizedTransform } from './analysisPresentationService';

/**
 * Submits text or URL for analysis using the AMI framework.
 */
export async function submitTextAnalysis(
    session: any,
    payload: { url?: string; text?: string; use_cache?: boolean }
): Promise<JobResponse> {
    const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error submitting analysis' }));
        throw new Error(error.error || 'Failed to submit analysis');
    }

    return response.json();
}

/**
 * Gets the status and result of a text analysis job.
 */
export async function getTextAnalysisStatus(
    session: any,
    jobId: string
): Promise<JobResponse> {
    const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/status/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error fetching status' }));
        throw new Error(error.error || 'Failed to fetch status');
    }

    return response.json();
}

/**
 * Transforms the raw API result into a structure suitable for the UI.
 * Delegates to the centralized logic in analysisPresentationService.
 */
export function transformTextAnalysisToUI(result: any): any {
    return centralizedTransform(result);
}

/**
 * Polls the job status until it's completed or failed.
 */
export async function pollTextAnalysis(
    session: any,
    jobId: string,
    onProgress?: (progress: any) => void,
    intervalMs: number = 2000,
    maxAttempts: number = 60 // 2 minutes
): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const job = await getTextAnalysisStatus(session, jobId);

        // Check for 'data' (StandardizedCase DTO) OR 'result' (Legacy/Image API pattern)
        const jobResult = job.data || job.result;

        if (job.status === 'completed' && jobResult) {
            return transformTextAnalysisToUI(jobResult);
        }

        if (job.status === 'failed') {
            throw new Error('Analysis job failed on server');
        }

        if (job.progress && onProgress) {
            onProgress(job.progress);
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
    }

    throw new Error('Analysis timed out');
}
