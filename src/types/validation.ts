/**
 * @file src/types/validation.ts
 * @description DTOs para la lista de casos pendientes de validación humana.
 * Basado en la estructura de datos del endpoint de documentos para verificación.
 */

// Tipo de contenido basado en submission_type del JSON
export type SubmissionType = 'Text' | 'Image' | 'Video' | 'Audio' | 'URL';

// Estado de consenso según el campo consensus.state
export type ConsensusState = 'ai_only' | 'human_consensus' | 'conflicted';

// Vote Classification (v1.2.0 API)
export type VoteClassification =
  | 'Verificado'
  | 'Falso'
  | 'Engañoso'
  | 'No Verificable'
  | 'Sátira';

// Vote API Request (v1.2.0)
export interface VoteRequest {
  case_id: string;
  classification: VoteClassification;
  reason?: string;
  explanation?: string;
  evidence_url?: string;
}

// Vote API Job Response
export interface VoteJobAcceptedResponse {
  job_id: string;
  message?: string;
}

// Vote API Result
export interface VoteResult {
  resolved_case_id: string;
  vote_recorded: boolean;
  consensus: {
    state: ConsensusState;
    final_labels: string[];
    total_votes: number;
  };
}

// Vote API Status Response
export interface VoteJobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: VoteResult;
  error?: string | null;
  trace_log?: object[];
}

// Nivel de cumplimiento AMI
export type AMIComplianceLevel =
  | 'Desarrolla las estrategias AMI'
  | 'Requiere un enfoque AMI'
  | 'Cumple las premisas AMI'
  | 'No cumple las premisas AMI';

/**
 * DTO para quien reportó el contenido
 */
export interface ReportedByDTO {
  id: string;
  name: string;
}

/**
 * DTO para el índice de cumplimiento AMI
 */
export interface AMIComplianceDTO {
  nivel: AMIComplianceLevel;
  score: number;
}

/**
 * DTO para estadísticas de votos humanos
 */
export interface HumanVotesDTO {
  count: number;
  entries: unknown[];
  breakdown: Record<string, unknown>;
  statistics: unknown[];
}

/**
 * DTO para el consenso del caso
 */
export interface ConsensusDTO {
  state: ConsensusState;
  final_labels: string[];
}

/**
 * DTO principal para un caso en la lista de validación
 * Representa la estructura mínima necesaria para mostrar en el listado
 */
export interface ValidationCaseDTO {
  id: string;
  url: string | null;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary: string;
  created_at: string;
  submission_type: SubmissionType;
  consensus: ConsensusDTO;
  human_votes: HumanVotesDTO;
  metadata: {
    screenshot?: string;
    reported_by?: ReportedByDTO;
    ai_analysis?: {
      summaries?: {
        theme?: string;
        region?: string;
      };
      classification?: {
        indiceCumplimientoAMI?: AMIComplianceDTO;
      };
    };
  };
}

/**
 * DTO para la vista de lista - proyección simplificada del caso
 */
export interface ValidationCaseListItemDTO {
  id: string;
  caseCode: string;
  contentType: 'texto' | 'imagen' | 'video' | 'audio' | 'url';
  title: string;
  summary: string;
  createdAt: string;
  reportedBy: string;
  humanValidatorsCount: number;
  consensusState: ConsensusState;
  theme?: string;
  amiScore?: number;
  amiLevel?: AMIComplianceLevel;
  screenshotUrl?: string;
}

/**
 * Función para mapear SubmissionType a contentType del componente
 */
export function mapSubmissionType(type: SubmissionType | string): ValidationCaseListItemDTO['contentType'] {
  const normalizedType = type?.toLowerCase();
  const mapping: Record<string, ValidationCaseListItemDTO['contentType']> = {
    text: 'texto',
    image: 'imagen',
    video: 'video',
    audio: 'audio',
    url: 'url',
  };
  return mapping[normalizedType] || 'texto';
}

/**
 * Función para generar código de caso basado en el tipo y fecha
 * Formato: {T|I|V|A|U}-{YYYYMMDD}-{últimos 3 dígitos del ID}
 */
export function generateCaseCode(caseData: ValidationCaseDTO): string {
  const typePrefix: Record<SubmissionType, string> = {
    Text: 'T',
    Image: 'I',
    Video: 'V',
    Audio: 'A',
    URL: 'U',
  };

  const prefix = typePrefix[caseData.submission_type] || 'T';
  const date = new Date(caseData.created_at);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const idSuffix = caseData.id.slice(-8, -5).toUpperCase();

  return `${prefix}-${dateStr}-${idSuffix}`;
}

/**
 * Función para transformar el DTO del backend al DTO de lista
 */
export function transformToListItem(caseData: ValidationCaseDTO): ValidationCaseListItemDTO {
  return {
    id: caseData.id,
    caseCode: generateCaseCode(caseData),
    contentType: mapSubmissionType(caseData.submission_type),
    title: caseData.title,
    summary: caseData.summary,
    createdAt: caseData.created_at,
    reportedBy: caseData.metadata?.reported_by?.name || 'Usuario anónimo',
    humanValidatorsCount: caseData.human_votes?.count || 0,
    consensusState: caseData.consensus?.state || 'ai_only',
    theme: caseData.metadata?.ai_analysis?.summaries?.theme,
    amiScore: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.score,
    amiLevel: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.nivel,
    screenshotUrl: caseData.metadata?.screenshot,
  };
}

/**
 * Función para transformar un array de casos ValidationCaseDTO
 */
export function transformCasesToListItems(cases: ValidationCaseDTO[]): ValidationCaseListItemDTO[] {
  return cases.map(transformToListItem);
}

/**
 * Interfaz simplificada compatible con CaseEnriched del hook useHumanVerification
 */
export interface CaseEnrichedCompatible {
  id: string;
  displayId?: string;
  title: string;
  status: string;
  summary: string;
  url?: string;
  created_at: string;
  submission_type: 'Text' | 'URL' | 'Image' | 'Video' | 'Audio';
  human_votes?: {
    count: number;
    statistics?: unknown[];
    entries?: unknown[];
  };
  consensus?: {
    state: 'human_consensus' | 'ai_only';
    final_labels: string[];
  };
  metadata?: {
    screenshot?: string;
    reported_by?: { id: string; name: string };
    ai_analysis?: {
      summaries?: { theme?: string; region?: string };
      classification?: {
        indiceCumplimientoAMI?: { nivel: AMIComplianceLevel; score: number };
      };
    };
  };
}

/**
 * Función para generar código de caso desde CaseEnriched
 */
export function generateCaseCodeFromEnriched(caseData: CaseEnrichedCompatible): string {
  const typePrefix: Record<string, string> = {
    Text: 'T',
    Image: 'I',
    Video: 'V',
    Audio: 'A',
    URL: 'U',
  };

  const prefix = typePrefix[caseData.submission_type] || 'T';
  const date = new Date(caseData.created_at);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const idSuffix = caseData.id.slice(-8, -5).toUpperCase();

  return `${prefix}-${dateStr}-${idSuffix}`;
}

/**
 * Función para transformar CaseEnriched al DTO de lista
 */
export function transformEnrichedToListItem(caseData: CaseEnrichedCompatible): ValidationCaseListItemDTO {
  return {
    id: caseData.id,
    caseCode: caseData.displayId || generateCaseCodeFromEnriched(caseData),
    contentType: mapSubmissionType(caseData.submission_type as SubmissionType),
    title: caseData.title || 'Sin título',
    summary: caseData.summary || 'No hay resumen disponible.',
    createdAt: caseData.created_at,
    reportedBy: caseData.metadata?.reported_by?.name || 'Usuario anónimo',
    humanValidatorsCount: caseData.human_votes?.count || 0,
    consensusState: (caseData.consensus?.state as ConsensusState) || 'ai_only',
    theme: caseData.metadata?.ai_analysis?.summaries?.theme,
    amiScore: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.score,
    amiLevel: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.nivel,
    screenshotUrl: caseData.metadata?.screenshot,
  };
}

/**
 * Función para transformar un array de CaseEnriched
 */
export function transformEnrichedCasesToListItems(cases: CaseEnrichedCompatible[]): ValidationCaseListItemDTO[] {
  return cases.map(transformEnrichedToListItem);
}

// --- STANDARD DTO SUPPORT (from DTO.json) ---

export interface StandardizedCase {
  id: string;
  created_at: string;
  type: 'text' | 'image' | 'video' | 'audio';
  lifecycle: {
    job_status: 'queued' | 'processing' | 'completed' | 'failed';
    custody_status: 'registered' | 'analyzing' | 'ai_processed' | 'human_review' | 'finalized';
    last_update?: string;
  };
  overview: {
    title: string;
    summary?: string;
    verdict_label: string;
    risk_score: number;
    main_asset_url?: string | null;
    source_domain?: string | null;
  };
  insights: Array<{
    id: string;
    category: 'forensics' | 'content_quality' | 'fact_check' | 'metadata' | 'compliance';
    label: string;
    value: string | number | boolean;
    score?: number | null;
    description?: string;
  }>;
  reporter?: {
    id: string;
    name: string;
    reputation?: number;
  };
}

/**
 * Helper to map standard type to component content type
 */
function mapStandardType(type: StandardizedCase['type']): ValidationCaseListItemDTO['contentType'] {
  const mapping: Record<StandardizedCase['type'], ValidationCaseListItemDTO['contentType']> = {
    text: 'texto',
    image: 'imagen',
    video: 'video',
    audio: 'audio'
  };
  return mapping[type] || 'texto';
}

/**
 * Helper to map risk score to AMI Level
 */
function mapRiskToAMILevel(score: number): AMIComplianceLevel {
  if (score >= 80) return 'Desarrolla las estrategias AMI';
  if (score >= 60) return 'Cumple las premisas AMI';
  if (score >= 40) return 'Requiere un enfoque AMI';
  return 'No cumple las premisas AMI';
}

/**
 * Transform StandardizedCase to ValidationCaseListItemDTO
 */
export function transformStandardizedCaseToListItem(stdCase: StandardizedCase): ValidationCaseListItemDTO {
  // Generate a display code if not present (logic similar to others)
  const date = new Date(stdCase.created_at);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const idSuffix = stdCase.id ? stdCase.id.slice(-3).toUpperCase() : '000';
  const prefix = stdCase.type.charAt(0).toUpperCase();
  const caseCode = `${prefix}-${dateStr}-${idSuffix}`;

  return {
    id: stdCase.id,
    caseCode: caseCode,
    contentType: mapStandardType(stdCase.type),
    title: stdCase.overview.title || 'Sin Título',
    summary: stdCase.overview.summary || '',
    createdAt: stdCase.created_at,
    reportedBy: stdCase.reporter?.name || 'Sistema',
    humanValidatorsCount: 0, // DTO doesn't strictly have this yet, default to 0
    consensusState: 'ai_only', // Default state
    theme: 'General', // Could extract from insights if needed
    amiScore: stdCase.overview.risk_score,
    amiLevel: mapRiskToAMILevel(stdCase.overview.risk_score),
    screenshotUrl: stdCase.overview.main_asset_url || undefined
  };
}

export function transformStandardizedCasesToListItems(cases: StandardizedCase[]): ValidationCaseListItemDTO[] {
  return cases.map(transformStandardizedCaseToListItem);
}
