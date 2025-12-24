// Type definitions for Text Analysis API v2.0.0 (Orquestadora)

export interface SourceData {
    url?: string;
    text?: string;
    title?: string;
    author?: string;
    hostname?: string;
    date?: string;
    vector_de_transmision?: string;
}

export interface SearchContextItem {
    title: string;
    href: string;
    body: string;
}

export interface AIClassification {
    etiquetas: Record<string, { justificacion: string }>;
    observaciones: string;
    nivel_confianza: number;
}

export interface AISummaries {
    headline: string;
    summary: string;
    summaries: {
        short?: { text: string };
        medium?: { text: string };
        long?: { text: string };
    };
}

export interface AIJudgement {
    final_verdict: string;
    confidence_score: number;
    reasoning: string;
    key_findings: string[];
}

export interface FactCheckItem {
    claim: string;
    verdict: 'Verdadero' | 'Falso' | 'No Verificable';
    reference: string;
    explanation: string;
}

export interface AIAnalysis {
    classification: AIClassification;
    summaries: AISummaries;
    judgement: AIJudgement;
}

export interface FinalAnalysisResult {
    source_data: SourceData;
    search_context: SearchContextItem[];
    ai_analysis: AIAnalysis;
    reported_by?: {
        id: string;
        name: string;
        email?: string;
    };
    evidence?: {
        fact_check_table: FactCheckItem[];
    };
}

// Support legacy or nested structure if needed
export interface TextAnalysisResult extends FinalAnalysisResult { }

// API Request/Response Types
export interface TextAnalysisSubmitRequest {
    url?: string;
    text?: string;
}

export interface TextAnalysisSubmitResponse {
    job_id: string;
    status: string;
}

export interface ProgressInfo {
    step: string;
    percent: number;
}

export interface RewardInfo {
    xp_added: number;
    rep_added: number;
    total_xp: number;
    total_rep: number;
    success: boolean;
}

export interface TextAnalysisJobStatusResponse {
    id?: string;
    job_id?: string;
    status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
    progress?: ProgressInfo;
    result?: FinalAnalysisResult;
    reward?: RewardInfo;
    error?: string;
}
