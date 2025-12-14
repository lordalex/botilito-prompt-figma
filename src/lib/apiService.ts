
import { supabase } from '../utils/supabase/client';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse as IngestJobStatusResponse, FullAnalysisResponse } from '../types/botilito';

const INGEST_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth-enriched';
const IMAGE_ANALYSIS_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/image-analysis';

async function apiCall(url: string, options: RequestInit & { authenticate: boolean }): Promise<Response> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (options.authenticate) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error("Authentication error: No active session found.");
        }
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    const config: RequestInit = {
        ...options,
        headers,
        cache: options.method === 'GET' ? 'no-store' : 'default',
    };

    return fetch(url, config);
}

async function processResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.error || `An unknown API error occurred.`);
    }
    return response.json();
}

export const api = {
    ingestion: {
        submit: async (payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> => {
            const response = await apiCall(`${INGEST_API_BASE_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
                authenticate: true,
            });
            return processResponse(response);
        },
        getStatus: async (jobId: string): Promise<IngestJobStatusResponse> => {
            const response = await apiCall(`${INGEST_API_BASE_URL}/status/${jobId}`, {
                method: 'GET',
                authenticate: true,
            });
            return processResponse(response);
        },
    },
    imageAnalysis: {
        submit: async (imageBase64: string): Promise<Response> => {
            return apiCall(`${IMAGE_ANALYSIS_API_BASE_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify({ image_base64: imageBase64 }),
                authenticate: true,
            });
        },
        getStatus: async (jobId: string): Promise<Response> => {
            return apiCall(`${IMAGE_ANALYSIS_API_BASE_URL}/status/${jobId}`, {
                method: 'GET',
                authenticate: false, // As per existing implementation and OpenAPI spec
            });
        },
    }
};