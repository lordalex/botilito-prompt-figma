/**
 * @file src/lib/apiService.ts
 * @description Centralized API service for all backend communication.
 */

import { supabase } from '../utils/supabase/client';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse, FullAnalysisResponse } from '../types/botilito';

const INGEST_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth-enriched';

/**
 * A helper function to perform authenticated fetch requests.
 * It retrieves the current session token from the Supabase client.
 */
async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Authentication error: No active session found.");
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

export const api = {
    ingestion: {
        submit: async (payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> => {
            return authenticatedFetch('/submit', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
        getStatus: async (jobId: string): Promise<JobStatusResponse> => {
            return authenticatedFetch(`/status/${jobId}`, {
                method: 'GET',
            });
        },
    },
};
