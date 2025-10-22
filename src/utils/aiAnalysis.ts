import { supabase } from './supabase/client'

// API Base URL for Supabase Functions
const SUPABASE_FUNCTION_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth'

// Types based on OpenAPI spec
export type TransmissionVector = 'WhatsApp' | 'Telegram' | 'Facebook' | 'Twitter' | 'Email' | 'Otro'

export interface IngestRequest {
  url?: string
  text?: string
  vector_de_transmision?: TransmissionVector
}

export interface JobAcceptedResponse {
  job_id: string
  message: string
}

export interface JobStatusResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: FullAnalysisResponse
  resultBotilito?: {
    text: string
  }
  error?: {
    message: string
    stack?: string
  }
}

export interface ConsensusBreakdown {
  weighted_score: number
  agreement_score: number
  ai_agrees: boolean
  human_votes: number
}

export interface Consensus {
  state: 'ai_only' | 'human_consensus' | 'conflicted'
  final_labels: string[]
  breakdown: Record<string, ConsensusBreakdown> | null
}

export interface RelatedDocument {
  id: string
  url: string
  title: string
  summary: string
  similarity: number
}

export interface WebSearchResult {
  title: string
  url: string
  snippet?: string
}

export interface DocumentMetadata {
  theme?: string
  region?: string
  classification_labels?: Record<string, string>
  isTextSubmission?: boolean
  submissionType?: string
  vectores_de_transmision?: string[]
}

export interface CaseStudyMetadata {
  ai_labels?: Record<string, string>
  related_documents?: RelatedDocument[]
  web_search_results?: WebSearchResult[]
}

export interface CaseStudy {
  id: string
  summary: string
  metadata?: CaseStudyMetadata
  embedding?: any
  created_at: string
  case_number?: number
  consensus_score?: any
}

export interface FullAnalysisResponse {
  id: string
  url?: string
  title: string
  summary: string
  created_at: string
  metadata?: DocumentMetadata
  case_study?: CaseStudy
  consensus?: Consensus
}

/**
 * Submit content for AI analysis
 * Returns either a job_id for polling or cached result
 */
export async function submitContentForAnalysis(
  request: IngestRequest
): Promise<{ type: 'job'; jobId: string } | { type: 'cached'; result: FullAnalysisResponse }> {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.')
  }

  const response = await fetch(`${SUPABASE_FUNCTION_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  // Check if it's a cached result (200) or job accepted (202)
  if (data.job_id) {
    // Job accepted - need to poll
    return { type: 'job', jobId: data.job_id }
  } else {
    // Cached result - return immediately
    return { type: 'cached', result: data }
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.')
  }

  const response = await fetch(`${SUPABASE_FUNCTION_URL}/status/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Poll job status until completion or failure
 * Updates progress callback during polling
 */
export async function pollJobUntilComplete(
  jobId: string,
  onProgress?: (progress: number, status: string) => void
): Promise<FullAnalysisResponse> {
  const maxRetries = 60 // 60 * 3s = 180s (3 minutes) max wait
  const pollInterval = 3000 // 3 seconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const jobStatus = await getJobStatus(jobId)

    // Calculate simulated progress based on status and attempts
    let progress = 0
    if (jobStatus.status === 'pending') {
      // Pending: 0-20% (slower progression)
      progress = Math.min(10 + (attempt * 0.5), 20)
    } else if (jobStatus.status === 'processing') {
      // Processing: 20-95% (steady progression)
      progress = Math.min(20 + (attempt * 1.5), 95)
    } else if (jobStatus.status === 'completed') {
      progress = 100
    } else if (jobStatus.status === 'failed') {
      progress = 0
    }

    // Call progress callback
    if (onProgress) {
      onProgress(progress, jobStatus.status)
    }

    // Check if complete
    if (jobStatus.status === 'completed' && jobStatus.result) {
      return jobStatus.result
    }

    // Check if failed
    if (jobStatus.status === 'failed') {
      const errorMsg = jobStatus.error?.message || 'El análisis falló'
      throw new Error(errorMsg)
    }

    // Wait before next poll (unless this is the last attempt)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
  }

  // Timeout
  throw new Error('El análisis está tomando más tiempo del esperado. Por favor, intenta de nuevo más tarde.')
}

/**
 * Extract Botilito summary text from job status response
 * Returns the Botilito-personalized summary if available, otherwise falls back to regular summary
 */
export function extractBotilitoSummary(jobStatus: JobStatusResponse): string | undefined {
  // Primary: Use Botilito's personalized summary if available
  if (jobStatus.resultBotilito?.text) {
    return jobStatus.resultBotilito.text
  }

  // Fallback: Use regular summary from result
  return jobStatus.result?.summary
}

/**
 * Main function to analyze content (URL or text)
 * Handles submission, polling, and progress updates
 */
export async function analyzeContent(
  content: { url?: string; text?: string },
  transmissionVector?: TransmissionVector,
  onProgress?: (progress: number, status: string) => void
): Promise<FullAnalysisResponse> {
  // Validate input
  if (!content.url && !content.text) {
    throw new Error('Debes proporcionar una URL o texto para analizar')
  }

  // Build request
  const request: IngestRequest = {
    ...content,
  }

  // Add transmission vector if provided
  if (transmissionVector) {
    request.vector_de_transmision = transmissionVector
  }

  // Submit for analysis
  const submission = await submitContentForAnalysis(request)

  // If cached, return immediately
  if (submission.type === 'cached') {
    if (onProgress) {
      onProgress(100, 'completed')
    }
    return submission.result
  }

  // Otherwise, poll until complete
  return await pollJobUntilComplete(submission.jobId, onProgress)
}
