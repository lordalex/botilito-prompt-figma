/**
 * @file src/types/textAnalysis.ts
 * @description Types for the text analysis API based on text-analysis.json v1.2.0
 */

export interface AMICriterion {
    nombre: string;
    score: number; // 0, 0.5, 1
    justificacion: string;
    evidencias?: string[];
    cita?: string;
    referencia?: string;
}

export interface AMIClassification {
    indiceCumplimientoAMI: {
        score: number;
        nivel: string;
    };
    criterios: Record<string, AMICriterion>;
    recomendaciones?: string[];
}

export interface FactCheckItem {
    claim: string;
    verdict: 'Verificado' | 'Refutado' | 'No Verificable';
    explanation: string;
}

export interface Summaries {
    short?: { text: string };
    medium?: { text: string };
    long?: { text: string };
    summary?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export interface AnalysisResult {
    source_data: {
        url?: string;
        title?: string;
        text?: string;
        vector_de_transmision?: string;
    };
    ai_analysis: {
        classification: AMIClassification;
        summaries: Summaries;
        diagnosticoAMI?: string; // Optional field used in some logic
    };
    evidence: {
        fact_check_table: FactCheckItem[];
    };
    reported_by?: UserProfile;
    created_at?: string;
}

export interface JobResponse {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    cached?: boolean;
    result?: AnalysisResult;
    progress?: {
        step: string;
        percent: number;
    };
}

// UI Internal representation for ContentUploadResult and CaseFullDetail
export interface TextAnalysisUIResult {
    title: string;
    summaryBotilito: {
        summary: string;
        reasoning: string;
    };
    credibilityScore: number;
    finalVerdict: string;
    markersDetected: {
        type: string;
        icon: string;
        color: string;
        explanation: string;
    }[];
    fact_check_table: FactCheckItem[];
    fullResult: AnalysisResult;
    caseNumber: string;
    theme?: string;
    region?: string;
    consensusState?: string;
    vectores?: string[];
}
