/**
 * @file lib/apiService.ts
 * @description Centralized API service for all backend communication.
 * This service abstracts the details of fetch calls, authentication headers,
 * and endpoint URLs from the UI components.
 * v2.0: Refactored to support multiple, distinct Supabase function base URLs.
 */

import type { Session } from '@supabase/supabase-js';
import type { IngestPayload, JobAcceptedResponse, JobStatusResponse, FullAnalysisResponse } from '@/types/botilito';
import { UserProfileData } from '@/types'; // Assuming a UserProfileData type exists

// --- Base URLs for different Supabase Edge Functions ---
const INGEST_API_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth-enriched';
const PROFILE_API_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/profileCRUD'; // URL for the profile CRUD function

/**
 * A generic helper function to perform authenticated fetch requests to Supabase functions.
 * @param {string} baseUrl - The base URL of the function to call.
 * @param {Session} session - The active Supabase session containing the access token.
 * @param {string} endpoint - The specific API endpoint path (e.g., '/submit').
 * @param {RequestInit} options - Standard fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 * @throws Will throw an error if the session is invalid or the network request fails.
 */
async function authenticatedFetch(baseUrl: string, session: Session, endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!session?.access_token) {
        throw new Error("Authentication error: No access token provided.");
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP Error: ${response.status} ${response.statusText}` }));
        // Use the 'data' field for errors from our Deno functions if it exists
        const errorMessage = errorData.error || errorData.data?.error || `An unknown API error occurred.`;
        throw new Error(errorMessage);
    }

    // Our Deno functions might return { data: ... }
    const responseData = await response.json();
    return responseData.data || responseData;
}

/**
 * The main API service object, organized by resource.
 */
export const api = {
    /**
     * Ingestion-related API calls.
     */
    ingestion: {
        submit: async (session: Session, payload: IngestPayload): Promise<JobAcceptedResponse | FullAnalysisResponse> => {
            return authenticatedFetch(INGEST_API_URL, session, '/submit', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
        getStatus: async (session: Session, jobId: string): Promise<JobStatusResponse> => {
            return authenticatedFetch(INGEST_API_URL, session, `/status/${jobId}`, {
                method: 'GET',
            });
        },
    },

    /**
     * User Profile related API calls.
     */
    profile: {
        /**
         * Fetches the profile of the currently authenticated user.
         * @param {Session} session - The user's active session.
         * @returns {Promise<UserProfileData>} The user's profile data.
         */
        get: async (session: Session): Promise<UserProfileData> => {
            // The endpoint is the base URL itself for this function
            return authenticatedFetch(PROFILE_API_URL, session, '', {
                method: 'GET',
            });
        },

        /**
         * Fetches a user profile by their specific ID.
         * @param {Session} session - The user's active session.
         * @param {string} userId - The ID of the user to fetch.
         * @returns {Promise<UserProfileData>} The user's profile data.
         */
        getById: async (session: Session, userId: string): Promise<UserProfileData> => {
            return authenticatedFetch(PROFILE_API_URL, session, `?id=${userId}`, {
                method: 'GET',
            });
        },

        /**
         * Updates the profile for the currently authenticated user.
         * @param {Session} session - The user's active session.
         * @param {Partial<UserProfileData>} profileData - The profile fields to update.
         * @returns {Promise<UserProfileData>} The updated user's profile data.
         */
        update: async (session: Session, profileData: Partial<UserProfileData>): Promise<UserProfileData> => {
            // The endpoint is the base URL itself for this function
            return authenticatedFetch(PROFILE_API_URL, session, '', {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });
        },
    },
};
