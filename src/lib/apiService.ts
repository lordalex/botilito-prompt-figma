


import { supabase } from '../utils/supabase/client';
import { Session } from '@supabase/supabase-js';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse as IngestJobStatusResponse, FullAnalysisResponse } from '../types/botilito';
import { Profile, ProfileUpdateInput, ConversionRequest, ConversionResponse, ProfileResponse } from '../types/profile';

const INGEST_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/text-analysis-DTO';
const IMAGE_ANALYSIS_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/image-analysis';
const PROFILE_API_BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/profileCRUD';

async function apiCall(url: string, options: RequestInit & { session: Session | null }): Promise<Response> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (options.session) {
        if (!options.session.access_token) {
            throw new Error("Authentication error: No access token found in session.");
        }
        headers.set('Authorization', `Bearer ${options.session.access_token}`);
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
        submit: async (session: Session | null, payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> => {
            const response = await apiCall(`${INGEST_API_BASE_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
                session,
            });
            return processResponse(response);
        },
        getStatus: async (session: Session | null, jobId: string): Promise<IngestJobStatusResponse> => {
            const response = await apiCall(`${INGEST_API_BASE_URL}/status/${jobId}`, {
                method: 'GET',
                session,
            });
            return processResponse(response);
        },
    },
    imageAnalysis: {
        submit: async (session: Session | null, imageBase64: string): Promise<Response> => {
            return apiCall(`${IMAGE_ANALYSIS_API_BASE_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify({ image_base64: imageBase64 }),
                session,
            });
        },
        getStatus: async (jobId: string): Promise<Response> => {
            return apiCall(`${IMAGE_ANALYSIS_API_BASE_URL}/status/${jobId}`, {
                method: 'GET',
                session: null, // As per existing implementation and OpenAPI spec
            });
        },
    },

    profile: {
        get: async (session: Session | null, id?: string): Promise<ProfileResponse> => {
            const url = id ? `${PROFILE_API_BASE_URL}?id=${id}` : PROFILE_API_BASE_URL;
            const response = await apiCall(url, {
                method: 'GET',
                session,
            });
            return processResponse(response);
        },
        update: async (session: Session | null, profileData: ProfileUpdateInput): Promise<{ message: string; data: Profile }> => {
            const response = await apiCall(PROFILE_API_BASE_URL, {
                method: 'PUT',
                body: JSON.stringify(profileData),
                session,
            });
            return processResponse(response);
        },
        convert: async (session: Session | null, conversionRequest: ConversionRequest): Promise<ConversionResponse> => {
            const response = await apiCall(`${PROFILE_API_BASE_URL}/convert`, {
                method: 'POST',
                body: JSON.stringify(conversionRequest),
                session,
            });
            return processResponse(response);
        }
    }

};
