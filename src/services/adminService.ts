import { supabase } from '../utils/supabase/client';
import { api } from './api';
import { AdminJobResult, DispatchResponse } from '../types';

/**
 * Polls the Admin API for job status.
 */
async function pollAdminJob(jobId: string): Promise<AdminJobResult> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");

    const maxAttempts = 30; // 30 attempts * 2s = 60s timeout
    const pollInterval = 2000;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const result: AdminJobResult = await api.admin.getStatus(session, jobId);

        if (result.status === 'completed' || result.status === 'failed') {
            return result;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
    }

    throw new Error('Admin job timed out.');
}

export const adminService = {
    /**
     * Dispatches an admin action and waits for completion.
     */
    executeAction: async (type: string, payload?: any): Promise<any> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No active session");

        const dispatch: DispatchResponse = await api.admin.dispatch(session, { type, payload });

        if (!dispatch.job_id) {
            throw new Error("Failed to dispatch admin job.");
        }

        const finalResult = await pollAdminJob(dispatch.job_id);

        if (finalResult.status === 'failed') {
            throw new Error(finalResult.error || 'Admin action failed.');
        }

        return finalResult.result;
    }
};
