
import {
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    HelpCircle,
    User,
    Clock,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Bot
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                Types & Interfaces                          */
/* -------------------------------------------------------------------------- */

// ... (Existing types remain if needed, or import from types file)

/* -------------------------------------------------------------------------- */
/*                           Main Transformation Logic                        */
/* -------------------------------------------------------------------------- */

export const normalizeAMIScore = (score: number) => {
    if (typeof score !== 'number') return 0;
    // Normalize to 0-1 range
    // If score is > 10, assume 0-100 scale -> divide by 100
    // If score is > 1 (and <= 10), assume 0-10 scale -> divide by 10
    // If score is <= 1, assume 0-1 scale -> return as is
    if (score > 10) return score / 100;
    if (score > 1) return score / 10;
    return score;
};

/**
 * Transforms the API response (Text Analysis) into a UI-ready object
 * compatible with the Sidebar components.
 */
export const transformTextAnalysisToUI = (data: any) => {
    if (!data) return null;

    // Normalizing the AMI Score
    // Accessing strict path based on: data.classification.indiceCumplimientoAMI.score
    const amiScoreRaw = data.classification?.indiceCumplimientoAMI?.score || 0;
    const amiNivel = data.classification?.indiceCumplimientoAMI?.nivel || "No disponible";
    const diagnostic = data.classification?.indiceCumplimientoAMI?.diagnostico || "";

    // Normalize criteria list
    const criteriaRaw = data.classification?.indiceCumplimientoAMI?.criterios || {};
    const criteriaList = Object.entries(criteriaRaw).map(([key, val]: any) => {
        // "cumple": true/false/parcial
        let statusColor = 'bg-slate-200';
        let verdictType = 'info';

        if (val.cumple === true) {
            statusColor = 'bg-emerald-500';
            verdictType = 'success';
        } else if (val.cumple === false) {
            statusColor = 'bg-red-500';
            verdictType = 'error';
        } else {
            statusColor = 'bg-amber-500';
            verdictType = 'warning';
        }

        return {
            id: key,
            nombre: val.nombre,
            justificacion: val.justificacion,
            referencia: val.referencia,
            score: val.score || 0,
            normalizedScore: (val.score || 0) / 10, // Assuming 0-10 scale
            cumple: val.cumple,
            statusColor,
            verdictType
        };
    });

    // Normalize Fact Check table
    // Path: data.verification?.fact_check_table
    const factCheckTable = (data.verification?.fact_check_table || []).map((item: any) => ({
        claim: item.claim || item.afirmacion, // Handle both english/spanish keys if needed
        verdict: item.verdict || item.veredicto,
        explanation: item.explanation || item.explicacion,
        sources: item.sources || []
    }));

    return {
        // Core Identity
        id: data.id,
        created_at: data.created_at,

        // Metadata for Sidebar
        fileName: "Texto Analizado", // Text analysis usually doesn't have a file name unless from file
        fileSize: `${data.content?.length || 0} chars`,

        // Specific Analysis Blocks
        icoScore: {
            score: amiScoreRaw,
            percent: Math.round(data.classification?.indiceCumplimientoAMI?.porcentaje_cumplimiento || 0), // If raw percent exists, use it
            nivel: amiNivel,
        },
        diagnosticoAMI: diagnostic,

        criterios: criteriaList,
        factCheckTable: factCheckTable,

        // Raw Data Access (for legacy components if needed)
        raw: data,

        // Mapping for Sidebar components
        metadata: {
            type: 'text',
            // ... extract other metadata
            language: data.language || 'es',
            source: data.metadata?.source || 'Direct Input'
        },

        // Stats for Sidebar
        stats: [
            { label: "Criterios Evaluados", value: criteriaList.length, icon: CheckCircle },
            { label: "Fuentes Consultadas", value: data.verification?.trusted_sources_count || 0, icon: User },
            // Add more generic stats
        ]
    };
};


/**
 * Transforms the API response (Image Analysis) into a UI-ready object.
 */
export const transformImageAnalysisToUI = (data: any) => {
    if (!data) return null;

    // ... Implementation for Image
    // Extract manipulation markers, metadata, etc.
    const technical = data.technical_analysis || {};
    const metadata = data.metadata || {};

    return {
        id: data.id,
        created_at: data.created_at,
        fileName: metadata.filename || "Imagen",
        fileSize: metadata.size || "Unknown",

        // ... specific props for ImageAIAnalysis
        raw: data
    };
};

/**
 * Transforms the API response (Audio Analysis) into a UI-ready object.
 */
export const transformAudioAnalysisToUI = (data: any) => {
    if (!data) return null;

    // ... Implementation for Audio
    return {
        id: data.id,
        raw: data
    };
}

/**
 * Transforms the CaseEnriched object (Human Verification / Historial) for the Unified View.
 * 
 * Handles multiple payload structures:
 * 1. Direct case object: { id, metadata: { ai_analysis, source_data }, human_votes }
 * 2. Result wrapper: { result: { cases: [{ metadata: { ai_analysis } }] } }
 * 3. Legacy structure: { case_judgement, diagnostic_labels }
 */
export const transformHumanCaseToUI = (caseData: any) => {
    if (!caseData) return null;

    // Extract the actual case data from nested structures
    const extractedCase = caseData.result?.cases?.[0] || caseData.case || caseData;

    // Extract AI analysis from metadata or direct
    const aiAnalysis = extractedCase.metadata?.ai_analysis || extractedCase.ai_analysis;
    const sourceData = extractedCase.metadata?.source_data || extractedCase.source_data;
    const evidence = extractedCase.metadata?.evidence || extractedCase.evidence;

    // Extract AMI score from classification
    const amiScore = aiAnalysis?.classification?.indiceCumplimientoAMI;
    const scoreValue = amiScore?.score || 0;
    const scorePercent = scoreValue > 1 ? scoreValue : Math.round(scoreValue * 100);

    // Build AI analysis compatible object for UnifiedAnalysisView
    const aiAnalysisCompatible = {
        classification: {
            indiceCumplimientoAMI: {
                score: scoreValue,
                percent: scorePercent,
                nivel: amiScore?.nivel || "Análisis Completado",
                diagnostico: aiAnalysis?.classification?.diagnostico || extractedCase.summary || "Análisis completado."
            },
            criterios: aiAnalysis?.classification?.criterios || {},
            recomendaciones: aiAnalysis?.classification?.recomendaciones || []
        },
        summaries: aiAnalysis?.summaries,
        specific_techniques_analysis: aiAnalysis?.specific_techniques_analysis,
        competencies_analysis: aiAnalysis?.competencies_analysis,
        verification: {
            fact_check_table: evidence?.fact_check_table || []
        },
        verdict: extractedCase.case_judgement?.final_verdict || aiAnalysis?.classification?.indiceCumplimientoAMI?.nivel
    };

    return {
        // Core identity
        id: extractedCase.id,
        created_at: extractedCase.created_at,
        title: extractedCase.title || sourceData?.title || "Caso de Verificación",
        summary: extractedCase.summary,
        url: extractedCase.url || sourceData?.url,

        // AI Analysis (primary data source)
        ai_analysis: aiAnalysisCompatible,

        // Source data
        source_data: sourceData,

        // Evidence & fact checking
        evidence: evidence,

        // Human validation data
        human_votes: extractedCase.human_votes,
        consensus: extractedCase.consensus,

        // Metadata
        metadata: {
            screenshot: extractedCase.metadata?.screenshot || sourceData?.screenshot,
            source: sourceData?.hostname || (extractedCase.url ? 'Web Link' : 'Direct Submission'),
            submission_type: extractedCase.submission_type,
            vector_de_transmision: sourceData?.vector_de_transmision,
            reported_by: extractedCase.metadata?.reported_by || extractedCase.reported_by
        },

        // Pass raw for fallback access
        raw: caseData
    };
}

/* -------------------------------------------------------------------------- */
/*                        Sidebar Props Mappers                               */
/* -------------------------------------------------------------------------- */

export const mapMetadataProps = (data: any, type: 'text' | 'image' | 'audio') => {
    // Handle both direct data and nested case data from API response
    const caseData = data?.case || data;

    const defaultProps = {
        type,
        fileName: caseData?.title || caseData?.source_data?.title || 'Archivo Desconocido',
        fileSize: undefined as number | undefined,
        basicMetadata: [] as any[],
        technicalMetadata: [] as any[]
    };

    if (!caseData) return defaultProps;

    if (type === 'text') {
        // Extract metadata from the actual API response structure
        const sourceData = caseData?.source_data;
        const metadata = caseData?.metadata;
        const aiAnalysis = caseData?.ai_analysis;

        return {
            ...defaultProps,
            fileName: caseData?.title || sourceData?.title || 'Archivo Desconocido',
            basicMetadata: [
                { label: 'Idioma', value: 'Español' },
                { label: 'Tipo', value: 'Texto / Noticia' },
                { label: 'Fuente', value: sourceData?.hostname || 'Web Link' }
            ],
            technicalMetadata: [
                { label: 'Caracteres', value: caseData?.content?.length || sourceData?.text?.length || 0 },
                { label: 'Sentimiento', value: 'Neutro' }
            ]
        };
    }

    // ... Implement Image/Audio mappers similar to previous specific components components
    return defaultProps;
};

export const mapStatsProps = (data: any, type: 'text' | 'image' | 'audio') => {
    if (!data) return [];

    if (type === 'text') {
        return data.stats || [];
    }

    return [];
};

export const mapRecommendations = (data: any) => {
    // Handle both direct data and nested case data
    const caseData = data?.case || data;

    // Try to get recommendations from ai_analysis.classification.recomendaciones
    const recommendations = caseData?.ai_analysis?.classification?.recomendaciones;

    if (Array.isArray(recommendations) && recommendations.length > 0) {
        return recommendations;
    }

    // Fallback
    return ["Verificar fuentes citadas", "Contrastar con otros medios"];
};

export const mapCommunityVotes = (data: any) => {
    // Handle both direct data and nested case data
    const caseData = data?.case || data;

    // Expecting caseData.human_votes
    const votes = caseData?.human_votes?.entries || [];
    return votes.map((v: any) => ({
        user: v.user?.full_name || 'Usuario Anónimo',
        vote: v.vote, // 'true', 'false', etc.
        reputation: v.user?.reputation || 0,
        date: v.date,
        reason: v.reason
    }));
};
