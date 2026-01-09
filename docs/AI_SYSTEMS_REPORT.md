# Botilito AI Systems Report

> **Generated:** January 2026
> **Version:** 1.0
> **Platform:** Botilito - Digital Forensic Analysis Platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [AI Providers & Services](#2-ai-providers--services)
3. [Analysis Capabilities](#3-analysis-capabilities)
   - [Text Analysis](#31-text-analysis)
   - [Image Analysis](#32-image-analysis)
   - [Audio Analysis](#33-audio-analysis)
4. [API Architecture](#4-api-architecture)
5. [Supabase Edge Functions](#5-supabase-edge-functions)
6. [Request/Response Flow](#6-requestresponse-flow)
7. [TypeScript Types & Interfaces](#7-typescript-types--interfaces)
8. [Error Handling System](#8-error-handling-system)
9. [Human-AI Consensus System](#9-human-ai-consensus-system)
10. [Caching Strategy](#10-caching-strategy)
11. [Configuration & Environment Variables](#11-configuration--environment-variables)
12. [Additional AI Features](#12-additional-ai-features)
13. [Source File Reference](#13-source-file-reference)
14. [OpenAPI Specifications](#14-openapi-specifications)

---

## 1. Executive Summary

Botilito is a **multi-modal AI forensic analysis platform** designed for detecting manipulated media (images, audio, video) and misinformation content. The platform integrates **4 primary AI providers** across **3 content analysis types** using an async job-based architecture with intelligent polling, hash-based caching, and human-AI consensus verification.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Text Analysis** | Misinformation detection, fact-checking, UNESCO AMI framework compliance |
| **Image Analysis** | Pixel-level forensic analysis, manipulation detection, heatmap generation |
| **Audio Analysis** | Deepfake detection, speech-to-text transcription, synthetic voice identification |
| **Human Verification** | Community-driven consensus voting on AI predictions |

### Technology Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Supabase Edge Functions + Python Microservices
- **AI Services:** OpenRouter, Google Gemini, Custom ML Models
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2

---

## 2. AI Providers & Services

### 2.1 Primary AI Providers

| Provider | Service Type | Purpose | Environment Variable |
|----------|--------------|---------|----------------------|
| **OpenRouter** | LLM Gateway | Multi-model text analysis, content classification | `OPENROUTER_API_KEY` |
| **Google Gemini** | Vision & Text | Audio narrative generation, multimodal analysis | `GEMINI_API_KEY` |
| **Google Search API** | Web Search | Fact-checking, source verification | `GOOGLE_API_KEY` |
| **Nebius** | ML Inference | Model deployment infrastructure | `NEBIUS_API_KEY` |

### 2.2 Custom ML Engines

Located in backend Python microservices (external to this repository):

| Engine | Purpose | Techniques |
|--------|---------|------------|
| **Image Forensics** | Manipulation detection | ELA, Noise Analysis, SLIC, Clone Detection |
| **Audio Forensics** | Deepfake detection | Spectrogram analysis, synthesis detection |
| **Fact-Checker** | Claim verification | Evidence extraction, source credibility |

### 2.3 Provider Usage Matrix

```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│    Provider     │     Text     │    Image     │    Audio     │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ OpenRouter      │      ✓       │      -       │      -       │
│ Google Gemini   │      ✓       │      ✓       │      ✓       │
│ Custom ML       │      -       │      ✓       │      ✓       │
│ Google Search   │      ✓       │      -       │      -       │
└─────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 3. Analysis Capabilities

### 3.1 Text Analysis

#### Overview

| Attribute | Value |
|-----------|-------|
| **Framework** | UNESCO AMI (Alfabetización Mediática e Informacional) |
| **Endpoint** | `/text-analysis-DTO` |
| **Version** | v2.9.0 |
| **Input Types** | URL, Direct Text |

#### AI Tasks Performed

1. **Content Classification**
   - Evaluates content against 20 AMI criteria
   - Assigns competency scores (0-1 scale)
   - Categories: Access to Information, Critical Evaluation, Context Understanding, Responsible Production

2. **Fact-Checking**
   - Extracts verifiable claims from content
   - Cross-references with trusted sources
   - Generates evidence-based verdicts

3. **Summary Generation**
   - Short summary (1-2 sentences)
   - Medium summary (1 paragraph)
   - Long summary (detailed analysis)

4. **Credibility Assessment**
   - Source domain reputation
   - Author credibility
   - Publication history

5. **Tone & Sentiment Analysis**
   - Emotional language detection
   - Bias identification
   - Persuasion technique recognition

#### Output Structure

```typescript
interface TextAnalysisResult {
  source_data: {
    url?: string
    title?: string
    text?: string
    vector_de_transmision?: TransmissionVector
  }
  ai_analysis: {
    classification: {
      indiceCumplimientoAMI: { score: number, nivel: string }
      criterios: Record<string, AMICriterion>
      recomendaciones?: string[]
    }
    summaries: {
      short: string
      medium: string
      long: string
    }
  }
  evidence: {
    fact_check_table: FactCheckItem[]
  }
}
```

#### Verdict Labels

| Verdict | Description | Color Code |
|---------|-------------|------------|
| `Verificado` | Claim verified as accurate | Green |
| `Refutado` | Claim proven false | Red |
| `No Verificable` | Insufficient evidence | Yellow |
| `Engañoso` | Misleading but not entirely false | Orange |
| `Sátira` | Satirical content | Blue |

---

### 3.2 Image Analysis

#### Overview

| Attribute | Value |
|-----------|-------|
| **Framework** | Multi-level Forensic Pyramid |
| **Endpoint** | `/image-analysis` |
| **Version** | v3.0.0 |
| **Input Types** | Image files (JPEG, PNG, WebP, etc.) |

#### Forensic Algorithms

| Algorithm | Purpose | Output |
|-----------|---------|--------|
| **ELA (Error Level Analysis)** | Detects compression inconsistencies | Heatmap |
| **Noise Analysis** | Identifies noise pattern anomalies | Heatmap |
| **SLIC Segmentation** | Detects splicing boundaries | Segmentation map |
| **Ghosting Detection** | Finds copy-paste artifacts | Binary mask |
| **Clone Detection** | Identifies duplicated regions | Match coordinates |

#### Analysis Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    LEVEL 3: FINAL VERDICT                   │
│  - Manipulation probability (0-100)                         │
│  - Severity index (0-1)                                     │
│  - Final label (Auténtico/Manipulado/etc.)                 │
│  - User explanation                                         │
├─────────────────────────────────────────────────────────────┤
│                   LEVEL 2: INTEGRATION                      │
│  - Consistency score                                        │
│  - Metadata risk score                                      │
│  - Tampering type classification                            │
│  - Synthesis notes                                          │
├─────────────────────────────────────────────────────────────┤
│              LEVEL 1: INDIVIDUAL ALGORITHMS                 │
│  - ELA results + significance score                         │
│  - Noise analysis + significance score                      │
│  - SLIC results + significance score                        │
│  - Ghosting detection + significance score                  │
│  - Clone detection + significance score                     │
└─────────────────────────────────────────────────────────────┘
```

#### Output Structure

```typescript
interface ImageAnalysisResult {
  meta: {
    job_id: string
    timestamp: string
    status: JobStatus
  }
  human_report: {
    level_1_analysis: Level1AnalysisItem[]
    level_2_integration: {
      consistency_score: number
      metadata_risk_score: number
      tampering_type: TamperingType
      synthesis_notes: string
    }
    level_3_verdict: {
      manipulation_probability: number  // 0-100
      severity_index: number            // 0-1
      final_label: VerdictLabel
      user_explanation: string
    }
  }
  raw_forensics: RawForensicsItem[]  // Heatmaps, masks
  file_info: FileInfo
  chain_of_custody: ChainOfCustodyEvent[]
}
```

#### Verdict Labels

| Label | Risk Score | Description |
|-------|------------|-------------|
| `Auténtico` | 0-29 | No manipulation detected |
| `Baja Sospecha` | 30-49 | Minor anomalies, likely authentic |
| `Alta Sospecha` | 50-79 | Significant anomalies detected |
| `Confirmado Manipulado` | 80-100 | Clear evidence of manipulation |

---

### 3.3 Audio Analysis

#### Overview

| Attribute | Value |
|-----------|-------|
| **Framework** | Forensic + Transcription + Synthesis Detection |
| **Endpoint** | `/audio-analysis` |
| **Version** | v1.1.0 |
| **Input Types** | Audio files (MP3, WAV, M4A, etc.) |

#### AI Tasks Performed

1. **Speech-to-Text Transcription**
   - Auto language detection
   - High-accuracy transcription
   - Timestamp alignment

2. **Synthetic Voice Detection**
   - Deepfake identification
   - AI-generated voice detection
   - Cloning signature analysis

3. **Manipulation Detection**
   - Audio splicing detection
   - Editing artifact identification
   - Compression anomaly analysis

4. **Spectrogram Analysis**
   - Visual representation of audio frequencies
   - Anomaly highlighting
   - Pattern comparison

#### Output Structure

```typescript
interface AudioAnalysisResult {
  type: 'audio_analysis'
  meta: {
    job_id: string
    timestamp: string
    status: JobStatus
  }
  human_report: {
    summary: string
    transcription: {
      text: string
      language?: string
      confidence?: number
    }
    audio_forensics: {
      authenticity_score: number      // 0-100
      manipulation_detected: boolean
      anomalies: string[]
    }
    verdict: {
      conclusion: string
      confidence: number
      risk_level: RiskLevel
    }
  }
  assets: {
    report_html: string    // HTML formatted report
    spectrogram: string    // Base64 or URL
  }
  file_info: AudioFileInfo
}
```

#### Manipulation Types

| Type | Description | Indicators |
|------|-------------|------------|
| `Ninguna` | No manipulation detected | Clean spectrogram, consistent patterns |
| `Clonación` | Voice cloning detected | Synthetic markers, unnatural prosody |
| `Edición` | Audio editing detected | Splicing artifacts, compression anomalies |

---

## 4. API Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                     (React + Vite + TypeScript)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ ContentUpload│  │AnalysisView │  │ VotingPanel  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER                             │   │
│  │  textAnalysisService | imageAnalysisService | audioService   │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS                          │
│                        (API Gateway)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐          │
│  │text-analysis   │ │image-analysis  │ │audio-analysis  │          │
│  │     -DTO       │ │                │ │                │          │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘          │
│          │                  │                  │                    │
└──────────┼──────────────────┼──────────────────┼────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND MICROSERVICES                            │
│                  (Python + ML Models)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  OpenRouter │  │   Gemini    │  │  Custom ML  │                 │
│  │    (LLM)    │  │  (Vision)   │  │  (Forensic) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STORAGE                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │    Supabase     │  │  Cloudflare R2  │  │     Cache       │     │
│  │   PostgreSQL    │  │  (File Storage) │  │  (Hash-based)   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Request Flow

```
1. USER ACTION
   │
   ▼
2. FRONTEND SERVICE
   │  - Validate input
   │  - Generate file hash (if applicable)
   │  - Prepare request payload
   │
   ▼
3. POST /submit
   │  - Check cache (hash-based)
   │  - If cached: return immediate result
   │  - If new: create async job
   │
   ▼
4. JOB QUEUE
   │  - Job ID returned to frontend
   │  - Backend processes asynchronously
   │
   ▼
5. POLLING LOOP
   │  GET /status/{jobId}
   │  - pending → processing → completed/failed
   │  - Exponential backoff on retries
   │
   ▼
6. RESULT TRANSFORMATION
   │  - StandardizedCase DTO normalization
   │  - UI-ready data structures
   │
   ▼
7. UI RENDERING
   - Display results, verdicts, visualizations
```

---

## 5. Supabase Edge Functions

### 5.1 Analysis Endpoints

| Function | Version | Method | Purpose |
|----------|---------|--------|---------|
| `/text-analysis-DTO` | v2.9.0 | POST/GET | Text & URL content analysis |
| `/image-analysis` | v3.0.0 | POST/GET | Image forensic analysis |
| `/audio-analysis` | v1.1.0 | POST/GET | Audio forensic & transcription |

### 5.2 Search & Lookup Endpoints

| Function | Version | Method | Purpose |
|----------|---------|--------|---------|
| `/search-dto` | v2.3.0 | POST | Unified search across cases |
| `/search-dto/lookup` | v2.3.0 | POST | Single case lookup |
| `/search-dto/summary` | v2.3.0 | POST | Case summary generation |

### 5.3 Voting & Consensus Endpoints

| Function | Version | Method | Purpose |
|----------|---------|--------|---------|
| `/vote-auth-async-verbose` | v2.4.0 | POST | Submit human verification vote |
| `/vote-auth-async-verbose/status` | v2.4.0 | GET | Check consensus state |

### 5.4 Utility Endpoints

| Function | Version | Method | Purpose |
|----------|---------|--------|---------|
| `/web-snapshot` | - | POST | URL scraping & screenshot capture |
| `/inmunizacion` | - | POST | Counter-narrative generation |
| `/mapa-desinfodemico-verbose` | v5.1.0 | POST | Misinformation map dashboard |
| `/admin-dashboard` | - | POST | Admin operations |
| `/profileCRUD` | v1.2.0 | PUT/GET | User profile management |

### 5.5 Base URL

```
https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/
```

---

## 6. Request/Response Flow

### 6.1 Text Analysis Flow

```typescript
// 1. Submit request
POST /text-analysis-DTO/submit
{
  "url": "https://example.com/article",
  // OR
  "text": "Content to analyze...",
  "use_cache": true,
  "vector_de_transmision": "Web"  // Web|WhatsApp|Telegram|Twitter|Facebook|Email
}

// 2. Response (immediate if cached, or job created)
{
  "id": "job_abc123",
  "status": "pending",  // or "completed" if cached
  "result": null        // or full result if cached
}

// 3. Poll for status
GET /text-analysis-DTO/status/job_abc123

// 4. Final response
{
  "id": "job_abc123",
  "status": "completed",
  "result": {
    "source_data": { ... },
    "ai_analysis": { ... },
    "evidence": { ... }
  }
}
```

### 6.2 Image Analysis Flow

```typescript
// 1. Initialize chunked upload
POST /image-analysis/upload_session
{
  "file_name": "image.jpg",
  "file_size": 4500000,
  "file_hash": "sha256:abc123...",
  "content_type": "image/jpeg"
}

// 2. Upload chunks (4MB each)
POST /image-analysis/upload_session
{
  "session_id": "session_xyz",
  "chunk_index": 0,
  "chunk_data": "<base64>"
}

// 3. Finish upload & start analysis
POST /image-analysis/upload_session?action=finish
{
  "session_id": "session_xyz",
  "use_cache": true
}

// 4. Poll for status
GET /image-analysis/status/job_abc123

// 5. Final response with forensic results
{
  "id": "job_abc123",
  "status": "completed",
  "result": {
    "human_report": { ... },
    "raw_forensics": [ ... ]
  }
}
```

### 6.3 Audio Analysis Flow

```typescript
// 1. Submit audio (base64 encoded)
POST /audio-analysis/submit
{
  "audio_data": "data:audio/mp3;base64,//uQx...",
  "file_name": "recording.mp3",
  "use_cache": true
}

// 2. Poll for status
GET /audio-analysis/status/job_abc123

// 3. Final response
{
  "id": "job_abc123",
  "status": "completed",
  "result": {
    "human_report": {
      "transcription": { "text": "..." },
      "audio_forensics": { ... },
      "verdict": { ... }
    },
    "assets": {
      "spectrogram": "https://..."
    }
  }
}
```

### 6.4 Polling Configuration

| Analysis Type | Poll Interval | Max Attempts | Total Timeout |
|---------------|---------------|--------------|---------------|
| Text | 3 seconds | 60 | 3 minutes |
| Image | 2 seconds | 60 | 2 minutes |
| Audio | 3 seconds | 90 | 4.5 minutes |

**Global Hang Detection:** `HANG_DETECTION_MS = 245000` (4 minutes 5 seconds)

---

## 7. TypeScript Types & Interfaces

### 7.1 Universal StandardizedCase DTO

```typescript
/**
 * Universal response format across all analysis types
 * Enables consistent UI rendering and cross-type comparisons
 */
interface StandardizedCase {
  id: string
  type: 'text' | 'image' | 'audio' | 'video'
  created_at: string  // ISO8601

  lifecycle: {
    job_status: 'pending' | 'processing' | 'completed' | 'failed'
    custody_status: string
    last_update?: string
  }

  overview: {
    title: string
    summary: string
    verdict_label: string
    risk_score: number  // 0-100
    main_asset_url?: string
    source_domain?: string
  }

  insights: GenericInsight[]  // Polymorphic by category

  reporter?: {
    id: string
    name: string
    reputation: number
  }

  community?: {
    votes: number
    status: ConsensusStatus
    breakdown: VoteBreakdown
  }
}
```

### 7.2 Generic Insight Interface

```typescript
/**
 * Polymorphic insight object - varies by category
 */
interface GenericInsight {
  id: string
  category: 'forensics' | 'metadata' | 'content_quality' | 'fact_check' | 'recommendation'
  label: string
  value?: string
  score?: number  // 0-100
  description: string
  artifacts?: Artifact[]
  raw_data?: Record<string, any>
}

interface Artifact {
  type: 'image_url' | 'text_snippet' | 'spectrogram' | 'heatmap'
  label: string
  content: string  // URL or text content
}
```

### 7.3 Text Analysis Types

```typescript
interface AMICriterion {
  nombre: string
  score: number  // 0, 0.5, or 1
  justificacion: string
  evidencias?: string[]
  cita?: string
  referencia?: string
}

interface FactCheckItem {
  claim: string
  verdict: 'Verificado' | 'Refutado' | 'No Verificable'
  explanation: string
  sources?: string[]
}

type TransmissionVector =
  | 'Web'
  | 'WhatsApp'
  | 'Telegram'
  | 'Twitter'
  | 'Facebook'
  | 'Email'
```

### 7.4 Image Analysis Types

```typescript
interface Level1AnalysisItem {
  algorithm: 'ELA' | 'Noise' | 'SLIC' | 'Ghosting' | 'Clone'
  significance_score: number  // 0-1
  interpretation: string
  timestamp?: string
}

interface Level2Integration {
  consistency_score: number
  metadata_risk_score: number
  tampering_type: 'Inexistente' | 'Global (Filtros)' | 'Local (Inserción/Clonado)'
  synthesis_notes: string
}

interface Level3Verdict {
  manipulation_probability: number  // 0-100
  severity_index: number            // 0-1
  final_label: 'Auténtico' | 'Baja Sospecha' | 'Alta Sospecha' | 'Confirmado Manipulado'
  user_explanation: string
}

interface RawForensicsItem {
  algorithm: string
  heatmap_url?: string
  binary_mask_url?: string
  raw_output?: any
}
```

### 7.5 Audio Analysis Types

```typescript
interface AudioForensics {
  is_synthetic: boolean
  confidence_score: number  // 0-100
  manipulation_type: 'Ninguna' | 'Clonación' | 'Edición'
  explanation: string
  anomalies: string[]
}

interface Transcription {
  text: string
  language?: string
  confidence?: number
  segments?: TranscriptionSegment[]
}

interface TranscriptionSegment {
  start: number  // seconds
  end: number
  text: string
  confidence: number
}
```

### 7.6 Job Status Types

```typescript
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface JobStatusResponse {
  id: string
  status: JobStatus
  progress?: number  // 0-100
  result?: StandardizedCase
  error?: {
    code: string
    message: string
  }
}
```

### 7.7 Consensus Types

```typescript
type ConsensusStatus = 'ai_only' | 'human_consensus' | 'conflicted'

interface VoteBreakdown {
  verificado: number
  falso: number
  enganoso: number
  no_verificable: number
  satira: number
}

interface VoteSubmission {
  case_id: string
  classification: 'Verificado' | 'Falso' | 'Engañoso' | 'No Verificable' | 'Sátira'
  comment?: string
}
```

---

## 8. Error Handling System

### 8.1 Error Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR MANAGER                            │
│              src/utils/errorManager/                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  ErrorCodes.ts  │  │ ErrorManager.ts │                  │
│  │  (50+ codes)    │  │ (tracking)      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │CircuitBreaker.ts│  │RetryStrategy.ts │                  │
│  │ (fault tolerance│  │(exp. backoff)   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 AI-Specific Error Codes

#### OpenRouter Errors

| Code | HTTP | Description | Recovery |
|------|------|-------------|----------|
| `ERR_CONFIG_MISSING_OPENROUTER_KEY` | 500 | API key not configured | FAIL |
| `ERR_API_OPENROUTER_TIMEOUT` | 504 | Request timeout | RETRY |
| `ERR_API_OPENROUTER_RATE_LIMIT` | 429 | Rate limit exceeded | CIRCUIT_BREAK |
| `ERR_API_OPENROUTER_AUTH` | 401 | Authentication failed | FAIL |
| `ERR_API_OPENROUTER_INVALID_RESPONSE` | 502 | Invalid response format | RETRY |
| `ERR_API_OPENROUTER_NO_CONTENT` | 502 | Empty response | RETRY |

#### Gemini Errors

| Code | HTTP | Description | Recovery |
|------|------|-------------|----------|
| `ERR_CONFIG_MISSING_GEMINI_KEY` | 500 | API key not configured | FAIL |
| `ERR_API_GEMINI_TIMEOUT` | 504 | Request timeout | RETRY |
| `ERR_API_GEMINI_RATE_LIMIT` | 429 | Rate limit exceeded | CIRCUIT_BREAK |
| `ERR_API_GEMINI_INVALID_EMBEDDING` | 400 | Invalid embedding response | FAIL |

#### Browserless/Scraping Errors

| Code | HTTP | Description | Recovery |
|------|------|-------------|----------|
| `ERR_API_BROWSERLESS_TIMEOUT` | 504 | Scraping timeout | RETRY |
| `ERR_API_BROWSERLESS_FETCH_FAILED` | 502 | Failed to fetch URL | FAIL |
| `ERR_API_BROWSERLESS_INVALID_URL` | 400 | Invalid URL provided | FAIL |

#### General Errors

| Code | HTTP | Description | Recovery |
|------|------|-------------|----------|
| `ERR_PARSING_LLM_RESPONSE` | 500 | Failed to parse AI response | RETRY |
| `ERR_PARSING_AI_CONFIG` | 500 | Invalid AI configuration | FAIL |
| `ERR_TIMEOUT_JOB` | 504 | Job exceeded time limit | FAIL |
| `ERR_TIMEOUT_OPERATION` | 504 | Operation timed out | RETRY |

### 8.3 Circuit Breaker Configuration

| Service | Failure Threshold | Time Window | Cooldown Period |
|---------|-------------------|-------------|-----------------|
| OpenRouter | 5 failures | 1 minute | 30 seconds |
| Gemini | 3 failures | 1 minute | 60 seconds |
| Browserless | 2 failures | 1 minute | 120 seconds |

### 8.4 Retry Strategy

```typescript
// Exponential backoff configuration
const retryConfig = {
  maxAttempts: 60,
  baseDelay: 2000,      // 2 seconds
  maxDelay: 30000,      // 30 seconds
  multiplier: 1.5,
  jitter: true          // Random jitter to prevent thundering herd
}
```

---

## 9. Human-AI Consensus System

### 9.1 Overview

The consensus system enables community validation of AI analysis results, combining machine intelligence with human judgment.

### 9.2 Consensus States

| State | Description | UI Indicator |
|-------|-------------|--------------|
| `ai_only` | Only AI verdict available, no human votes | Gray badge |
| `human_consensus` | Humans agree with AI verdict | Green badge |
| `conflicted` | Human votes disagree with AI | Orange badge |

### 9.3 Vote Options

| Option | Spanish | Description |
|--------|---------|-------------|
| Verified | Verificado | Content is accurate |
| False | Falso | Content is false/fabricated |
| Misleading | Engañoso | Content is misleading but not entirely false |
| Unverifiable | No Verificable | Cannot be verified with available evidence |
| Satire | Sátira | Content is satirical/parody |

### 9.4 API Flow

```typescript
// Submit vote
POST /vote-auth-async-verbose/submit
{
  "case_id": "case_abc123",
  "classification": "Falso",
  "comment": "Source has been debunked by Reuters"
}

// Check consensus state
GET /vote-auth-async-verbose/status/case_abc123

// Response
{
  "case_id": "case_abc123",
  "ai_verdict": "Alta Sospecha",
  "consensus_status": "human_consensus",
  "vote_count": 15,
  "breakdown": {
    "falso": 12,
    "enganoso": 2,
    "no_verificable": 1
  }
}
```

### 9.5 Gamification

| Action | XP Reward |
|--------|-----------|
| Profile completion | +50 XP |
| First vote | +10 XP |
| Vote streak (7 days) | +25 XP |
| Correct prediction (matches consensus) | +15 XP |

---

## 10. Caching Strategy

### 10.1 Hash-Based Deduplication

```typescript
// File hash generation
async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
```

### 10.2 Cache Behavior

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Cache hit | 200 | Immediate result |
| Cache miss | 202 | Job ID, start polling |
| Cache disabled | 202 | Always new analysis |

### 10.3 Cache Parameters

```typescript
// All submit endpoints accept use_cache parameter
interface SubmitRequest {
  // ... other fields
  use_cache?: boolean  // Default: true
}
```

### 10.4 Cache Invalidation

- Cache entries are content-addressed (hash-based)
- No explicit TTL (content is immutable)
- Manual invalidation available via admin API

---

## 11. Configuration & Environment Variables

### 11.1 Frontend Variables (VITE_ prefix)

```bash
# Supabase Connection
VITE_SUPABASE_URL=https://mdkswlgcqsmgfmcuorxq.supabase.co
VITE_SUPABASE_ANON_KEY=<JWT anon token>

# External Services
VITE_SCREENSHOT_API_KEY=be76ee
```

### 11.2 Backend Variables (Server-side only)

```bash
# Supabase Admin
SUPABASE_SERVICE_ROLE_KEY=<JWT service role key>
SUPABASE_DB_PASSWORD=<database password>

# AI Provider Keys
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...
NEBIUS_API_KEY=<JWT token>

# Configuration
HANG_DETECTION_MS=245000
API_LOG_LEVEL=DEBUG
```

### 11.3 Security Notes

- All API keys are stored server-side only
- Frontend uses Supabase anon key (public, rate-limited)
- JWT tokens include user context for authorization
- Edge functions validate tokens before processing

---

## 12. Additional AI Features

### 12.1 Inmunización (Immunization)

**Purpose:** Generate counter-narratives against identified misinformation

```typescript
POST /inmunizacion
{
  "case_id": "case_abc123",
  "resources": [
    { "type": "link", "url": "https://reuters.com/fact-check/..." },
    { "type": "pdf", "content": "<base64>" },
    { "type": "video", "url": "https://youtube.com/..." }
  ]
}
```

**Output:** AI-generated educational content to counter specific misinformation claims

### 12.2 Mapa Desinfodémico (Misinformation Map)

**Purpose:** Geographic and temporal tracking of misinformation spread

**Dimensions:**
- **Alcance (Reach):** Geographic spread of misinformation
- **Magnitud (Magnitude):** Volume of shares/engagement
- **Impacto (Impact):** Potential harm assessment

**API Version:** v5.1.0

### 12.3 Web Snapshot Service

**Purpose:** Capture and archive web content for analysis

**Features:**
- Full page screenshots via ScreenshotMachine API
- HTML content extraction
- Text parsing and cleaning
- Metadata extraction

### 12.4 Admin Dashboard

**Capabilities:**
- Case management
- User moderation
- Analytics and reporting
- System health monitoring

---

## 13. Source File Reference

### 13.1 Service Layer

| File | Size | Purpose |
|------|------|---------|
| `src/services/api.ts` | 11KB | Central API orchestrator |
| `src/services/textAnalysisService.ts` | 2.8KB | Text analysis coordination |
| `src/services/imageAnalysisService.ts` | 10.3KB | Image upload & polling |
| `src/services/audioAnalysisService.ts` | 9KB | Audio submission & processing |
| `src/services/analysisPresentationService.ts` | 39.5KB | Data transformation for UI |
| `src/services/contentAnalysisService.ts` | - | Unified analysis orchestrator |
| `src/services/votingService.ts` | - | Consensus voting |
| `src/services/vectorAsyncService.ts` | - | Search/lookup operations |

### 13.2 Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useAnalysisPolling.ts` | Unified polling logic |
| `src/hooks/useTextAnalysisData.ts` | Text-specific data extraction |
| `src/hooks/useImageAnalysis.ts` | Image-specific data extraction |
| `src/hooks/useAudioAnalysisLogic.ts` | Audio-specific data extraction |
| `src/hooks/useContentAnalysis.ts` | Content submission tracking |

### 13.3 Components

| File | Purpose |
|------|---------|
| `src/components/ContentUpload.tsx` | File/URL upload interface |
| `src/components/TextAIAnalysis.tsx` | Text analysis display |
| `src/components/image-analysis/ImageAnalysisResultView.tsx` | Image forensics visualization |
| `src/components/audio-analysis/AudioAnalysisResultView.tsx` | Audio analysis display |
| `src/components/UnifiedAnalysisView.tsx` | Universal result display |

### 13.4 Types

| File | Purpose |
|------|---------|
| `src/types/textAnalysis.ts` | Text analysis interfaces |
| `src/types/imageAnalysis.ts` | Image forensic interfaces |
| `src/types/audioAnalysis.ts` | Audio analysis interfaces |
| `src/types/botilito.ts` | General domain types |
| `src/types/vector-api.ts` | Search/lookup types |

### 13.5 Utilities

| File | Purpose |
|------|---------|
| `src/utils/aiAnalysis.ts` | AI analysis entry point |
| `src/utils/errorManager/ErrorCodes.ts` | Error definitions |
| `src/utils/errorManager/CircuitBreaker.ts` | Fault tolerance |
| `src/utils/errorManager/RetryStrategy.ts` | Retry logic |
| `src/lib/analysisPipeline.ts` | Web snapshot + analysis |
| `src/lib/apiEndpoints.ts` | Endpoint definitions |
| `src/lib/apiService.ts` | HTTP client |

---

## 14. OpenAPI Specifications

### 14.1 Available Specs

| File | Version | Description |
|------|---------|-------------|
| `text-analysis-dto.json` | v2.9.0 | Text analysis API contract |
| `text-analysis-py.json` | v1.3.0 | Python backend API |
| `image-analysis-api-dto.json` | v3.0.0 | Image analysis API contract |
| `audio-analysis-api.json` | v1.1.0 | Audio analysis API contract |
| `audio-analysis-dto.json` | - | Audio DTO schema |
| `DTO.json` | - | Generic DTO schema |
| `openapi_mapa_desinfodemico.json` | v5.1.0 | Misinformation map API |

### 14.2 Accessing Specs

All OpenAPI specs are located in the repository root directory and can be used with tools like Swagger UI, Postman, or code generators.

---

## Summary

Botilito implements a **production-grade forensic AI platform** featuring:

| Category | Implementation |
|----------|----------------|
| **AI Providers** | OpenRouter, Google Gemini, Google Search, Nebius, Custom ML |
| **Analysis Types** | Text (AMI Framework), Image (Forensic Pyramid), Audio (Deepfake Detection) |
| **Architecture** | Async job queue with polling, hash-based caching |
| **Verification** | Human-AI consensus voting system |
| **Resilience** | Circuit breaker, exponential backoff, error tracking |
| **Standards** | UNESCO AMI Framework, StandardizedCase DTO |

The platform is designed for:
- **Forensic Accuracy:** Detecting manipulated media at pixel/waveform level
- **UNESCO Compliance:** Media literacy evaluation per AMI framework
- **Community Trust:** Human verification of AI predictions
- **Scalability:** Async processing with intelligent caching

---

*Document generated from Botilito codebase analysis*
