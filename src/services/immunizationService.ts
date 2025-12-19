import { api } from './api';
import { supabase } from '../utils/supabase/client';

export interface ImmunizationRequest {
    case_id: string;
    name: string;
    description: string;
    resources?: Array<{
        type: 'link' | 'pdf' | 'video';
        url: string;
        title: string;
    }>;
}

export interface ImmunizationJobResult {
    immunization_id: string;
    message: string;
}

export async function submitImmunizationStrategy(submission: ImmunizationRequest): Promise<ImmunizationJobResult> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { job_id } = await api.immunization.submit(session, submission);

    // Poll for status
    const maxAttempts = 30;
    const pollInterval = 2000;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const data = await api.immunization.getStatus(session, job_id);

        if (data.status === 'completed' && data.result) {
            return data.result as ImmunizationJobResult;
        }

        if (data.status === 'failed') {
            const errorMessage = typeof data.error === 'string' ? data.error : (data.error as any)?.message;
            throw new Error(errorMessage || 'Immunization job failed');
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
    }

    throw new Error('Timeout waiting for immunization job');
}
