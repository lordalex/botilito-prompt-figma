/**
 * Search DTO API Types
 * 
 * Types for the unified search-dto API that returns StandardizedCase DTOs.
 * @see /search-dto.json for OpenAPI specification
 */

// ============================================================================
// Job Response Types
// ============================================================================

export interface VectorJobResponse {
  job_id: string;
  message: string;
}

export interface TraceLogEntry {
  t: string;
  msg: string;
  meta?: any;
}

// ============================================================================
// StandardizedCase DTO (from search-dto.json)
// ============================================================================

/** The verification stage of a case */
export type CustodyStatus = 'registered' | 'analyzing' | 'ai_processed' | 'human_review' | 'finalized';

/** Category of an insight */
export type InsightCategory = 'forensics' | 'content_quality' | 'fact_check' | 'metadata' | 'compliance';

/** Type of artifact attached to an insight */
export type ArtifactType = 'image_url' | 'text_snippet' | 'link_url';

/** Lifecycle status of a case */
export interface Lifecycle {
  job_status: 'completed' | 'processing' | 'failed';
  custody_status: CustodyStatus;
  last_update?: string;
}

/** Overview/summary data for a case */
export interface Overview {
  title: string;
  summary?: string;
  verdict_label?: string;
  risk_score?: number; // 0-100: Low score = High Risk
  main_asset_url?: string | null;
  source_domain?: string | null;
}

/** A polymorphic finding/insight */
export interface GenericInsight {
  id: string;
  category: InsightCategory;
  label: string;
  value?: string | number | boolean;
  score?: number | null; // 0-100 normalized score for UI colors
  description?: string;
  artifacts?: Artifact[];
  raw_data?: Record<string, any>;
}

/** Artifact attached to an insight */
export interface Artifact {
  type: ArtifactType;
  content: string;
  label?: string;
}

/** Reporter who submitted the case */
export interface Reporter {
  id: string;
  name?: string;
  reputation?: number;
}

/** Community voting data */
export interface Community {
  votes: number;
  status: 'ai_only' | 'human_consensus';
  breakdown?: Record<string, number>;
}

/**
 * The unified payload representing any analyzed content.
 * This is the core DTO returned by search-dto API.
 */
export interface StandardizedCase {
  id: string;
  created_at?: string;
  type: 'text' | 'image' | 'video' | 'audio';
  lifecycle: Lifecycle;
  overview: Overview;
  insights: GenericInsight[];
  reporter?: Reporter;
  community?: Community;
}

// ============================================================================
// Legacy EnrichedCase (for backwards compatibility)
// ============================================================================

/**
 * Legacy enriched case structure.
 * Still used by some components during migration.
 * Can contain a standardized_case sub-object.
 */
export interface EnrichedCase {
  id: string;
  created_at: string;
  title: string;
  url?: string | null;
  submission_type: 'Text' | 'URL';
  status: string;
  summary: string;
  metadata?: {
    analyzed_at?: string;
    duration_ms?: number;
    cached?: boolean;
    confidence_score?: number;
    global_verdict?: string;
    [key: string]: any;
  };
  diagnostic_labels?: string[];
  human_votes?: {
    count: number;
    breakdown?: Record<string, number>;
    statistics?: any[];
    entries?: Array<{
      vote: string;
      reason: string;
      date: string;
      user: {
        id: string;
        full_name: string;
        reputation: number;
      };
    }>;
  };
  consensus?: {
    state: 'human_consensus' | 'ai_only' | 'conflicted';
    final_labels?: string[];
  };
  content?: string;
  related_documents?: any[];

  // NEW: StandardizedCase DTO can be included
  standardized_case?: StandardizedCase;
}

// ============================================================================
// API Response Payloads
// ============================================================================

export interface SearchResultPayload {
  cases: (EnrichedCase | StandardizedCase)[];
  pagination: {
    page: number;
    pageSize: number;
    returnedCount: number;
    hasMore?: boolean;
  };
}

export interface LookupResultPayload {
  case: EnrichedCase | StandardizedCase | null;
  error?: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: SearchResultPayload | LookupResultPayload;
  error?: any;
  trace_log?: TraceLogEntry[];
}

