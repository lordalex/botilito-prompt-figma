// src/utils/voting/api.ts
import { supabase } from '../supabase/client';

// CORRECTED: Point to the new verbose endpoint for structured status updates.
const VOTE_FUNCTION_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/vote-auth-async-verbose';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("Authentication session is required.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
}

/**
 * Submits a new vote/diagnosis for a case.
 * This function matches the `vote-async` Deno function's `/submit` endpoint.
 * @param diagnosis - The diagnosis data payload.
 * @returns The job ID for tracking the async voting process.
 */
export async function submitVote(diagnosis: { caseId: string; marcadores: string[]; justificaciones: Record<string, string>; enlaces: Record<string, string>; notas: string; }) {
    const headers = await getAuthHeaders();
    
    // The payload is structured to match what the Deno function expects.
    const apiPayload = {
        case_id: diagnosis.caseId,
        // The Deno function expects a single primary classification.
        // We can pass the full details in metadata for more complex logic later.
        classification: diagnosis.marcadores[0], 
        reason: diagnosis.justificaciones[diagnosis.marcadores[0]] || diagnosis.notas,
        evidence_url: diagnosis.enlaces[diagnosis.marcadores[0]] || '',
        metadata: {
            marcadores: diagnosis.marcadores,
            justificaciones: diagnosis.justificaciones,
            enlaces: diagnosis.enlaces,
            notas: diagnosis.notas,
        }
    };

    const response = await fetch(`${VOTE_FUNCTION_URL}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit vote.' }));
        throw new Error(errorData.error);
    }
    
    // The API returns a JSON object with `job_id`.
    return response.json();
}

/**
 * Gets the status of a specific voting job from the verbose endpoint.
 * @param jobId - The ID of the job to check.
 * @returns The detailed job status object.
 */
export async function getVoteStatus(jobId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${VOTE_FUNCTION_URL}/status/${jobId}`, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get job status.'}));
        throw new Error(errorData.error);
    }
    
    // The verbose endpoint returns a structured status object.
    return response.json();
}
