# Text Analysis Result Layout (Unified View)

## Overview
This document defines the layout for **TEXT** type results within the unified analysis result page. Text analysis focuses on **Alfabetización Mediática e Informacional (AMI)** - Media and Information Literacy analysis for detecting misinformation, clickbait, and evaluating source credibility.

---

## Full Page Layout

```
+==============================================================================+
|  [Logo] Beta   Análisis IA | Validación Humana | Historial | Mapa | Perfil   |
+==============================================================================+
|  +------------------------------------------------------------------------+  |
|  |  [Botilito Icon]  "¡Qué más parce! Este es el análisis AMI..."(yellow) |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  <- Volver al listado                                                        |
|                                                                              |
+==============================================================================+
|                                                                              |
|  +---------------------------------------------+   +----------------------+  |
|  |                                             |   |                      |  |
|  |         MEDIA PREVIEW CARD                  |   |  INFORMACIÓN DEL     |  |
|  |         (SCREENSHOT)                        |   |  CASO                |  |
|  |                                             |   |                      |  |
|  |  +---------------------------------------+  |   |  Caso: T-OT-xxx      |  |
|  |  | [Captura Original]                    |  |   |  Tipo: TEXT          |  |
|  |  |                                       |  |   |  Reportado: user     |  |
|  |  |        WEBPAGE SCREENSHOT             |  |   |  Fecha: 15/1/2024    |  |
|  |  |                                       |  |   |                      |  |
|  |  +---------------------------------------+  |   +----------------------+  |
|  |                                             |                             |
|  +---------------------------------------------+   +----------------------+  |
|                                                    |  ESTADÍSTICAS DEL    |  |
|  +---------------------------------------------+   |  ANÁLISIS            |  |
|  |  CONTENT INFO CARD                          |   |                      |  |
|  |                                             |   |  Pruebas: 1          |  |
|  |  [FileText] Titular                         |   |  Tiempo: 12.0s       |  |
|  |  ─────────────────────────────────────────  |   |  Precisión: 88%      |  |
|  |  "El titular del artículo analizado..."     |   +----------------------+  |
|  |                                             |                             |
|  |  [FileText] Contenido Analizado             |   +----------------------+  |
|  |  "Resumen del contenido principal..."       |   |  CADENA DE           |  |
|  |                                             |   |  CUSTODIA            |  |
|  |  ─────────────────────────────────────────  |   |                      |  |
|  |  [Fuente: xxx] [Tipo: xxx] [Tema: xxx]      |   |  * Caso creado       |  |
|  +---------------------------------------------+   |  * Análisis IA       |  |
|                                                    |  * Diagnóstico       |  |
|  +---------------------------------------------+   +----------------------+  |
|  |  TWO DIAGNOSIS CARDS (side by side)         |                             |
|  |                                             |   +----------------------+  |
|  |  +-------------------+ +-------------------+|   |  RECOMENDACIONES     |  |
|  |  | DIAGNÓSTICO       | | ANÁLISIS          ||   |  (yellow bg)         |  |
|  |  | INFODÉMICO        | | HUMANO            ||   |                      |  |
|  |  |                   | |                   ||   |  * Verificar fuentes |  |
|  |  | [!] Análisis IA   | | [O] Análisis      ||   |  * Contrastar info   |  |
|  |  | [REQUIERE AMI]    | |     Humano        ||   |  * Revisar contexto  |  |
|  |  |                   | | [REQUIERE AMI]    ||   +----------------------+  |
|  |  |    88%            | |    75%            ||                             |
|  |  |  Nivel de         | |  Consenso         ||                             |
|  |  |  Riesgo           | |  humano           ||                             |
|  |  |                   | |                   ||                             |
|  |  | Description...    | | Description...    ||                             |
|  |  +-------------------+ +-------------------+|                             |
|  +---------------------------------------------+                             |
|                                                                              |
|  +---------------------------------------------+                             |
|  |  AMI ANALYSIS SECTION                       |                             |
|  |  (Alfabetización Mediática e Informacional) |                             |
|  |                                             |                             |
|  |  +---------------------------------------+  |                             |
|  |  | 1. RESUMEN DEL CONTENIDO (gray bg)    |  |                             |
|  |  |    Qué: ...                           |  |                             |
|  |  |    Quién: ...                         |  |                             |
|  |  |    Cuándo: ...                        |  |                             |
|  |  |    Dónde: ...                         |  |                             |
|  |  +---------------------------------------+  |                             |
|  |                                             |                             |
|  |  +---------------------------------------+  |                             |
|  |  | 2. ANÁLISIS DE FUENTES (blue/orange)  |  |                             |
|  |  |    Source reliability analysis...     |  |                             |
|  |  +---------------------------------------+  |                             |
|  |                                             |                             |
|  |  +---------------------------------------+  |                             |
|  |  | 3. TITULAR VS CONTENIDO (red/green)   |  |                             |
|  |  |    Clickbait detection analysis...    |  |                             |
|  |  +---------------------------------------+  |                             |
|  |                                             |                             |
|  |  +---------------------------------------+  |                             |
|  |  | 4. COMPETENCIAS AMI (green bg)        |  |                             |
|  |  |    1. Acceso a la información         |  |                             |
|  |  |    2. Evaluación crítica              |  |                             |
|  |  |    3. Comprensión del contexto        |  |                             |
|  |  |    4. Producción responsable          |  |                             |
|  |  +---------------------------------------+  |                             |
|  +---------------------------------------------+                             |
|                                                                              |
|  +---------------------------------------------+                             |
|  |  HUMAN VALIDATION FORM                      |                             |
|  |                                             |                             |
|  |  +---------------------------------------+  |                             |
|  |  | Comment textarea          0/500 chars |  |                             |
|  |  +---------------------------------------+  |                             |
|  |                                             |                             |
|  |  [Enviar Validación]  [Limpiar]             |                             |
|  +---------------------------------------------+                             |
|                                                                              |
|       LEFT COLUMN (~70%)                           RIGHT COLUMN (~30%)       |
+==============================================================================+
```

---

## Section Details

### 1. Media Preview Card (TEXT = Screenshot)

```
+--------------------------------------------------+
|  [Captura Original]  <- overlay badge top-left   |
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |         WEBPAGE SCREENSHOT                 |  |
|  |         (from source URL)                  |  |
|  |                                            |  |
|  |     Shows the original article/post        |  |
|  |     as captured from the web               |  |
|  |                                            |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

**Notes:**
- Badge: "📷 Captura Original"
- Shows screenshot of the analyzed webpage/article
- If no screenshot: placeholder with "Imagen no disponible"
- `object-cover` with `h-[200px]`

---

### 2. Content Info Card

```
+--------------------------------------------------+
|  [FileText] Titular                              |
|  ───────────────────────────────────────────     |
|  "El titular del artículo o publicación          |
|   que fue analizado"                             |
|                                                  |
|  [FileText] Contenido Analizado                  |
|  "Resumen del contenido principal del artículo   |
|   o publicación analizada..."                    |
|                                                  |
|  ───────────────────────────────────────────     |
|  [🔥 Fuente: Web]  [Tipo: Hecho]  [🏷 Tema: Pol] |
+--------------------------------------------------+
```

**Tags:**
| Tag | Color | Example Values |
|-----|-------|----------------|
| Fuente | `bg-red-50 border-red-200 text-red-700` | Web, WhatsApp, Facebook |
| Tipo | `bg-blue-50 border-blue-200 text-blue-700` | Hecho, Opinión, Sátira |
| Tema | `bg-gray-50 border-gray-200 text-gray-700` | Política, Salud, Economía |

---

### 3. Diagnosis Cards (Side by Side)

```
+------------------------+  +------------------------+
|  /!\  Diagnóstico      |  |  (O)  Análisis         |
|       Infodémico       |  |       Humano           |
|                        |  |                        |
|  Análisis IA           |  |  Análisis Humano       |
|  [REQUIERE AMI]        |  |  [REQUIERE AMI]        |
|                        |  |                        |
|         88%            |  |         75%            |
|    Nivel de            |  |    Consenso            |
|    Riesgo              |  |    humano              |
|                        |  |                        |
|  "El contenido         |  |  "Los especialistas    |
|   presenta altos       |  |   en AMI confirman..." |
|   riesgos..."          |  |                        |
+------------------------+  +------------------------+
```

**Verdict Labels for TEXT:**
| Verdict | Badge Color | Description |
|---------|-------------|-------------|
| Requiere un enfoque AMI | `bg-rose-500 text-white` | High risk content |
| Desarrolla las premisas AMI | `bg-emerald-500 text-white` | Low risk content |
| Pendiente | `bg-gray-300 text-gray-600` | No consensus yet |

**Color Logic:**
- `isWarning = score > 50 || verdict.includes('Requiere')`
- Warning: `border-rose-200 bg-rose-50 text-rose-600`
- Safe: `border-emerald-200 bg-emerald-50 text-emerald-600`

---

### 4. AMI Analysis Section

This is the **TEXT-SPECIFIC** main analysis section with 4 sub-cards.

#### 4a. Resumen del Contenido (Gray)

```
+--------------------------------------------------+
|  📋 Resumen del Contenido                        |
|                                                  |
|  Qué:    Summary of what the content is about    |
|                                                  |
|  Quién:  Source/author of the content            |
|                                                  |
|  Cuándo: Date when content was published         |
|                                                  |
|  Dónde:  Platform/region where it circulates     |
+--------------------------------------------------+
```

**Styling:**
- Background: `bg-gray-50`
- Border: `border-gray-200`
- Label width: `min-w-[60px]`

#### 4b. Análisis de Fuentes y Datos (Blue/Orange)

```
+--------------------------------------------------+
|  [Shield] Análisis de Fuentes y Datos            |
|                                                  |
|  "El contenido proviene de fuentes que requieren |
|   verificación adicional. Se recomienda          |
|   contrastar con medios verificados..."          |
+--------------------------------------------------+
```

**Color Logic:**
| Source Status | Background | Border | Icon Color |
|---------------|------------|--------|------------|
| Reliable | `bg-blue-50` | `border-blue-200` | `text-blue-600` |
| Unreliable | `bg-orange-50` | `border-orange-200` | `text-orange-600` |

#### 4c. Alerta: Titular vs Contenido (Red/Green)

```
+--------------------------------------------------+
|  [AlertTriangle] Alerta: Titular vs. Contenido   |
|                                                  |
|  ⚠️ Posible Clickbait Detectado                  |
|                                                  |
|  "El titular presenta características de         |
|   clickbait o sensacionalismo que no             |
|   corresponden con el contenido real."           |
+--------------------------------------------------+
```

**Color Logic:**
| Clickbait Status | Background | Border |
|------------------|------------|--------|
| Is Clickbait | `bg-red-50` | `border-red-200` |
| Not Clickbait | `bg-green-50` | `border-green-200` |

#### 4d. Competencias AMI Recomendadas (Green)

```
+--------------------------------------------------+
|  [CheckCircle] Competencias AMI Recomendadas:    |
|                                                  |
|  [1] Acceso a la información:                    |
|      Identificar fuentes confiables...           |
|                                                  |
|  [2] Evaluación crítica:                         |
|      Analizar credibilidad de fuentes...         |
|                                                  |
|  [3] Comprensión del contexto:                   |
|      Entender contexto histórico/social...       |
|                                                  |
|  [4] Producción responsable:                     |
|      Compartir información verificada...         |
+--------------------------------------------------+
```

**Styling:**
- Background: `bg-green-50` / `bg-emerald-50`
- Border: `border-green-200` / `border-emerald-100`
- Number badges: `bg-emerald-200 text-emerald-800`

---

### 5. Sidebar Cards

#### 5a. Información del Caso

```
+--------------------------------+
|  (O) Información del Caso      |
|                                |
|  Caso          T-OT-20241015   |
|  Tipo          [icon] TEXT     |
|  Reportado por usuario_456     |
|  Fecha         15/1/2024       |
+--------------------------------+
```

#### 5b. Estadísticas del Análisis

```
+--------------------------------+
|  [spark] Estadísticas del      |
|          Análisis              |
|                                |
|  Pruebas realizadas        1   |
|  Tiempo total            12.0s |
|  Nivel de precisión       88%  |
+--------------------------------+
```

**Note:** TEXT typically has 1 test (AI analysis) vs IMAGE which has 6+ forensic tests.

#### 5c. Cadena de Custodia

```
+--------------------------------+
|  (O) Cadena de Custodia        |
|                                |
|  * Caso creado                 |
|    15 de enero de 2024         |
|    Sistema Botilito            |
|                                |
|  * Análisis IA ejecutado       |
|    15 de enero de 2024         |
|    1 prueba completada         |
|                                |
|  * Diagnóstico generado        |
|    Requiere enfoque AMI        |
+--------------------------------+
```

#### 5d. Recomendaciones

```
+--------------------------------+
|  [lightbulb] Recomendaciones   |  <- yellow background
|                                |
|  * Verificar información en    |
|    fuentes oficiales           |
|                                |
|  * Contrastar con otros medios |
|    de comunicación             |
|                                |
|  * Revisar el contexto antes   |
|    de compartir                |
+--------------------------------+
```

---

### 6. Human Validation Form

```
+--------------------------------------------------+
|  +--------------------------------------------+  |
|  |                                            |  |
|  |  Añade un comentario que explique tu       |  |
|  |  validación...                             |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                    0/500 chars   |
|                                                  |
|  [Enviar Validación]   [Limpiar]                 |
|   (yellow primary)      (outline)                |
|                                                  |
|  /!\ Debes seleccionar un diagnóstico antes      |
|      de enviar                                   |
+--------------------------------------------------+
```

---

## Content Type Comparison

| Section | TEXT | IMAGE | VIDEO | AUDIO |
|---------|------|-------|-------|-------|
| Media Preview | Screenshot | Image | Video Player | Waveform |
| Content Info Card | Yes (Titular + Contenido) | No | No | No |
| Diagnóstico Card | "Infodémico" | "Forense" | "Forense" | "Forense" |
| AMI Analysis Section | **Yes (4 sub-cards)** | No | No | No |
| Pruebas Tab | No | Yes | Yes | Yes |
| Evidencias Tab | No | Heatmaps | Keyframes | Spectrograms |
| Información del Caso | Yes | Yes | Yes | Yes |
| Metadatos del Archivo | No (basic) | +EXIF | +Duration | +Duration |
| Estadísticas | Yes | Yes | Yes | Yes |
| Cadena de Custodia | Yes | Yes | Yes | Yes |
| Recomendaciones | Yes | Yes | Yes | Yes |
| Human Validation | Yes | Yes | Yes | Yes |

---

## TEXT-Specific Analysis Categories

| Category | Description | Color When Issue |
|----------|-------------|------------------|
| Fuentes y Datos | Source reliability analysis | Orange |
| Titular vs Contenido | Clickbait/sensationalism detection | Red |
| Competencias AMI | Media literacy recommendations | Green (always) |

---

## AMI Competencies (4 Core Areas)

| # | Competency | Description |
|---|------------|-------------|
| 1 | Acceso a la información | Identifying and accessing reliable sources |
| 2 | Evaluación crítica | Analyzing credibility of sources and content |
| 3 | Comprensión del contexto | Understanding historical, social, political context |
| 4 | Producción responsable | Sharing verified info, avoiding misinformation spread |

---

## CSS Grid Structure

```css
/* Main container */
.result-page {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

/* Main grid - TEXT uses 7fr/3fr split */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;  /* mobile */
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 7fr 3fr;  /* desktop: ~70% / ~30% */
    gap: 1.5rem;
  }
}

/* Left column */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Diagnosis cards row */
.diagnosis-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Sidebar - sticky on desktop */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 2rem;
}
```

---

## Component Mapping

| Section | Component File |
|---------|----------------|
| Main View | `UnifiedAnalysisView.tsx` |
| Text Analysis Content | `TextAIAnalysis.tsx` |
| Screenshot Preview | Built into `UnifiedAnalysisView.tsx` |
| Content Info Card | Built into `UnifiedAnalysisView.tsx` |
| Diagnosis Cards | Built into `UnifiedAnalysisView.tsx` |
| AMI Analysis Section | Built into `UnifiedAnalysisView.tsx` |
| Case Info | `AnalysisSidebarCaseInfo.tsx` |
| Analysis Stats | `AnalysisSidebarStats.tsx` |
| Chain of Custody | `AnalysisSidebarChainOfCustody.tsx` |
| Recommendations | `AnalysisSidebarRecommendations.tsx` |
| Human Validation | `CaseDiagnosisForm.tsx` |

---

## Data Flow (TEXT)

```typescript
// Key data sources for TEXT analysis
interface TextAnalysisData {
  // From StandardizedCase
  overview: {
    title: string;           // Titular
    summary: string;         // Contenido
    risk_score: number;      // 0-100
    verdict_label: string;   // "Requiere un enfoque AMI"
    source_domain: string;   // Website domain
    main_asset_url: string;  // Screenshot URL
  };

  // Insights array contains analysis results
  insights: [
    { id: 'tech_sources', label: 'Análisis de Fuentes', ... },
    { id: 'tech_clickbait', label: 'Titular vs Contenido', ... },
    { id: 'meta_context_type', value: 'Hecho|Opinión|Sátira' },
    { id: 'ami_acceso', ... },
    { id: 'ami_evaluacion', ... },
    { id: 'ami_comprension', ... },
    { id: 'ami_produccion', ... }
  ];

  // Community consensus
  community: {
    votes: number;
    status: string;
  };
}
```

---

## Key Differences from IMAGE Layout

| Aspect | TEXT | IMAGE |
|--------|------|-------|
| Primary Analysis | AMI (Media Literacy) | Forensic (Manipulation) |
| Main Metric | "Nivel de Riesgo" | "Precisión diagnóstica" |
| Verdict Card Title | "Diagnóstico Infodémico" | "Diagnóstico Forense" |
| Has Tabs | No | Yes (Pruebas/Evidencias) |
| Has Content Info Card | Yes (Titular + Summary) | No |
| Has AMI Section | Yes (4 sub-cards) | No |
| Screenshot Source | main_asset_url | original_frame from tests |
| Number of Tests | 1 (AI analysis) | 6+ (forensic algorithms) |
