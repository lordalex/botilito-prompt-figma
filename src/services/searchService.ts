import { LOOKUP_ENDPOINT } from '@/lib/apiEndpoints';
import { supabase } from '../utils/supabase/client';
import { StandardizedCase } from '@/types/standardizedCase';

interface LookupResponse {
    case: StandardizedCase;
}

interface LookupRequest {
    identifier: string;
    select_fields?: string[];
}

export const searchService = {
    /**
     * Synchronously looks up a case by ID, Job ID, or URL.
     * @param identifier - UUID or URL to search for.
     * @param selectFields - Optional list of fields to retrieve (optimization).
     * @returns Promise<StandardizedCase>
     */
    lookupCase: async (identifier: string, selectFields?: string[]): Promise<StandardizedCase | Partial<StandardizedCase>> => {
        try {
            console.log(`[SearchService] Looking up case: ${identifier}`);

            // 1. Get Session for Auth Token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.warn('[SearchService] No active session. Request might fail if endpoint requires auth.');
                // Proceeding without token might be allowed for public lookups, or it will 401.
                // For now, we'll try to send it if we have it, commonly these endpoints are protected.
                throw new Error('Authentication required for case lookup.');
            }

            const body: LookupRequest = { identifier };
            if (selectFields && selectFields.length > 0) {
                body.select_fields = selectFields;
            }

            // 2. Call API
            const response = await fetch(LOOKUP_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[SearchService] Lookup failed (${response.status}):`, errorData);
                if (response.status === 404) {
                    throw new Error('Case not found');
                }
                throw new Error(errorData.error || `Lookup failed: ${response.status}`);
            }

            const data: LookupResponse = await response.json();
            return data.case;

        } catch (error) {
            console.error('[SearchService] Error in lookupCase:', error);
            throw error;
        }
    }
};
