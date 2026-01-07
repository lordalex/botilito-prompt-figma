/**
 * @file src/services/api.ts
 * @description Centralized API service for all backend communication.
 */

import type { Session } from '@supabase/supabase-js';
import * as apiEndpoints from '../lib/apiEndpoints';
import type { IngestPayload, FullAnalysisResponse, UserProfileData, DispatchResponse, AdminJobResult, VoteJobAcceptedResponse as JobAcceptedResponse, VoteJobStatusResponse as JobStatusResponse } from '../types';
import type { ProfileResponse, UpdateProfileResponse, Profile } from '../types/profile';

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
        /**
         * Get current user's profile (v1.2.0)
         * Maps Spanish field names from backend to English for frontend use.
         */
        get: async (session: Session): Promise<ProfileResponse> => {
            const response = await fetchClient(session, apiEndpoints.PROFILE_API_URL);

            // Adapter: Map Spanish fields (v1.2.0) to legacy English field names for backward compatibility
            if (response.data) {
                const mappedData = {
                    ...response.data,
                    // Map v1.2.0 Spanish fields to legacy English fields
                    full_name: response.data.nombre_completo,
                    city: response.data.ciudad,
                    state_province: response.data.departamento,
                    // Preserve new v1.2.0 fields
                    current_streak: response.data.current_streak || 0,
                    profile_rewarded: response.data.profile_rewarded || false,
                };
                response.data = mappedData;
            }

            return response;
        },
        /**
         * Get another user's profile by ID (v1.2.0)
         */
        getById: async (session: Session, userId: string): Promise<ProfileResponse> => {
            const response = await fetchClient(session, `${apiEndpoints.PROFILE_API_URL}?id=${userId}`);

            // Adapter: Map Spanish fields (v1.2.0) to legacy English field names
            if (response.data) {
                const mappedData = {
                    ...response.data,
                    full_name: response.data.nombre_completo,
                    city: response.data.ciudad,
                    state_province: response.data.departamento,
                    current_streak: response.data.current_streak || 0,
                    profile_rewarded: response.data.profile_rewarded || false,
                };
                response.data = mappedData;
            }
            return response;
        },

        /**
         * Update user profile (v1.2.0)
         * 
         * Gamification: If nombre_completo, departamento, and ciudad are provided
         * for the first time, backend awards +50 XP and sets profile_rewarded=true.
         * 
         * Response includes reward_awarded: boolean if bonus was triggered.
         */
        update: (session: Session, profileData: Partial<UserProfileData>): Promise<UpdateProfileResponse> => {
            // Adapter: Map English fields (frontend) to Spanish fields (v1.2.0 API)
            const mappedData: any = {};

            // v1.2.0 required fields for gamification rewards
            if (profileData.full_name) mappedData.nombre_completo = profileData.full_name;
            if (profileData.state_province) mappedData.departamento = profileData.state_province;
            if (profileData.city) mappedData.ciudad = profileData.city;

            // Avatar (photo/avatar both map to avatar_url in v1.2.0)
            if (profileData.photo) mappedData.avatar_url = profileData.photo;
            if (profileData.avatar) mappedData.avatar_url = profileData.avatar;

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
        /**
         * Submit a human vote for a case. (v1.2.0)
         * Classification must be one of: Verificado, Falso, Engañoso, No Verificable, Sátira
         */
        submit: (session: Session, payload: {
            case_id: string;
            classification: string;
            reason?: string;
            explanation?: string;
            evidence_url?: string;
            metadata?: any;
        }): Promise<{ job_id: string; message?: string }> =>
            fetchClient(session, `${apiEndpoints.VOTE_API_URL}/submit`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        /**
         * Poll the status of a vote job. Returns consensus state when completed.
         */
        getStatus: (session: Session, jobId: string): Promise<{
            id: string;
            status: 'pending' | 'processing' | 'completed' | 'failed';
            result?: {
                resolved_case_id: string;
                vote_recorded: boolean;
                consensus: {
                    state: 'human_consensus' | 'ai_only' | 'conflicted';
                    final_labels: string[];
                    total_votes: number;
                };
            };
            error?: string | null;
        }> =>
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
        submitJob: (session: Session, submission: { caseId: string; labels: string[]; notes?: string; evidenceUrl?: string }): Promise<{ job_id: string; message?: string }> => {
            const payload = {
                case_id: submission.caseId,
                classification: submission.labels[0],
                reason: submission.notes,
                explanation: submission.notes, // Full notes as explanation
                evidence_url: submission.evidenceUrl || ''
            };
            return fetchClient(session, `${apiEndpoints.VOTE_API_URL}/submit`, {
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
    /**
     * Generic helper to fetch arbitrary URLs (like status_url from notifications)
     */
    generic: {
        get: (session: Session, url: string): Promise<any> => fetchClient(session, url),
    }
};
