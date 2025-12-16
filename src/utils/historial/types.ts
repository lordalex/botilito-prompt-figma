// Types for Historial (History) section
// Reuses the same API endpoint as Human Verification: /vector-async/summary

import type {
  VerificationSummaryResult,
  CaseEnriched
} from '../humanVerification/types';

// Alias for backwards compatibility
export type RecentCase = CaseEnriched;

// Define missing types that the historial code expects but aren't in CaseEnriched
export interface RelatedDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  similarity: number;
  theme?: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

/**
 * Historial uses the same data structure as Human Verification
 * but presents it differently (historical view vs verification queue)
 */
export type HistorialSummaryResult = VerificationSummaryResult;
export type HistorialCase = RecentCase;
export type HistorialDocument = RelatedDocument;
export type HistorialWebResult = WebSearchResult;

/**
 * UI-specific case for list view with display formatting
 */
export interface HistorialCaseUI {
  id: string;
  displayId: string; // Generated code like "T-WB-20241015-156"
  title: string;
  url: string;
  submissionType: 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO';
  submissionTypeIcon: string;
  createdAt: string;
  createdAtFormatted: string;
  humanVotesCount: number;
  diagnosticLabels: DiagnosticLabelWithPercentage[];
  finalVerdict: string;
  verificationMethod: string;
  consensusState: 'ai_only' | 'human_only' | 'consensus' | 'disagreement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedDocumentsCount: number;
  webSearchResultsCount: number;
}

/**
 * Diagnostic label with percentage for UI display
 */
export interface DiagnosticLabelWithPercentage {
  label: string;
  percentage: number;
  color: string;
  bg: string;
  border: string;
}

/**
 * Full case details for detail view
 */
export interface HistorialCaseDetail extends HistorialCaseUI {
  relatedDocuments: RelatedDocument[];
  webSearchResults: WebSearchResult[];
  consensus: {
    state: 'ai_only' | 'human_only' | 'consensus' | 'disagreement';
    final_labels: string[];
  };
  summary: string; // Generated from related documents
}

/**
 * Filter options for historial list
 */
export interface HistorialFilters {
  submissionType?: 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'ALL';
  consensusState?: 'ai_only' | 'human_only' | 'consensus' | 'disagreement' | 'ALL';
  priority?: 'low' | 'medium' | 'high' | 'critical' | 'ALL';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

/**
 * Sort options
 */
export type HistorialSortBy = 'date_desc' | 'date_asc' | 'priority_desc' | 'votes_desc';
