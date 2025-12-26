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
    const { classification = {}, summaries = {} } = ai_analysis;

    // AMI specific fields
    const { indiceCumplimientoAMI = {}, criterios = {}, recomendaciones = [] } = classification;

    // Map AMI score to credibility score for existing UI
    const credibilityScore = indiceCumplimientoAMI.score !== undefined
        ? indiceCumplimientoAMI.score
        : (summaries.confidence !== undefined ? Math.round(summaries.confidence * 100) : 0);

    // Map criteria to markersDetected for existing UI (fallback)
    const markersDetected: any[] = [];
    Object.entries(criterios).forEach(([id, data]: [string, any]) => {
        if (data.score < 1) { // Only show problematic areas as markers
            markersDetected.push({
                type: data.nombre || `Criterio ${id}`,
                explanation: data.justificacion || `Cumplimiento parcial/nulo: ${data.nombre}`
            });
        }
    });

    // Determine level-based marker
    const nivel = indiceCumplimientoAMI.nivel || 'N/A';
    if (nivel === 'Fully AMI Compliant') {
        markersDetected.unshift({
            type: 'Verdadero',
            explanation: 'Contenido que cumple con los estándares de alfabetización mediática.'
        });
    } else if (nivel === 'Needs Revision') {
        markersDetected.unshift({
            type: 'Descontextualizado',
            explanation: 'Contenido que requiere revisión y verificación adicional.'
        });
    } else if (nivel === 'Needs Supervision') {
        markersDetected.unshift({
            type: 'Falso',
            explanation: 'Contenido con serias deficiencias en los criterios AMI.'
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

    const getTemaCode = (theme?: string): string => {
        const themeMap: Record<string, string> = {
            'Política': 'PO',
            'Economía': 'EC',
            'Salud': 'SA',
            'Tecnología': 'TE',
            'Deportes': 'DE',
            'Internacional': 'IN',
            'Nacional': 'NA',
            'Cultura': 'CU',
            'Ciencia': 'CI',
            'Sucesos': 'SU'
        };
        return themeMap[theme || ''] || 'GE';
    };

    const vectorCode = getVectorCode(source_data.vector_de_transmision, source_data.url);
    const tipoCode = 'TX';
    const regionCode = summaries.region?.includes('Colombia') ? 'CO' : 'IN';
    const temaCode = getTemaCode(summaries.theme);
    const hash = jobId.replace(/-/g, '').substring(0, 3).toUpperCase();
    const displayId = `${vectorCode}-${tipoCode}-${regionCode}-${temaCode}-${hash}`;

    const theme = summaries.theme || 'General';
    const region = summaries.region || 'Internacional';
    const reasoning = ai_analysis.diagnosticoAMI || summaries.summary || '';

    return {
        title: summaries.headline || source_data.title || 'Análisis AMI',
        summaryBotilito: {
            summary: summaries.summary || reasoning,
            diagnosticoAMI: ai_analysis.diagnosticoAMI
        },
        theme,
        region,
        caseNumber: displayId,
        consensusState: result.requires_human_review ? 'conflicted' : (result.consensus_analysis ? 'human_consensus' : 'ai_only'),
        markersDetected,
        vectores: [source_data.vector_de_transmision || 'Web'],
        finalVerdict: nivel,
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
                ami_assessment: {
                    ica: indiceCumplimientoAMI,
                    criterios,
                    recomendaciones
                },
                comprehensive_judgement: {
                    final_verdict: nivel,
                    recommendation: recomendaciones[0] || 'Verificar con múltiples fuentes antes de compartir',
                    reasoning: reasoning,
                    key_findings: [], // Can be populated from criteria if needed
                    requires_human_review: result.requires_human_review
                },
                evidence: result.evidence
            }
        },
        reward: reward
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
