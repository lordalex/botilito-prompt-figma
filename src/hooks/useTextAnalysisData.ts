import { useMemo } from 'react';
import { normalizeAMIScore } from '../services/analysisPresentationService';

/**
 * Extracts the case data from various possible payload structures:
 * 1. Direct case data (data.ai_analysis)
 * 2. Nested in 'case' property (data.case.ai_analysis)
 * 3. Nested in 'metadata' (data.metadata.ai_analysis)
 * 4. From result.cases array (data.result.cases[0].metadata.ai_analysis)
 */
function extractCaseData(data: any): any {
    if (!data) return null;

    // Check if it's a result with cases array (API response from text analysis)
    if (data.result?.cases?.[0]) {
        return data.result.cases[0];
    }

    // Check if cases array is directly on data
    if (data.cases?.[0]) {
        return data.cases[0];
    }

    // Check if it has a 'case' property
    if (data.case) {
        return data.case;
    }

    // Return data as-is (already normalized)
    return data;
}

/**
 * Extracts ai_analysis from case data, handling both direct and metadata-nested structures
 */
function extractAiAnalysis(caseData: any): any {
    if (!caseData) return null;

    // Check metadata.ai_analysis first (new payload structure)
    if (caseData.metadata?.ai_analysis) {
        return caseData.metadata.ai_analysis;
    }

    // Fall back to direct ai_analysis
    return caseData.ai_analysis;
}

/**
 * Extracts source_data from case data
 */
function extractSourceData(caseData: any): any {
    if (!caseData) return null;

    // Check metadata.source_data first (new payload structure)
    if (caseData.metadata?.source_data) {
        return caseData.metadata.source_data;
    }

    // Fall back to direct source_data
    return caseData.source_data;
}

export function useTextAnalysisData(data: any) {
    // Extract the case data from nested structures
    const caseData = useMemo(() => extractCaseData(data), [data]);

    // Extract ai_analysis (handles both direct and metadata-nested)
    const aiAnalysis = useMemo(() => extractAiAnalysis(caseData), [caseData]);

    // Extract source_data
    const sourceData = useMemo(() => extractSourceData(caseData), [caseData]);

    // Get screenshot from various locations
    const screenshot = useMemo(() => {
        return caseData?.metadata?.screenshot ||
            caseData?.source_data?.screenshot ||
            sourceData?.screenshot;
    }, [caseData, sourceData]);

    const icoScore = useMemo(() => aiAnalysis?.classification?.indiceCumplimientoAMI, [aiAnalysis]);
    const criterios = useMemo(() => aiAnalysis?.classification?.criterios || {}, [aiAnalysis]);
    const factCheckTable = useMemo(() =>
        caseData?.metadata?.evidence?.fact_check_table ||
        caseData?.evidence?.fact_check_table ||
        [], [caseData]);

    const mappedCriterios = useMemo(() => {
        return Object.entries(criterios).map(([id, crit]: [string, any]) => {
            const normalizedScore = normalizeAMIScore(crit.score);

            const statusColor = normalizedScore >= 0.8 ? 'bg-emerald-500' :
                normalizedScore >= 0.3 ? 'bg-amber-400' :
                    'bg-red-500';

            const verdictType = normalizedScore >= 0.8 ? 'success' :
                normalizedScore >= 0.3 ? 'warning' :
                    'danger';

            return {
                id,
                ...crit,
                normalizedScore,
                statusColor,
                verdictType
            };
        });
    }, [criterios]);

    const normalizedICOScore = useMemo(() => {
        if (!icoScore) return null;
        return {
            ...icoScore,
            percent: Math.min(100, Math.round(icoScore.score > 1 ? icoScore.score : icoScore.score * 100))
        };
    }, [icoScore]);

    return {
        // Core analysis data
        icoScore: normalizedICOScore,
        criterios: mappedCriterios,
        factCheckTable,
        diagnosticoAMI: aiAnalysis?.diagnosticoAMI,

        // Expose extracted data for components
        caseData,
        aiAnalysis,
        sourceData,
        screenshot,

        // Summaries and specific analysis
        summaries: aiAnalysis?.summaries,
        specificAnalysis: aiAnalysis?.specific_techniques_analysis,
        competencies: aiAnalysis?.competencies_analysis,

        // Case metadata
        // Case metadata
        caseId: caseData?.id,
        displayId: caseData?.displayId || caseData?.display_id || caseData?.standardized_case?.display_id,
        caseTitle: caseData?.title,
        caseStatus: caseData?.status,
        caseSummary: caseData?.summary,
        createdAt: caseData?.created_at,
        reportedBy: caseData?.reporter || caseData?.metadata?.reported_by || caseData?.reported_by || caseData?.standardized_case?.reporter,
        humanVotes: caseData?.human_votes,
        consensus: caseData?.consensus
    };
}


