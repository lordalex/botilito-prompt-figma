import { supabase } from '../supabase/client';
import { api } from '../../services/api';

/**
 * Submits a new vote/diagnosis for a case.
 * This function matches the `vote-auth-async-verbose` API v1.2.0 `/submit` endpoint.
 * Classification must be one of: Verificado, Falso, Engañoso, No Verificable, Sátira
 * @param diagnosis - The diagnosis data payload.
 * @returns The job ID for tracking the async voting process.
 */
export async function submitVote(diagnosis: {
    caseId: string;
    marcadores: string[];
    justificaciones: Record<string, string>;
    enlaces: Record<string, string>;
    notas: string;
}) {
    const { data: { session } } = await supabase.auth.getSession();

    const classification = diagnosis.marcadores[0];
    const reason = diagnosis.justificaciones[classification] || diagnosis.notas;

    const apiPayload = {
        case_id: diagnosis.caseId,
        classification: classification,
        reason: reason,
        explanation: diagnosis.notas, // Full explanation/notes
        evidence_url: diagnosis.enlaces[classification] || '',
        metadata: {
            marcadores: diagnosis.marcadores,
            justificaciones: diagnosis.justificaciones,
            enlaces: diagnosis.enlaces,
            notas: diagnosis.notas,
        }
    };

    return api.voting.submit(session, apiPayload);
}

/**
 * Gets the status of a specific voting job from the verbose endpoint.
 * @param jobId - The ID of the job to check.
 * @returns The detailed job status object.
 */
export async function getVoteStatus(jobId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    return api.voting.getStatus(session, jobId);
}
