# Informe de Sistemas de IA de Botilito

> **Generado:** Enero 2026
> **Versión:** 1.0
> **Plataforma:** Botilito - Plataforma de Análisis Forense Digital

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Proveedores y Servicios de IA](#2-proveedores-y-servicios-de-ia)
3. [Capacidades de Análisis](#3-capacidades-de-análisis)
   - [Análisis de Texto](#31-análisis-de-texto)
   - [Análisis de Imagen](#32-análisis-de-imagen)
   - [Análisis de Audio](#33-análisis-de-audio)
4. [Arquitectura de API](#4-arquitectura-de-api)
5. [Funciones Edge de Supabase](#5-funciones-edge-de-supabase)
6. [Flujo de Solicitud/Respuesta](#6-flujo-de-solicitudrespuesta)
7. [Tipos e Interfaces de TypeScript](#7-tipos-e-interfaces-de-typescript)
8. [Sistema de Manejo de Errores](#8-sistema-de-manejo-de-errores)
9. [Sistema de Consenso Humano-IA](#9-sistema-de-consenso-humano-ia)
10. [Estrategia de Caché](#10-estrategia-de-caché)
11. [Configuración y Variables de Entorno](#11-configuración-y-variables-de-entorno)
12. [Características Adicionales de IA](#12-características-adicionales-de-ia)
13. [Referencia de Archivos Fuente](#13-referencia-de-archivos-fuente)
14. [Especificaciones OpenAPI](#14-especificaciones-openapi)

---

## 1. Resumen Ejecutivo

Botilito es una **plataforma de análisis forense multimodal con IA** diseñada para detectar medios manipulados (imágenes, audio, video) y contenido de desinformación. La plataforma integra **4 proveedores principales de IA** en **3 tipos de análisis de contenido** utilizando una arquitectura basada en trabajos asíncronos con sondeo inteligente, caché basado en hash y verificación de consenso humano-IA.

### Capacidades Principales

| Capacidad | Descripción |
|-----------|-------------|
| **Análisis de Texto** | Detección de desinformación, verificación de hechos, cumplimiento del marco AMI de UNESCO |
| **Análisis de Imagen** | Análisis forense a nivel de píxel, detección de manipulación, generación de mapas de calor |
| **Análisis de Audio** | Detección de deepfakes, transcripción de voz a texto, identificación de voz sintética |
| **Verificación Humana** | Votación de consenso impulsada por la comunidad sobre predicciones de IA |

### Stack Tecnológico

- **Frontend:** React + Vite + TypeScript
- **Backend:** Funciones Edge de Supabase + Microservicios Python
- **Servicios de IA:** OpenRouter, Google Gemini, Modelos ML Personalizados
- **Base de Datos:** Supabase PostgreSQL
- **Almacenamiento:** Cloudflare R2

---

## 2. Proveedores y Servicios de IA

### 2.1 Proveedores Principales de IA

| Proveedor | Tipo de Servicio | Propósito | Variable de Entorno |
|-----------|------------------|-----------|---------------------|
| **OpenRouter** | Gateway LLM | Análisis de texto multi-modelo, clasificación de contenido | `OPENROUTER_API_KEY` |
| **Google Gemini** | Visión y Texto | Generación de narrativas de audio, análisis multimodal | `GEMINI_API_KEY` |
| **Google Search API** | Búsqueda Web | Verificación de hechos, verificación de fuentes | `GOOGLE_API_KEY` |
| **Nebius** | Inferencia ML | Infraestructura de despliegue de modelos | `NEBIUS_API_KEY` |

### 2.2 Motores ML Personalizados

Ubicados en microservicios backend de Python (externos a este repositorio):

| Motor | Propósito | Técnicas |
|-------|-----------|----------|
| **Forense de Imagen** | Detección de manipulación | ELA, Análisis de Ruido, SLIC, Detección de Clones |
| **Forense de Audio** | Detección de deepfakes | Análisis de espectrograma, detección de síntesis |
| **Verificador de Hechos** | Verificación de afirmaciones | Extracción de evidencia, credibilidad de fuentes |

### 2.3 Matriz de Uso de Proveedores

```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│    Proveedor    │    Texto     │    Imagen    │    Audio     │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ OpenRouter      │      ✓       │      -       │      -       │
│ Google Gemini   │      ✓       │      ✓       │      ✓       │
│ ML Personalizado│      -       │      ✓       │      ✓       │
│ Google Search   │      ✓       │      -       │      -       │
└─────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 3. Capacidades de Análisis

### 3.1 Análisis de Texto

#### Descripción General

| Atributo | Valor |
|----------|-------|
| **Marco** | UNESCO AMI (Alfabetización Mediática e Informacional) |
| **Endpoint** | `/text-analysis-DTO` |
| **Versión** | v2.9.0 |
| **Tipos de Entrada** | URL, Texto Directo |

#### Tareas de IA Realizadas

1. **Clasificación de Contenido**
   - Evalúa contenido contra 20 criterios AMI
   - Asigna puntuaciones de competencia (escala 0-1)
   - Categorías: Acceso a la Información, Evaluación Crítica, Comprensión del Contexto, Producción Responsable

2. **Verificación de Hechos**
   - Extrae afirmaciones verificables del contenido
   - Cruza referencias con fuentes confiables
   - Genera veredictos basados en evidencia

3. **Generación de Resúmenes**
   - Resumen corto (1-2 oraciones)
   - Resumen medio (1 párrafo)
   - Resumen largo (análisis detallado)

4. **Evaluación de Credibilidad**
   - Reputación del dominio fuente
   - Credibilidad del autor
   - Historial de publicación

5. **Análisis de Tono y Sentimiento**
   - Detección de lenguaje emocional
   - Identificación de sesgos
   - Reconocimiento de técnicas de persuasión

#### Estructura de Salida

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

#### Etiquetas de Veredicto

| Veredicto | Descripción | Código de Color |
|-----------|-------------|-----------------|
| `Verificado` | Afirmación verificada como precisa | Verde |
| `Refutado` | Afirmación probada como falsa | Rojo |
| `No Verificable` | Evidencia insuficiente | Amarillo |
| `Engañoso` | Engañoso pero no enteramente falso | Naranja |
| `Sátira` | Contenido satírico | Azul |

---

### 3.2 Análisis de Imagen

#### Descripción General

| Atributo | Valor |
|----------|-------|
| **Marco** | Pirámide Forense Multi-nivel |
| **Endpoint** | `/image-analysis` |
| **Versión** | v3.0.0 |
| **Tipos de Entrada** | Archivos de imagen (JPEG, PNG, WebP, etc.) |

#### Algoritmos Forenses

| Algoritmo | Propósito | Salida |
|-----------|-----------|--------|
| **ELA (Análisis de Nivel de Error)** | Detecta inconsistencias de compresión | Mapa de calor |
| **Análisis de Ruido** | Identifica anomalías en patrones de ruido | Mapa de calor |
| **Segmentación SLIC** | Detecta límites de empalme | Mapa de segmentación |
| **Detección de Fantasmas** | Encuentra artefactos de copiar-pegar | Máscara binaria |
| **Detección de Clones** | Identifica regiones duplicadas | Coordenadas de coincidencia |

#### Niveles de Análisis

```
┌─────────────────────────────────────────────────────────────┐
│                  NIVEL 3: VEREDICTO FINAL                   │
│  - Probabilidad de manipulación (0-100)                     │
│  - Índice de severidad (0-1)                                │
│  - Etiqueta final (Auténtico/Manipulado/etc.)              │
│  - Explicación para el usuario                              │
├─────────────────────────────────────────────────────────────┤
│                   NIVEL 2: INTEGRACIÓN                      │
│  - Puntuación de consistencia                               │
│  - Puntuación de riesgo de metadatos                        │
│  - Clasificación de tipo de manipulación                    │
│  - Notas de síntesis                                        │
├─────────────────────────────────────────────────────────────┤
│              NIVEL 1: ALGORITMOS INDIVIDUALES               │
│  - Resultados ELA + puntuación de significancia             │
│  - Análisis de ruido + puntuación de significancia          │
│  - Resultados SLIC + puntuación de significancia            │
│  - Detección de fantasmas + puntuación de significancia     │
│  - Detección de clones + puntuación de significancia        │
└─────────────────────────────────────────────────────────────┘
```

#### Estructura de Salida

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
  raw_forensics: RawForensicsItem[]  // Mapas de calor, máscaras
  file_info: FileInfo
  chain_of_custody: ChainOfCustodyEvent[]
}
```

#### Etiquetas de Veredicto

| Etiqueta | Puntuación de Riesgo | Descripción |
|----------|----------------------|-------------|
| `Auténtico` | 0-29 | No se detectó manipulación |
| `Baja Sospecha` | 30-49 | Anomalías menores, probablemente auténtico |
| `Alta Sospecha` | 50-79 | Anomalías significativas detectadas |
| `Confirmado Manipulado` | 80-100 | Evidencia clara de manipulación |

---

### 3.3 Análisis de Audio

#### Descripción General

| Atributo | Valor |
|----------|-------|
| **Marco** | Forense + Transcripción + Detección de Síntesis |
| **Endpoint** | `/audio-analysis` |
| **Versión** | v1.1.0 |
| **Tipos de Entrada** | Archivos de audio (MP3, WAV, M4A, etc.) |

#### Tareas de IA Realizadas

1. **Transcripción de Voz a Texto**
   - Detección automática de idioma
   - Transcripción de alta precisión
   - Alineación de marcas de tiempo

2. **Detección de Voz Sintética**
   - Identificación de deepfakes
   - Detección de voz generada por IA
   - Análisis de firma de clonación

3. **Detección de Manipulación**
   - Detección de empalme de audio
   - Identificación de artefactos de edición
   - Análisis de anomalías de compresión

4. **Análisis de Espectrograma**
   - Representación visual de frecuencias de audio
   - Resaltado de anomalías
   - Comparación de patrones

#### Estructura de Salida

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
    report_html: string    // Informe formateado en HTML
    spectrogram: string    // Base64 o URL
  }
  file_info: AudioFileInfo
}
```

#### Tipos de Manipulación

| Tipo | Descripción | Indicadores |
|------|-------------|-------------|
| `Ninguna` | No se detectó manipulación | Espectrograma limpio, patrones consistentes |
| `Clonación` | Clonación de voz detectada | Marcadores sintéticos, prosodia antinatural |
| `Edición` | Edición de audio detectada | Artefactos de empalme, anomalías de compresión |

---

## 4. Arquitectura de API

### 4.1 Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                     (React + Vite + TypeScript)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ContentUpload │  │AnalysisView │  │ VotingPanel  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CAPA DE SERVICIOS                         │   │
│  │  textAnalysisService | imageAnalysisService | audioService   │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  FUNCIONES EDGE DE SUPABASE                         │
│                      (Gateway de API)                               │
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
│                    MICROSERVICIOS BACKEND                           │
│                  (Python + Modelos ML)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  OpenRouter │  │   Gemini    │  │  ML Custom  │                 │
│  │    (LLM)    │  │  (Visión)   │  │  (Forense)  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ALMACENAMIENTO                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │    Supabase     │  │  Cloudflare R2  │  │      Caché      │     │
│  │   PostgreSQL    │  │(Almacenamiento) │  │  (Basado hash)  │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Solicitud

```
1. ACCIÓN DEL USUARIO
   │
   ▼
2. SERVICIO FRONTEND
   │  - Validar entrada
   │  - Generar hash de archivo (si aplica)
   │  - Preparar payload de solicitud
   │
   ▼
3. POST /submit
   │  - Verificar caché (basado en hash)
   │  - Si está en caché: retornar resultado inmediato
   │  - Si es nuevo: crear trabajo asíncrono
   │
   ▼
4. COLA DE TRABAJOS
   │  - ID de trabajo retornado al frontend
   │  - Backend procesa asincrónicamente
   │
   ▼
5. BUCLE DE SONDEO
   │  GET /status/{jobId}
   │  - pending → processing → completed/failed
   │  - Retroceso exponencial en reintentos
   │
   ▼
6. TRANSFORMACIÓN DE RESULTADO
   │  - Normalización DTO StandardizedCase
   │  - Estructuras de datos listas para UI
   │
   ▼
7. RENDERIZADO DE UI
   - Mostrar resultados, veredictos, visualizaciones
```

---

## 5. Funciones Edge de Supabase

### 5.1 Endpoints de Análisis

| Función | Versión | Método | Propósito |
|---------|---------|--------|-----------|
| `/text-analysis-DTO` | v2.9.0 | POST/GET | Análisis de contenido de texto y URL |
| `/image-analysis` | v3.0.0 | POST/GET | Análisis forense de imagen |
| `/audio-analysis` | v1.1.0 | POST/GET | Análisis forense y transcripción de audio |

### 5.2 Endpoints de Búsqueda y Consulta

| Función | Versión | Método | Propósito |
|---------|---------|--------|-----------|
| `/search-dto` | v2.3.0 | POST | Búsqueda unificada entre casos |
| `/search-dto/lookup` | v2.3.0 | POST | Consulta de caso individual |
| `/search-dto/summary` | v2.3.0 | POST | Generación de resumen de caso |

### 5.3 Endpoints de Votación y Consenso

| Función | Versión | Método | Propósito |
|---------|---------|--------|-----------|
| `/vote-auth-async-verbose` | v2.4.0 | POST | Enviar voto de verificación humana |
| `/vote-auth-async-verbose/status` | v2.4.0 | GET | Verificar estado de consenso |

### 5.4 Endpoints de Utilidad

| Función | Versión | Método | Propósito |
|---------|---------|--------|-----------|
| `/web-snapshot` | - | POST | Scraping de URL y captura de pantalla |
| `/inmunizacion` | - | POST | Generación de contra-narrativa |
| `/mapa-desinfodemico-verbose` | v5.1.0 | POST | Panel de mapa de desinformación |
| `/admin-dashboard` | - | POST | Operaciones de administración |
| `/profileCRUD` | v1.2.0 | PUT/GET | Gestión de perfil de usuario |

### 5.5 URL Base

```
https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/
```

---

## 6. Flujo de Solicitud/Respuesta

### 6.1 Flujo de Análisis de Texto

```typescript
// 1. Enviar solicitud
POST /text-analysis-DTO/submit
{
  "url": "https://example.com/articulo",
  // O
  "text": "Contenido a analizar...",
  "use_cache": true,
  "vector_de_transmision": "Web"  // Web|WhatsApp|Telegram|Twitter|Facebook|Email
}

// 2. Respuesta (inmediata si está en caché, o trabajo creado)
{
  "id": "job_abc123",
  "status": "pending",  // o "completed" si está en caché
  "result": null        // o resultado completo si está en caché
}

// 3. Sondear estado
GET /text-analysis-DTO/status/job_abc123

// 4. Respuesta final
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

### 6.2 Flujo de Análisis de Imagen

```typescript
// 1. Inicializar carga por fragmentos
POST /image-analysis/upload_session
{
  "file_name": "imagen.jpg",
  "file_size": 4500000,
  "file_hash": "sha256:abc123...",
  "content_type": "image/jpeg"
}

// 2. Cargar fragmentos (4MB cada uno)
POST /image-analysis/upload_session
{
  "session_id": "session_xyz",
  "chunk_index": 0,
  "chunk_data": "<base64>"
}

// 3. Finalizar carga e iniciar análisis
POST /image-analysis/upload_session?action=finish
{
  "session_id": "session_xyz",
  "use_cache": true
}

// 4. Sondear estado
GET /image-analysis/status/job_abc123

// 5. Respuesta final con resultados forenses
{
  "id": "job_abc123",
  "status": "completed",
  "result": {
    "human_report": { ... },
    "raw_forensics": [ ... ]
  }
}
```

### 6.3 Flujo de Análisis de Audio

```typescript
// 1. Enviar audio (codificado en base64)
POST /audio-analysis/submit
{
  "audio_data": "data:audio/mp3;base64,//uQx...",
  "file_name": "grabacion.mp3",
  "use_cache": true
}

// 2. Sondear estado
GET /audio-analysis/status/job_abc123

// 3. Respuesta final
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

### 6.4 Configuración de Sondeo

| Tipo de Análisis | Intervalo de Sondeo | Intentos Máximos | Tiempo de Espera Total |
|------------------|---------------------|------------------|------------------------|
| Texto | 3 segundos | 60 | 3 minutos |
| Imagen | 2 segundos | 60 | 2 minutos |
| Audio | 3 segundos | 90 | 4.5 minutos |

**Detección de Bloqueo Global:** `HANG_DETECTION_MS = 245000` (4 minutos 5 segundos)

---

## 7. Tipos e Interfaces de TypeScript

### 7.1 DTO Universal StandardizedCase

```typescript
/**
 * Formato de respuesta universal para todos los tipos de análisis
 * Permite renderizado de UI consistente y comparaciones entre tipos
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

  insights: GenericInsight[]  // Polimórfico por categoría

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

### 7.2 Interfaz de Insight Genérico

```typescript
/**
 * Objeto de insight polimórfico - varía por categoría
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
  content: string  // URL o contenido de texto
}
```

### 7.3 Tipos de Análisis de Texto

```typescript
interface AMICriterion {
  nombre: string
  score: number  // 0, 0.5, o 1
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

### 7.4 Tipos de Análisis de Imagen

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

### 7.5 Tipos de Análisis de Audio

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
  start: number  // segundos
  end: number
  text: string
  confidence: number
}
```

### 7.6 Tipos de Estado de Trabajo

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

### 7.7 Tipos de Consenso

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

## 8. Sistema de Manejo de Errores

### 8.1 Arquitectura de Gestión de Errores

```
┌─────────────────────────────────────────────────────────────┐
│                  GESTOR DE ERRORES                          │
│              src/utils/errorManager/                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  ErrorCodes.ts  │  │ ErrorManager.ts │                  │
│  │  (50+ códigos)  │  │ (seguimiento)   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │CircuitBreaker.ts│  │RetryStrategy.ts │                  │
│  │(tolerancia a    │  │(retroceso exp.) │                  │
│  │ fallos)         │  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Códigos de Error Específicos de IA

#### Errores de OpenRouter

| Código | HTTP | Descripción | Recuperación |
|--------|------|-------------|--------------|
| `ERR_CONFIG_MISSING_OPENROUTER_KEY` | 500 | Clave API no configurada | FALLO |
| `ERR_API_OPENROUTER_TIMEOUT` | 504 | Tiempo de espera agotado | REINTENTAR |
| `ERR_API_OPENROUTER_RATE_LIMIT` | 429 | Límite de tasa excedido | CIRCUIT_BREAK |
| `ERR_API_OPENROUTER_AUTH` | 401 | Autenticación fallida | FALLO |
| `ERR_API_OPENROUTER_INVALID_RESPONSE` | 502 | Formato de respuesta inválido | REINTENTAR |
| `ERR_API_OPENROUTER_NO_CONTENT` | 502 | Respuesta vacía | REINTENTAR |

#### Errores de Gemini

| Código | HTTP | Descripción | Recuperación |
|--------|------|-------------|--------------|
| `ERR_CONFIG_MISSING_GEMINI_KEY` | 500 | Clave API no configurada | FALLO |
| `ERR_API_GEMINI_TIMEOUT` | 504 | Tiempo de espera agotado | REINTENTAR |
| `ERR_API_GEMINI_RATE_LIMIT` | 429 | Límite de tasa excedido | CIRCUIT_BREAK |
| `ERR_API_GEMINI_INVALID_EMBEDDING` | 400 | Respuesta de embedding inválida | FALLO |

#### Errores de Browserless/Scraping

| Código | HTTP | Descripción | Recuperación |
|--------|------|-------------|--------------|
| `ERR_API_BROWSERLESS_TIMEOUT` | 504 | Tiempo de scraping agotado | REINTENTAR |
| `ERR_API_BROWSERLESS_FETCH_FAILED` | 502 | Fallo al obtener URL | FALLO |
| `ERR_API_BROWSERLESS_INVALID_URL` | 400 | URL proporcionada inválida | FALLO |

#### Errores Generales

| Código | HTTP | Descripción | Recuperación |
|--------|------|-------------|--------------|
| `ERR_PARSING_LLM_RESPONSE` | 500 | Fallo al parsear respuesta de IA | REINTENTAR |
| `ERR_PARSING_AI_CONFIG` | 500 | Configuración de IA inválida | FALLO |
| `ERR_TIMEOUT_JOB` | 504 | Trabajo excedió límite de tiempo | FALLO |
| `ERR_TIMEOUT_OPERATION` | 504 | Operación agotó tiempo de espera | REINTENTAR |

### 8.3 Configuración del Circuit Breaker

| Servicio | Umbral de Fallos | Ventana de Tiempo | Período de Enfriamiento |
|----------|------------------|-------------------|-------------------------|
| OpenRouter | 5 fallos | 1 minuto | 30 segundos |
| Gemini | 3 fallos | 1 minuto | 60 segundos |
| Browserless | 2 fallos | 1 minuto | 120 segundos |

### 8.4 Estrategia de Reintento

```typescript
// Configuración de retroceso exponencial
const retryConfig = {
  maxAttempts: 60,
  baseDelay: 2000,      // 2 segundos
  maxDelay: 30000,      // 30 segundos
  multiplier: 1.5,
  jitter: true          // Jitter aleatorio para prevenir efecto manada
}
```

---

## 9. Sistema de Consenso Humano-IA

### 9.1 Descripción General

El sistema de consenso permite la validación comunitaria de los resultados de análisis de IA, combinando inteligencia de máquina con juicio humano.

### 9.2 Estados de Consenso

| Estado | Descripción | Indicador de UI |
|--------|-------------|-----------------|
| `ai_only` | Solo veredicto de IA disponible, sin votos humanos | Insignia gris |
| `human_consensus` | Humanos coinciden con veredicto de IA | Insignia verde |
| `conflicted` | Votos humanos discrepan con IA | Insignia naranja |

### 9.3 Opciones de Voto

| Opción | Español | Descripción |
|--------|---------|-------------|
| Verified | Verificado | El contenido es preciso |
| False | Falso | El contenido es falso/fabricado |
| Misleading | Engañoso | El contenido es engañoso pero no enteramente falso |
| Unverifiable | No Verificable | No se puede verificar con la evidencia disponible |
| Satire | Sátira | El contenido es satírico/parodia |

### 9.4 Flujo de API

```typescript
// Enviar voto
POST /vote-auth-async-verbose/submit
{
  "case_id": "case_abc123",
  "classification": "Falso",
  "comment": "La fuente ha sido desmentida por Reuters"
}

// Verificar estado de consenso
GET /vote-auth-async-verbose/status/case_abc123

// Respuesta
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

### 9.5 Gamificación

| Acción | Recompensa XP |
|--------|---------------|
| Completar perfil | +50 XP |
| Primer voto | +10 XP |
| Racha de votos (7 días) | +25 XP |
| Predicción correcta (coincide con consenso) | +15 XP |

---

## 10. Estrategia de Caché

### 10.1 Deduplicación Basada en Hash

```typescript
// Generación de hash de archivo
async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
```

### 10.2 Comportamiento de Caché

| Escenario | Estado HTTP | Respuesta |
|-----------|-------------|-----------|
| Acierto de caché | 200 | Resultado inmediato |
| Fallo de caché | 202 | ID de trabajo, iniciar sondeo |
| Caché deshabilitado | 202 | Siempre nuevo análisis |

### 10.3 Parámetros de Caché

```typescript
// Todos los endpoints de envío aceptan parámetro use_cache
interface SubmitRequest {
  // ... otros campos
  use_cache?: boolean  // Por defecto: true
}
```

### 10.4 Invalidación de Caché

- Las entradas de caché son direccionadas por contenido (basadas en hash)
- Sin TTL explícito (el contenido es inmutable)
- Invalidación manual disponible vía API de administración

---

## 11. Configuración y Variables de Entorno

### 11.1 Variables de Frontend (prefijo VITE_)

```bash
# Conexión Supabase
VITE_SUPABASE_URL=https://mdkswlgcqsmgfmcuorxq.supabase.co
VITE_SUPABASE_ANON_KEY=<token JWT anónimo>

# Servicios Externos
VITE_SCREENSHOT_API_KEY=be76ee
```

### 11.2 Variables de Backend (Solo lado servidor)

```bash
# Supabase Admin
SUPABASE_SERVICE_ROLE_KEY=<clave JWT de rol de servicio>
SUPABASE_DB_PASSWORD=<contraseña de base de datos>

# Claves de Proveedores de IA
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...
NEBIUS_API_KEY=<token JWT>

# Configuración
HANG_DETECTION_MS=245000
API_LOG_LEVEL=DEBUG
```

### 11.3 Notas de Seguridad

- Todas las claves API se almacenan solo del lado del servidor
- El frontend usa clave anónima de Supabase (pública, con límite de tasa)
- Los tokens JWT incluyen contexto de usuario para autorización
- Las funciones Edge validan tokens antes de procesar

---

## 12. Características Adicionales de IA

### 12.1 Inmunización

**Propósito:** Generar contra-narrativas contra desinformación identificada

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

**Salida:** Contenido educativo generado por IA para contrarrestar afirmaciones específicas de desinformación

### 12.2 Mapa Desinfodémico

**Propósito:** Seguimiento geográfico y temporal de la propagación de desinformación

**Dimensiones:**
- **Alcance:** Propagación geográfica de la desinformación
- **Magnitud:** Volumen de compartidos/interacciones
- **Impacto:** Evaluación de daño potencial

**Versión de API:** v5.1.0

### 12.3 Servicio de Captura Web

**Propósito:** Capturar y archivar contenido web para análisis

**Características:**
- Capturas de pantalla de página completa vía ScreenshotMachine API
- Extracción de contenido HTML
- Parseo y limpieza de texto
- Extracción de metadatos

### 12.4 Panel de Administración

**Capacidades:**
- Gestión de casos
- Moderación de usuarios
- Analíticas y reportes
- Monitoreo de salud del sistema

---

## 13. Referencia de Archivos Fuente

### 13.1 Capa de Servicios

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `src/services/api.ts` | 11KB | Orquestador central de API |
| `src/services/textAnalysisService.ts` | 2.8KB | Coordinación de análisis de texto |
| `src/services/imageAnalysisService.ts` | 10.3KB | Carga de imagen y sondeo |
| `src/services/audioAnalysisService.ts` | 9KB | Envío y procesamiento de audio |
| `src/services/analysisPresentationService.ts` | 39.5KB | Transformación de datos para UI |
| `src/services/contentAnalysisService.ts` | - | Orquestador unificado de análisis |
| `src/services/votingService.ts` | - | Votación de consenso |
| `src/services/vectorAsyncService.ts` | - | Operaciones de búsqueda/consulta |

### 13.2 Hooks

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useAnalysisPolling.ts` | Lógica unificada de sondeo |
| `src/hooks/useTextAnalysisData.ts` | Extracción de datos específica de texto |
| `src/hooks/useImageAnalysis.ts` | Extracción de datos específica de imagen |
| `src/hooks/useAudioAnalysisLogic.ts` | Extracción de datos específica de audio |
| `src/hooks/useContentAnalysis.ts` | Seguimiento de envío de contenido |

### 13.3 Componentes

| Archivo | Propósito |
|---------|-----------|
| `src/components/ContentUpload.tsx` | Interfaz de carga de archivo/URL |
| `src/components/TextAIAnalysis.tsx` | Visualización de análisis de texto |
| `src/components/image-analysis/ImageAnalysisResultView.tsx` | Visualización de forense de imagen |
| `src/components/audio-analysis/AudioAnalysisResultView.tsx` | Visualización de análisis de audio |
| `src/components/UnifiedAnalysisView.tsx` | Visualización universal de resultados |

### 13.4 Tipos

| Archivo | Propósito |
|---------|-----------|
| `src/types/textAnalysis.ts` | Interfaces de análisis de texto |
| `src/types/imageAnalysis.ts` | Interfaces de forense de imagen |
| `src/types/audioAnalysis.ts` | Interfaces de análisis de audio |
| `src/types/botilito.ts` | Tipos de dominio generales |
| `src/types/vector-api.ts` | Tipos de búsqueda/consulta |

### 13.5 Utilidades

| Archivo | Propósito |
|---------|-----------|
| `src/utils/aiAnalysis.ts` | Punto de entrada de análisis de IA |
| `src/utils/errorManager/ErrorCodes.ts` | Definiciones de errores |
| `src/utils/errorManager/CircuitBreaker.ts` | Tolerancia a fallos |
| `src/utils/errorManager/RetryStrategy.ts` | Lógica de reintento |
| `src/lib/analysisPipeline.ts` | Captura web + análisis |
| `src/lib/apiEndpoints.ts` | Definiciones de endpoints |
| `src/lib/apiService.ts` | Cliente HTTP |

---

## 14. Especificaciones OpenAPI

### 14.1 Especificaciones Disponibles

| Archivo | Versión | Descripción |
|---------|---------|-------------|
| `text-analysis-dto.json` | v2.9.0 | Contrato de API de análisis de texto |
| `text-analysis-py.json` | v1.3.0 | API de backend Python |
| `image-analysis-api-dto.json` | v3.0.0 | Contrato de API de análisis de imagen |
| `audio-analysis-api.json` | v1.1.0 | Contrato de API de análisis de audio |
| `audio-analysis-dto.json` | - | Esquema DTO de audio |
| `DTO.json` | - | Esquema DTO genérico |
| `openapi_mapa_desinfodemico.json` | v5.1.0 | API de mapa de desinformación |

### 14.2 Acceso a las Especificaciones

Todas las especificaciones OpenAPI están ubicadas en el directorio raíz del repositorio y pueden usarse con herramientas como Swagger UI, Postman o generadores de código.

---

## Resumen

Botilito implementa una **plataforma forense de IA de grado de producción** que incluye:

| Categoría | Implementación |
|-----------|----------------|
| **Proveedores de IA** | OpenRouter, Google Gemini, Google Search, Nebius, ML Personalizado |
| **Tipos de Análisis** | Texto (Marco AMI), Imagen (Pirámide Forense), Audio (Detección de Deepfake) |
| **Arquitectura** | Cola de trabajos asíncronos con sondeo, caché basado en hash |
| **Verificación** | Sistema de votación de consenso Humano-IA |
| **Resiliencia** | Circuit breaker, retroceso exponencial, seguimiento de errores |
| **Estándares** | Marco AMI de UNESCO, DTO StandardizedCase |

La plataforma está diseñada para:
- **Precisión Forense:** Detectar medios manipulados a nivel de píxel/forma de onda
- **Cumplimiento UNESCO:** Evaluación de alfabetización mediática según marco AMI
- **Confianza Comunitaria:** Verificación humana de predicciones de IA
- **Escalabilidad:** Procesamiento asíncrono con caché inteligente

---

*Documento generado del análisis del código base de Botilito*
