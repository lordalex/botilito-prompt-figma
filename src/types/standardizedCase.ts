// src/types/standardizedCase.ts

export type CaseType = 'text' | 'image' | 'video' | 'audio';

export type JobStatus = 'processing' | 'completed' | 'failed';
export type CustodyStatus = 'ai_processed' | 'human_review' | 'finalized';

export interface Lifecycle {
    job_status: JobStatus;
    custody_status: CustodyStatus;
    last_update?: string;
}

export interface Overview {
    title?: string;
    summary?: string;
    verdict_label?: string;
    risk_score?: number; // 0-100
    main_asset_url?: string;
    source_domain?: string | null;
    source_url?: string | null; // Original URL for "Ver contenido original" link
}

export type InsightCategory = 'metadata' | 'forensics' | 'content_quality' | 'fact_check';

export interface InsightArtifact {
    type: 'image_url' | 'text_snippet';
    label?: string;
    content: string; // URL or text
}

export interface GenericInsight {
    id: string;
    category: InsightCategory;
    label: string;
    value: string | number;
    score?: number; // 0-100
    description?: string;
    artifacts?: InsightArtifact[];
    raw_data?: Record<string, any>;
}

export interface Community {
    votes: number;
    status: 'ai_only' | 'human_consensus';
    breakdown?: Record<string, number>;
}

export interface Reporter {
    id: string;
    name: string;
    reputation: number;
}

export interface StandardizedCase {
    id: string;
    created_at: string;
    type: CaseType;
    lifecycle: Lifecycle;
    overview: Overview;
    insights: GenericInsight[];
    community?: Community;
    reporter?: Reporter;
}

// Wrapper for the specific API implementation referenced in the guide
export interface DTOAnalysisResponse {
    result: {
        standardized_case: StandardizedCase;
    };
}
