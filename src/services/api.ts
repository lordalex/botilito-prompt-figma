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
            // Adapt profileData to match the expected API payload (v1.2.0 or v3)
            // This version removes the explicit English-to-Spanish mapping and
            // assumes profileData keys directly match the API's expected keys,
            // or that the backend handles the mapping internally.
            const mappedData: any = {};

            // Direct mapping for v1.2.0 fields or v3 fields if they align
            if (profileData.nombre_completo) mappedData.nombre_completo = profileData.nombre_completo;
            if (profileData.departamento) mappedData.departamento = profileData.departamento;
            if (profileData.ciudad) mappedData.ciudad = profileData.ciudad;
            if (profileData.avatar_url) mappedData.avatar_url = profileData.avatar_url;

            // If `avatar` is used for base64 updates (as suggested in the edit snippet)
            if (profileData.avatar) mappedData.avatar = profileData.avatar;
            // If `photo` is still used and maps to `avatar`
            if (profileData.photo) mappedData.avatar = profileData.photo;

            // If `full_name`, `state_province`, `city` are still used by frontend
            // but backend expects Spanish, this mapping would be needed.
            // For now, removing based on "remove legacy mapping" instruction.
            // If `UserProfileData` itself has been updated to use Spanish keys,
            // then `mappedData` could just be `profileData`.
            // For safety, keeping direct assignments for known keys.

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
        /**
         * Get cases pending human validation (consensus_filter: "missing").
         * Uses /search endpoint per API guide documentation.
         */
        getSummary: (session: Session, page: number, pageSize: number): Promise<any> =>
            fetchClient(session, apiEndpoints.SEARCH_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({
                    consensus_filter: "missing",
                    page,
                    limit: pageSize,
                    select_fields: ["id", "created_at", "type", "overview", "community"]
                }),
            }),
        /**
         * Get detailed case information including insights for human validation.
         */
        getCaseDetails: (session: Session, caseId: string): Promise<any> =>
            fetchClient(session, apiEndpoints.LOOKUP_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({
                    identifier: caseId,
                    select_fields: ["id", "overview", "insights", "community"]
                }),
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
    },
    mapaDesinfodemico: {
        getDashboardData: (session: Session, region: string = 'nacional', timeframe: string = 'weekly'): Promise<any> =>
            fetchClient(session, apiEndpoints.MAPA_DESINFODEMICO_URL, {
                method: 'POST',
                body: JSON.stringify({ region, timeframe }),
            }),
    },
    /**
     * Historial API - Fetches cases that have been voted on (Ya Votados).
     * Uses /search endpoint with consensus_filter: "present" per API guide.
     */
    historial: {
        /**
         * Get cases with human consensus for history view.
         * Uses consensus_filter: "present" to get already-voted cases.
         * @param session - Active Supabase session
         * @param page - Page number (1-indexed)
         * @param pageSize - Number of items per page
         */
        getAll: (session: Session, page: number = 1, pageSize: number = 10): Promise<any> =>
            fetchClient(session, apiEndpoints.SEARCH_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({
                    consensus_filter: "present",
                    page,
                    limit: pageSize,
                    select_fields: ["id", "created_at", "type", "overview", "community"]
                }),
            }),
    }
};
