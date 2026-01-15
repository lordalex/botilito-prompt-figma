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
    // Added for UI compatibility
    theme?: string;
    amiLevel?: AMIComplianceLevel;
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
  // Make metadata properties accessible
  community?: {
    votes: number;
    status: string;
    breakdown: Record<string, unknown>;
  };
  metadata?: {
    theme?: string;
    amiLevel?: AMIComplianceLevel;
  }
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
    theme: caseData.metadata?.theme || caseData.metadata?.ai_analysis?.summaries?.theme,
    amiScore: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.score,
    amiLevel: caseData.metadata?.amiLevel || caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.nivel,
    screenshotUrl: caseData.metadata?.screenshot,
    community: {
      votes: caseData.human_votes?.count || 0,
      status: String(caseData.consensus?.state) || 'ai_only',
      breakdown: caseData.human_votes?.breakdown || {},
    },
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
  community?: {
    votes: number;
    status: string;
    breakdown: Record<string, unknown>;
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
    // Added for UI compatibility
    theme?: string;
    amiLevel?: AMIComplianceLevel;
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
    theme: caseData.metadata?.theme || caseData.metadata?.ai_analysis?.summaries?.theme,
    amiScore: caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.score,
    amiLevel: caseData.metadata?.amiLevel || caseData.metadata?.ai_analysis?.classification?.indiceCumplimientoAMI?.nivel,
    screenshotUrl: caseData.metadata?.screenshot,
    community: caseData.community,
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
  community?: {
    votes: number;
    status: string;
    breakdown: Record<string, unknown>;
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
 * Helper to determine evaluation (AMI Level) based on case type and insights.
 * Implements Polymorphic logic:
 * - Forensic: Uses verdict_label or forensic insights.
 * - Text/URL: Uses content_quality insights (AMI criteria).
 */
export function getEvaluationFromInsights(
  type: string,
  overview: StandardizedCase['overview'],
  insights: any[] = []
): AMIComplianceLevel {
  const normalizedType = type?.toLowerCase() || 'text';
  const isForensic = ['image', 'video', 'audio'].includes(normalizedType);

  // 1. FORENSIC LOGIC
  if (isForensic) {
    // Check verdict label first (Source of Truth)
    const label = overview?.verdict_label?.toUpperCase() || '';
    if (label.includes('MANIPULADO') || label.includes('MODIFICADO') || label.includes('EDITADO')) {
      return 'No cumple las premisas AMI'; // UI: Manipulado Digitalmente
    }
    if (label.includes('AUTÉNTICO') || label.includes('ORIGINAL') || label.includes('SIN ALTERACIONES')) {
      return 'Cumple las premisas AMI'; // UI: Sin alteraciones
    }
    if (label.includes('GENERADO') || label.includes('SINTÉTICO') || label.includes('IA')) {
      return 'No cumple las premisas AMI'; // Could be mapped to a specific AI class if needed, utilizing "No cumple" for now or existing map
    }

    // Fallback: Check insights if verdict is ambiguous or missing
    const forensicInsights = insights.filter(i => i.category === 'forensics');
    const hasHighManipulationScore = forensicInsights.some(i => (i.score || 0) > 50);

    if (hasHighManipulationScore) {
      return 'No cumple las premisas AMI';
    }
    return 'Cumple las premisas AMI'; // Default to clean if no evidence found
  }

  // 2. TEXT/URL LOGIC (AMI Criteria)
  const amiInsights = insights.filter((i: any) =>
    i.id?.startsWith('ami_crit') || i.category === 'content_quality'
  );

  if (amiInsights.length > 0) {
    const avgScore = amiInsights.reduce((sum: number, i: any) => sum + (i.score || 0), 0) / amiInsights.length;

    if (avgScore >= 80) return 'Desarrolla las estrategias AMI';
    if (avgScore >= 60) return 'Cumple las premisas AMI';
    if (avgScore >= 40) return 'Requiere un enfoque AMI';
    return 'No cumple las premisas AMI';
  }

  // Fallback based on risk score if no specific insights
  return mapRiskToAMILevel(overview?.risk_score || 0);
}

/**
 * Transform StandardizedCase to ValidationCaseListItemDTO
 */
export function transformStandardizedCaseToListItem(stdCase: StandardizedCase): ValidationCaseListItemDTO {
  // Generate a display code if not present (logic similar to others)
  const date = new Date(stdCase.created_at);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const idSuffix = stdCase.id ? stdCase.id.slice(-3).toUpperCase() : '000';
  const prefix = (stdCase.type || 'text').charAt(0).toUpperCase();
  const caseCode = `${prefix}-${dateStr}-${idSuffix}`;

  return {
    id: stdCase.id,
    caseCode: caseCode,
    contentType: mapStandardType(stdCase.type),
    title: stdCase.overview.title || 'Sin Título',
    summary: stdCase.overview.summary || '',
    createdAt: stdCase.created_at,
    // REPORTER: Use explicit reporter name or fallback
    reportedBy: stdCase.reporter?.name || 'Sistema',
    humanValidatorsCount: stdCase.community?.votes || 0,
    consensusState: stdCase.community?.status as ConsensusState || 'ai_only',
    theme: determineTheme(stdCase.type),
    amiScore: stdCase.overview.risk_score,
    // EVALUATION: Use the new helper
    amiLevel: getEvaluationFromInsights(stdCase.type, stdCase.overview, stdCase.insights),
    screenshotUrl: stdCase.overview.main_asset_url || undefined,
    community: stdCase.community,
  };
}

export function transformStandardizedCasesToListItems(cases: StandardizedCase[]): ValidationCaseListItemDTO[] {
  return cases.map(transformStandardizedCaseToListItem);
}

// Helper needed for determineTheme since it was local in api.ts but useful here
function determineTheme(type: string): string {
  const t = type?.toLowerCase() || '';
  if (['image', 'video', 'audio'].includes(t)) return 'Forense';
  return 'Infodémico';
}
