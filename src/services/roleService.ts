import { UPDATE_USER_ROLE } from '@/lib/apiEndpoints';
import { supabase } from '@/utils/supabase/client';
import { RolesConfigResponse, UpdateRoleRequest, SuccessResponse } from '@/types/roles';

/**
 * Validates if the current user has the required role to access admin features.
 * This is a client-side check for UI convenience.
 * Real security is handled by RLS and Edge Functions.
 */
export const checkAdminAccess = async (): Promise<boolean> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return false;
        // You might check metadata here if available, or rely on API responses (403)
        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
};

/**
 * Fetches the available roles configuration from the server.
 */
export const getRolesConfig = async (): Promise<RolesConfigResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(UPDATE_USER_ROLE, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch roles configuration');
    }

    return await response.json();
};

/**
 * Updates the role of a specific user.
 */
export const updateUserRole = async (request: UpdateRoleRequest): Promise<SuccessResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(UPDATE_USER_ROLE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
    }

    return await response.json();
};
