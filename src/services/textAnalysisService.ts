import { supabase } from '@/utils/supabase/client';
import { TEXT_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import {
    TextAnalysisSubmitRequest,
    TextAnalysisSubmitResponse,
    TextAnalysisJobStatusResponse,
    TextAnalysisResult
} from '@/types/textAnalysis';

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // 2 minutes max

// Re-export for external use
export type { TextAnalysisJobStatusResponse } from '@/types/textAnalysis';

/**
 * Transform text analysis API v2.0.0 result to match the existing UI model
 * used by ContentUploadResult.tsx
 */
function transformTextAnalysisToUI(apiResult: any, jobId: string, userId?: string, reward?: any): any {
    // Robustly handle hierarchical result from v2.0.0
    const result = apiResult.result || apiResult;
    const { source_data = {}, search_context = [], ai_analysis = {} } = result;
    const { classification = {}, summaries = {}, judgement = {} } = ai_analysis;

    // Map labels (etiquetas) to marker types
    const markersDetected: any[] = [];
    const labels = Object.entries(classification.etiquetas || {});

    labels.forEach(([name, data]: [string, any]) => {
        markersDetected.push({
            type: name,
            explanation: data.justificacion || `Detectado: ${name}`
        });
    });

    const credibilityScore = judgement.confidence_score !== undefined
        ? judgement.confidence_score
        : Math.round((classification.nivel_confianza || 0) * 100);

    // Determine primary marker based on credibility
    if (credibilityScore < 30) {
        markersDetected.push({
            type: 'Falso',
            explanation: `Baja credibilidad detectada (${credibilityScore}/100). ${judgement.reasoning || classification.observaciones || ''}`
        });
    } else if (credibilityScore < 60) {
        markersDetected.push({
            type: 'Descontextualizado',
            explanation: `Credibilidad moderada (${credibilityScore}/100). Requiere verificación adicional.`
        });
    } else if (credibilityScore >= 80) {
        markersDetected.push({
            type: 'Verdadero',
            explanation: `Alta credibilidad (${credibilityScore}/100). Corroborado por el análisis.`
        });
    }

    // --- Document ID Generation (VECTOR-TIPO-REGION-TEMA-HASH) ---
    const getVectorCode = (vectorName?: string, url?: string): string => {
        const v = (vectorName || '').toLowerCase();
        if (v.includes('whatsapp')) return 'WH';
        if (v.includes('facebook')) return 'FA';
        if (v.includes('twitter') || v.includes('x')) return 'XX';
        if (v.includes('instagram')) return 'IG';
        if (v.includes('tiktok')) return 'TK';
        if (v.includes('youtube')) return 'YT';
        if (v.includes('telegram')) return 'TL';

        // Fallback to URL detection if vectorName is generic
        if (url) {
            try {
                const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
                if (hostname.includes('whatsapp')) return 'WH';
                if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'FA';
                if (hostname.includes('twitter') || hostname.includes('x.com')) return 'XX';
                return 'WE';
            } catch { return 'WE'; }
        }
        return 'OT';
    };

    const getTemaCode = (labelNames: string[]): string => {
        if (labelNames.length === 0) return 'GE';
        const temaMap: Record<string, string> = {
            'Engañoso': 'EN',
            'Falso': 'FA',
            'Verdadero': 'VE',
            'Sin contexto': 'SC',
            'Sátira': 'SA',
            'Desinformación': 'DE',
            'Manipulado': 'MA',
            'No verificable': 'NV',
            'Teoría Conspirativa': 'CO',
            'Discurso de Odio': 'OD'
        };
        for (const label of labelNames) {
            if (temaMap[label]) return temaMap[label];
        }
        return 'GE';
    };

    const vectorCode = getVectorCode(source_data.vector_de_transmision, source_data.url);
    const tipoCode = 'TX';
    const regionCode = (source_data.hostname?.endsWith('.co') || source_data.hostname?.includes('.co/')) ? 'CO' : 'IN';
    const temaCode = getTemaCode(labels.map(([name]) => name));
    const hash = jobId.replace(/-/g, '').substring(0, 3).toUpperCase();
    const displayId = `${vectorCode}-${tipoCode}-${regionCode}-${temaCode}-${hash}`;

    // Extract theme (simple heuristic)
    const inferTheme = (text: string): string => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('política') || lowerText.includes('gobierno')) return 'Política';
        if (lowerText.includes('salud') || lowerText.includes('covid') || lowerText.includes('vacuna')) return 'Salud';
        if (lowerText.includes('economía') || lowerText.includes('dinero')) return 'Economía';
        if (lowerText.includes('tecnología') || lowerText.includes('ia')) return 'Tecnología';
        if (lowerText.includes('deporte')) return 'Deportes';
        return 'General';
    };

    const theme = summaries.theme || inferTheme((source_data.title || '') + ' ' + (source_data.text || ''));
    const region = summaries.region || (source_data.hostname?.includes('.co') ? 'Colombia' : 'Internacional');
    const reasoning = judgement.reasoning || summaries.summary || classification.observaciones || (labels.length > 0 ? (labels[0][1] as any).justificacion : '');

    return {
        title: summaries.headline || source_data.title || 'Análisis de Texto',
        summaryBotilito: {
            summary: summaries.summary || reasoning
        },
        theme,
        region,
        caseNumber: displayId,
        consensusState: result.requires_human_review ? 'conflicted' : (judgement.consensus_analysis ? 'human_consensus' : 'ai_only'),
        markersDetected,
        vectores: [source_data.vector_de_transmision || 'Web'],
        finalVerdict: judgement.final_verdict || (judgement.error ? `Diagnóstico parcial: ${judgement.error}` : `Puntaje de credibilidad: ${credibilityScore}/100`),
        fullResult: {
            created_at: new Date().toISOString(),
            url: source_data.url,
            user_id: userId,
            reported_by_name: result.reported_by?.name || null,
            document_id: displayId,
            metadata: {
                source: (source_data.hostname || summaries.source) ? {
                    name: source_data.hostname || summaries.source,
                    url: source_data.url
                } : null,
                text_analysis: result,
                web_search_results: search_context.map((ctx: any) => ({
                    title: ctx.title,
                    url: ctx.href,
                    snippet: ctx.body
                })),
                classification_labels: Object.fromEntries(labels),
                comprehensive_judgement: {
                    final_verdict: judgement.final_verdict || (judgement.error ? 'Error en análisis secundario' : ''),
                    recommendation: judgement.recommendation || (credibilityScore < 50
                        ? 'No compartir esta información sin verificar con fuentes confiables'
                        : 'Verificar con múltiples fuentes antes de compartir'),
                    reasoning: reasoning,
                    key_findings: judgement.key_findings || [],
                    consensus_analysis: judgement.consensus_analysis,
                    requires_human_review: result.requires_human_review
                },
                web_search_evaluation: {
                    verdict: judgement.final_verdict,
                    credibility_score: credibilityScore
                },
                evidence: result.evidence
            }
        },
        reward: reward // Include reward in the UI model
    };
}

// --- Polling Helper ---
async function pollJobStatus(jobId: string, token: string): Promise<any> {
    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
        attempts++;

        const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 404 && attempts < 5) continue;
            throw new Error(`Polling failed: ${response.status}`);
        }

        const data: TextAnalysisJobStatusResponse = await response.json();

        if (data.status === 'completed' && data.result) {
            const { data: { session } } = await supabase.auth.getSession();
            return transformTextAnalysisToUI(data.result, jobId, session?.user?.id, data.reward);
        }

        if (data.status === 'failed') {
            throw new Error(data.error || 'Text analysis failed');
        }
    }
    throw new Error('Analysis timed out');
}

// --- Service Definition ---
export const textAnalysisService = {
    submitJob: async (urlOrText: string): Promise<{ jobId?: string; result?: any }> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');
        const token = session.access_token;

        // Determine if input is URL or text
        const isUrl = /^https?:\/\//i.test(urlOrText.trim());

        const requestBody: TextAnalysisSubmitRequest = isUrl
            ? { url: urlOrText.trim() }
            : { text: urlOrText };

        const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Text analysis submission failed: ${errorText}`);
        }

        const data: TextAnalysisSubmitResponse = await response.json();
        return { jobId: data.job_id };
    },

    submitText: async (urlOrText: string): Promise<any> => {
        const { jobId } = await textAnalysisService.submitJob(urlOrText);
        if (!jobId) throw new Error("No Job ID returned");

        const { data: { session } } = await supabase.auth.getSession();
        return await pollJobStatus(jobId, session?.access_token || '');
    },

    getJobStatus: async (jobId: string): Promise<TextAnalysisJobStatusResponse> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch(`${TEXT_ANALYSIS_BASE_URL}/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        return await response.json();
    },

    getAnalysisResult: async (jobId: string): Promise<any> => {
        const status = await textAnalysisService.getJobStatus(jobId);
        if (status.status === 'completed' && status.result) {
            const { data: { session } } = await supabase.auth.getSession();
            return transformTextAnalysisToUI(status.result, jobId, session?.user?.id, status.reward);
        }
        throw new Error(`Job not complete (Status: ${status.status})`);
    }
};
