/**
 * @file src/services/api.ts
 * @description Centralized API service for all backend communication.
 */

import type { Session } from '@supabase/supabase-js';
import * as apiEndpoints from '../lib/apiEndpoints';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse, FullAnalysisResponse, UserProfileData, DispatchResponse, AdminJobResult } from '../types';

/**
 * A generic and robust fetch client for making authenticated requests to Supabase functions.
 * @param session - The active Supabase session.
 * @param url - The full URL of the API endpoint.
 * @param options - Standard fetch options.
 * @returns A promise that resolves to the JSON response.
 */
async function fetchClient(session: Session | null, url: string, options: RequestInit = {}): Promise<any> {
    if (!session?.access_token) {
        throw new Error("Authentication error: No access token provided.");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        headers,
        cache: options.method === 'GET' ? 'no-store' : 'default',
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `HTTP Error: ${response.status} ${response.statusText}`
            }));
            const errorMessage = errorData.error || errorData.data?.error || 'An unknown API error occurred.';
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }

        return {}; // Return empty object for non-json responses
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * The main API service object, organized by resource.
 */
export const api = {
    ingestion: {
        submit: (session: Session, payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> =>
            fetchClient(session, `${apiEndpoints.SEARCH_DTO_BASE_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        search: (session: Session, query: string, page: number = 1, pageSize: number = 10): Promise<JobAcceptedResponse> =>
            fetchClient(session, apiEndpoints.SEARCH_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({ query, page, pageSize }),
            }),
        getStatus: (session: Session, jobId: string): Promise<any> =>
            fetchClient(session, `${apiEndpoints.SEARCH_DTO_BASE_URL}/status/${jobId}`),
    },
    profile: {
        get: async (session: Session): Promise<ProfileResponse> => {
            const response = await fetchClient(session, apiEndpoints.PROFILE_API_URL);

            // Adapter to map Spanish field names from the backend to English field names used in the frontend.
            if (response.data) {
                const mappedData = {
                    ...response.data,
                    full_name: response.data.nombre_completo,
                    phone_number: response.data.numero_telefono,
                    city: response.data.ciudad,
                    state_province: response.data.departamento,
                    birth_date: response.data.fecha_nacimiento,
                };
                // It's good practice to delete the old keys to avoid confusion.
                delete mappedData.nombre_completo;
                delete mappedData.numero_telefono;
                delete mappedData.ciudad;
                delete mappedData.departamento;
                delete mappedData.fecha_nacimiento;
                response.data = mappedData;
            }

            return response;
        },
        getById: async (session: Session, userId: string): Promise<ProfileResponse> => {
            const response = await fetchClient(session, `${apiEndpoints.PROFILE_API_URL}?id=${userId}`);
            // Adapter to map Spanish field names from the backend to English field names used in the frontend.
            if (response.data) {
                const mappedData = {
                    ...response.data,
                    full_name: response.data.nombre_completo,
                    phone_number: response.data.numero_telefono,
                    city: response.data.ciudad,
                    state_province: response.data.departamento,
                    birth_date: response.data.fecha_nacimiento,
                };
                // It's good practice to delete the old keys to avoid confusion.
                delete mappedData.nombre_completo;
                delete mappedData.numero_telefono;
                delete mappedData.ciudad;
                delete mappedData.departamento;
                delete mappedData.fecha_nacimiento;
                response.data = mappedData;
            }
            return response;
        },

        update: (session: Session, profileData: Partial<UserProfileData>): Promise<{ message: string; data: Profile }> => {
            // Adapter to map English field names from the frontend to Spanish field names for the backend.
            const mappedData: any = {};
            if (profileData.full_name) mappedData.nombre_completo = profileData.full_name;
            if (profileData.phone_number) mappedData.numero_telefono = profileData.phone_number;
            if (profileData.city) mappedData.ciudad = profileData.city;
            if (profileData.state_province) mappedData.departamento = profileData.state_province;
            if (profileData.birth_date) mappedData.fecha_nacimiento = profileData.birth_date;
            if (profileData.photo) mappedData.photo = profileData.photo;
            if (profileData.avatar) mappedData.avatar = profileData.avatar;


            return fetchClient(session, apiEndpoints.PROFILE_API_URL, {
                method: 'PUT',
                body: JSON.stringify(mappedData),
            });
        },
        create: (session: Session, profileData: UserProfileData): Promise<{ message: string; data: Profile }> =>
            fetchClient(session, apiEndpoints.PROFILE_API_URL, {
                method: 'PUT', // Using PUT for upsert
                body: JSON.stringify(profileData),
            }),
    },
    voting: {
        submit: (session: Session, payload: { case_id: string; classification: string; reason?: string; evidence_url?: string; metadata?: any; }): Promise<{ job_id: string }> =>
            fetchClient(session, `${apiEndpoints.VOTE_API_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        getStatus: (session: Session, jobId: string): Promise<any> =>
            fetchClient(session, `${apiEndpoints.VOTE_API_URL}/status/${jobId}`),
    },
    humanVerification: {
        getSummary: (session: Session, page: number, pageSize: number): Promise<any> => {
            const url = new URL(apiEndpoints.SUMMARY_ENDPOINT);
            url.searchParams.set('page', String(page));
            url.searchParams.set('pageSize', String(pageSize));
            return fetchClient(session, url.toString(), {
                method: 'POST',
            });
        },
        getCaseDetails: (session: Session, caseId: string): Promise<any> =>
            fetchClient(session, apiEndpoints.LOOKUP_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({ identifier: caseId }),
            }),
        submitJob: (session: Session, submission: { caseId: string; labels: string[]; notes?: string; }): Promise<{ job_id: string }> => {
            const payload = {
                case_id: submission.caseId,
                classification: submission.labels[0],
                reason: submission.notes
            };
            return fetchClient(session, apiEndpoints.VOTE_SUBMIT_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        }
    },
    webSnapshot: {
        get: (session: Session, url: string): Promise<any> =>
            fetchClient(session, `${apiEndpoints.WEB_SNAPSHOT_URL}?url=${encodeURIComponent(url)}`),
    },
    imageAnalysis: {
        submit: (session: Session | null, imageBase64: string): Promise<Response> => {
            if (!session?.access_token) {
                throw new Error("Authentication error: No access token provided.");
            }
            return fetch(`${apiEndpoints.IMAGE_ANALYSIS_BASE_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ image_base64: imageBase64 }),
            });
        },
        getStatus: (jobId: string): Promise<Response> => {
            // This endpoint does not require authentication as per documentation (jobId is secret)
            return fetch(`${apiEndpoints.IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`);
        },
    },
    immunization: {
        submit: (session: Session, payload: { case_id: string; name: string; description: string; resources?: any[] }): Promise<{ job_id: string }> =>
            fetchClient(session, `${apiEndpoints.IMMUNIZATION_API_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        getStatus: (session: Session, jobId: string): Promise<JobStatusResponse> =>
            fetchClient(session, `${apiEndpoints.IMMUNIZATION_API_URL}/status/${jobId}`),
    },
    admin: {
        dispatch: (session: Session, payload: { type: string; payload?: any }): Promise<DispatchResponse> =>
            fetchClient(session, `${apiEndpoints.ADMIN_DASHBOARD_URL}/dispatch`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        getStatus: (session: Session, jobId: string): Promise<AdminJobResult> =>
            fetchClient(session, `${apiEndpoints.ADMIN_DASHBOARD_URL}/status/${jobId}`),
    },
};
