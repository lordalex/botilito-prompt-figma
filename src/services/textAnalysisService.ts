import { TEXT_ANALYSIS_BASE_URL } from '../lib/apiEndpoints';
import { JobResponse, AnalysisResult, TextAnalysisUIResult } from '../types/textAnalysis';

/**
 * Submits text or URL for analysis using the AMI framework.
 */
export async function submitTextAnalysis(
    session: any,
    payload: { url?: string; text?: string; use_cache?: boolean }
): Promise<JobResponse> {
    const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error submitting analysis' }));
        throw new Error(error.error || 'Failed to submit analysis');
    }

    return response.json();
}

/**
 * Gets the status and result of a text analysis job.
 */
export async function getTextAnalysisStatus(
    session: any,
    jobId: string
): Promise<JobResponse> {
    const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/status/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error fetching status' }));
        throw new Error(error.error || 'Failed to fetch status');
    }

    return response.json();
}

/**
 * Transforms the raw API result into a structure suitable for the UI.
 * Prioritizes AMI criteria and compliance scores.
 */
export function transformTextAnalysisToUI(result: AnalysisResult): TextAnalysisUIResult {
    const { ai_analysis, evidence, source_data } = result;
    const ami = ai_analysis.classification;
    const summaries = ai_analysis.summaries;

    // 1. Calculate credibility score from ICA
    const credibilityScore = ami.indiceCumplimientoAMI.score;

    // 2. Map AMI level to a final verdict
    const finalVerdict = ami.indiceCumplimientoAMI.nivel;

    // 3. Extract title and case number
    const title = source_data?.title || "Sin título";
    const caseId = (result as any).id || "TXT-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 4. Build summary botilito
    const summaryBotilito = {
        summary: summaries.medium?.text || summaries.summary || source_data?.text?.substring(0, 200) + "..." || "No hay resumen disponible.",
        reasoning: ai_analysis.diagnosticoAMI || "Análisis basado en criterios AMI de la UNESCO.",
    };

    // 5. Build markers from low-scoring criteria
    // We map criteria with score < 1 to markers to highlight problematic areas
    const markersDetected = Object.entries(ami.criterios)
        .filter(([_, crit]) => crit.score < 1)
        .map(([id, crit]) => ({
            type: crit.nombre,
            icon: crit.score === 0.5 ? 'AlertTriangle' : 'AlertCircle',
            color: crit.score === 0.5 ? 'bg-amber-500' : 'bg-red-500',
            explanation: crit.justificacion
        }));

    // If the level is negative, add a primary marker
    if (credibilityScore < 50) {
        markersDetected.unshift({
            type: 'Baja Conformidad AMI',
            icon: 'Ban',
            color: 'bg-red-700',
            explanation: `Este contenido solo cumple con el ${credibilityScore}% de los criterios AMI.`
        });
    }

    return {
        title,
        credibilityScore,
        finalVerdict,
        summaryBotilito,
        markersDetected,
        fact_check_table: evidence?.fact_check_table || [],
        fullResult: result,
        caseNumber: caseId,
        // Extract theme/region if available in metadata or summaries
        theme: (result as any).theme || (result as any).metadata?.theme,
        region: (result as any).region || (result as any).metadata?.region,
        consensusState: (result as any).consensus_state || (result as any).metadata?.consensus_state || 'ai_only',
        vectores: source_data?.vector_de_transmision ? [source_data.vector_de_transmision] : [],
    };
}

/**
 * Polls the job status until it's completed or failed.
 */
export async function pollTextAnalysis(
    session: any,
    jobId: string,
    onProgress?: (progress: any) => void,
    intervalMs: number = 2000,
    maxAttempts: number = 60 // 2 minutes
): Promise<TextAnalysisUIResult> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const job = await getTextAnalysisStatus(session, jobId);

        if (job.status === 'completed' && job.result) {
            return transformTextAnalysisToUI(job.result);
        }

        if (job.status === 'failed') {
            throw new Error('Analysis job failed on server');
        }

        if (job.progress && onProgress) {
            onProgress(job.progress);
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
    }

    throw new Error('Analysis timed out');
}
