/**
 * @file lib/apiService.ts
 * @description Centralized API service for all backend communication.
 * This service abstracts the details of fetch calls, authentication headers,
 * and endpoint URLs from the UI components.
 */

import type { Session } from '@supabase/auth-helpers-nextjs';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse, FullAnalysisResponse } from '@/types/botilito';

// The base URL for the Supabase ingestion function, taken from the figma-design prototype.
const INGEST_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth-enriched';

/**
 * A helper function to perform authenticated fetch requests to Supabase functions.
 * @param {Session} session - The active Supabase session containing the access token.
 * @param {string} endpoint - The specific API endpoint to call.
 * @param {RequestInit} options - Standard fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 * @throws Will throw an error if the session is invalid or the network request fails.
 */
async function authenticatedFetch(session: Session, endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!session.access_token) {
        throw new Error("Authentication error: No access token provided.");
    }

    const response = await fetch(`${INGEST_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.error || `An unknown API error occurred.`);
    }

    return response.json();
}

/**
 * The main API service object, organized by resource (e.g., ingestion, voting).
 */
export const api = {
    /**
     * Ingestion-related API calls.
     */
    ingestion: {
        /**
         * Submits content (URL or text) for analysis.
         * @param {Session} session - The user's active session.
         * @param {IngestPayload} payload - The content to be analyzed.
         * @returns {Promise<JobAcceptedResponse | FullAnalysisResponse>} Returns a job object if asynchronous,
         * or the full analysis if the result was cached and returned immediately.
         */
        submit: async (session: Session, payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> => {
            return authenticatedFetch(session, '/submit', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },

        /**
         * Fetches the status of a specific analysis job.
         * @param {Session} session - The user's active session.
         * @param {string} jobId - The ID of the job to check.
         * @returns {Promise<JobStatusResponse>} The current status and result (if completed) of the job.
         */
        getStatus: async (session: Session, jobId: string): Promise<JobStatusResponse> => {
            return authenticatedFetch(session, `/status/${jobId}`, {
                method: 'GET',
            });
        },
    },
    // Future API resources like 'voting' or 'crud' can be added here.
    crud: {},
    voting: {},
};
