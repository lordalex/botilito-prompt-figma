# Image Analysis Result Layout (Unified View)

## Overview
This document defines the layout for **IMAGE** type results within the unified analysis result page. Image analysis focuses on **Forensic Analysis** - detecting digital manipulation, AI-generated content, cloning, splicing, and metadata inconsistencies.

---

## Full Page Layout

```
+==============================================================================+
|  [Logo] Beta   Análisis IA | Validación Humana | Historial | Mapa | Perfil   |
+==============================================================================+
|  +------------------------------------------------------------------------+  |
|  |  [Botilito Icon]  "Revisa este caso y dame tu opinión..."    (yellow)  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
|  <- Volver al listado                                                        |
|                                                                              |
+==============================================================================+
|                                                                              |
|  +---------------------------------------------+   +----------------------+  |
|  |                                             |   |                      |  |
|  |         MEDIA PREVIEW CARD                  |   |  INFORMACIÓN DEL     |  |
|  |         (ORIGINAL IMAGE)                    |   |  CASO                |  |
|  |                                             |   |                      |  |
|  |  +---------------------------------------+  |   |  Caso: I-FB-xxx      |  |
|  |  | [Imagen Original]                     |  |   |  Tipo: IMAGE         |  |
|  |  |                                       |  |   |  Reportado: user     |  |
|  |  |        ANALYZED IMAGE                 |  |   |  Fecha: 15/1/2024    |  |
|  |  |        (with nav arrows if multiple)  |  |   |                      |  |
|  |  +---------------------------------------+  |   +----------------------+  |
|  |                                             |                             |
|  +---------------------------------------------+   +----------------------+  |
|                                                    |  METADATOS DEL       |  |
|  +---------------------------------------------+   |  ARCHIVO             |  |
|  |  TWO DIAGNOSIS CARDS (side by side)         |   |                      |  |
|  |                                             |   |  Tipo: IMAGEN        |  |
|  |  +-------------------+ +-------------------+|   |  Tamaño: 2.8 MB      |  |
|  |  | DIAGNÓSTICO       | | ANÁLISIS          ||   |  Res: 1920x1080      |  |
|  |  | FORENSE           | | HUMANO            ||   |                      |  |
|  |  |                   | |                   ||   |  EXIF:               |  |
|  |  | [!] Análisis IA   | | [O] Análisis      ||   |  - Cámara: N/A       |  |
|  |  | [MANIPULADO]      | |     Humano        ||   |  - Software: (red)   |  |
|  |  |                   | | [MANIPULADO]      ||   |  - Fecha: (red)      |  |
|  |  |    84%            | |    92%            ||   |  - GPS: N/A          |  |
|  |  |  Precisión        | |  Consenso         ||   +----------------------+  |
|  |  |  diagnóstica      | |  humano           ||                             |
|  |  |                   | |                   ||   +----------------------+  |
|  |  | Description...    | | Description...    ||   |  ESTADÍSTICAS DEL    |  |
|  |  +-------------------+ +-------------------+|   |  ANÁLISIS            |  |
|  +---------------------------------------------+   |                      |  |
|                                                    |  Pruebas: 6          |  |
|  +---------------------------------------------+   |  Tiempo: 105.8s      |  |
|  |  TABS                                       |   |  Precisión: 84%      |  |
|  |  [Pruebas (6)]  [Evidencias]                |   +----------------------+  |
|  |---------------------------------------------|                             |
|  |                                             |   +----------------------+  |
|  |  TAB CONTENT AREA                           |   |  CADENA DE           |  |
|  |                                             |   |  CUSTODIA            |  |
|  |  PRUEBAS TAB:                               |   |                      |  |
|  |  +---------------------------------------+  |   |  * Caso creado       |  |
|  |  | Test Name               [MANIPULADO]  |  |   |    15/01/2024        |  |
|  |  | Description text...                   |  |   |                      |  |
|  |  | Precisión   [========] 89%            |  |   |  * Análisis forense  |  |
|  |  | Tiempo                          0.8s  |  |   |    6 pruebas         |  |
|  |  +---------------------------------------+  |   |                      |  |
|  |  +---------------------------------------+  |   |  * Diagnóstico       |  |
|  |  | Test Name               [MODIFICADO]  |  |   |    Manipulado        |  |
|  |  | ...                                   |  |   +----------------------+  |
|  |  +---------------------------------------+  |                             |
|  |  (... 6 test cards total ...)               |   +----------------------+  |
|  |                                             |   |  RECOMENDACIONES     |  |
|  |  EVIDENCIAS TAB:                            |   |  (yellow bg)         |  |
|  |  +---------------------------------------+  |   |                      |  |
|  |  | Heatmap carousel with nav arrows      |  |   |  * Verificar origen  |  |
|  |  | [<]  HEATMAP IMAGE  [>]               |  |   |  * Buscar versiones  |  |
|  |  |      1 / 5                            |  |   |  * No usar sin       |  |
|  |  +---------------------------------------+  |   |    verificación      |  |
|  +---------------------------------------------+   +----------------------+  |
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
|       LEFT COLUMN (~65%)                           RIGHT COLUMN (~35%)       |
+==============================================================================+
```

---

## Section Details

### 1. Media Preview Card (IMAGE = Original Photo)

```
+--------------------------------------------------+
|  [Imagen Original]  <- overlay badge top-left    |
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |         ANALYZED IMAGE                     |  |
|  |         (original photo/screenshot)        |  |
|  |                                            |  |
|  |     Shows the image being analyzed         |  |
|  |     for manipulation detection             |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  (If multiple images from analysis:)             |
|                                                  |
|       [<]     1 / 3     [>]                      |
|       (navigation arrows)                        |
+--------------------------------------------------+
```

**Notes:**
- Badge: "📷 Imagen Original" with black/70 background
- Shows the analyzed image
- If multiple images from forensic results: navigation arrows + counter
- Background: `bg-[#0a0e1a]` (dark)
- Image: `object-cover h-[200px]`

---

### 2. Diagnosis Cards (Side by Side)

```
+---------------------------+  +---------------------------+
|  /!\  Diagnóstico         |  |  (O)  Análisis            |
|       Forense             |  |       Humano              |
|                           |  |                           |
|  Análisis IA              |  |  Análisis Humano          |
|  [MANIPULADO DIGITALMENTE]|  |  [MANIPULADO DIGITALMENTE]|
|                           |  |                           |
|           84%             |  |           92%             |
|      Precisión            |  |      Consenso             |
|      diagnóstica          |  |      humano               |
|                           |  |                           |
|  "Imagen editada con      |  |  "Los especialistas       |
|   herramientas de         |  |   forenses confirman      |
|   manipulación digital    |  |   que el contenido        |
|   (clonación, montaje)."  |  |   presenta evidencia      |
|                           |  |   clara de manipulación." |
+---------------------------+  +---------------------------+
```

**Verdict Labels for IMAGE:**
| Verdict | Badge Color | Description |
|---------|-------------|-------------|
| Manipulado Digitalmente | `bg-red-500 text-white` | Confirmed manipulation |
| Generado por IA | `bg-red-600 text-white` | AI-generated content |
| Auténtico | `bg-green-500 text-white` | No manipulation detected |
| Requiere Revisión | `bg-yellow-500 text-black` | Uncertain results |

**Color Logic:**
- `isWarning = confidence > 50 || verdict.includes('Manipulado')`
- Warning: `border-rose-200 bg-rose-50 text-rose-600`
- Safe: `border-emerald-200 bg-emerald-50 text-emerald-600`

**Metric Labels:**
| Card | Metric Name | Description |
|------|-------------|-------------|
| Diagnóstico Forense | "Precisión diagnóstica" | AI confidence in manipulation detection |
| Análisis Humano | "Consenso humano" | Community expert agreement percentage |

---

### 3. Tabs Section (IMAGE SPECIFIC)

```
+--------------------------------------------------+
|  [Pruebas (6)]        [Evidencias]               |
|  ^^^^^^^^^^^^                                    |
|  (active tab with underline)                     |
+--------------------------------------------------+
```

**Tab Options for IMAGE:**
| Tab | Content | When Active |
|-----|---------|-------------|
| Pruebas (N) | Forensic test result cards | Yellow underline |
| Evidencias | Heatmap/visualization carousel | Yellow underline |

---

### 4. Pruebas Tab Content (Test Results)

```
+--------------------------------------------------------------+
|  Análisis de Nivel de Error (ELA)                [MANIPULADO]|
|  Detecta áreas con diferentes niveles de                     |
|  compresión que indican manipulación                         |
|                                                              |
|  Precisión diagnóstica                                       |
|  [██████████████████████████████░░░░░]  89%                  |
|                                                              |
|  Tiempo de ejecución                                   0.8s  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Análisis de Metadatos EXIF                      [MODIFICADO]|
|  Analiza metadatos EXIF del archivo para                     |
|  detectar inconsistencias                                    |
|                                                              |
|  Precisión diagnóstica                                       |
|  [████████████████████████████████░░░]  92%                  |
|                                                              |
|  Tiempo de ejecución                                   0.3s  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Análisis de Patrón de Ruido                     [MANIPULADO]|
|  Examina patrones de ruido para detectar                     |
|  regiones editadas o generadas                               |
|                                                              |
|  Precisión diagnóstica                                       |
|  [█████████████████████████████░░░░░░]  87%                  |
|                                                              |
|  Tiempo de ejecución                                   1.2s  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Detección de Artefactos de IA                      [LIMPIO] |
|  Busca artefactos característicos de                         |
|  generación por IA                                           |
|                                                              |
|  Precisión diagnóstica                                       |
|  [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  18%                  |
|                                                              |
|  Tiempo de ejecución                                   2.1s  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Detección de Copiar-Mover (Clonación)           [MANIPULADO]|
|  Algoritmos SIFT/ORB para detectar regiones                  |
|  duplicadas mediante stamp cloning                           |
|                                                              |
|  Precisión diagnóstica                                       |
|  [█████████████████████████████████░░]  91%                  |
|                                                              |
|  Tiempo de ejecución                                   5.1s  |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|  Detección de Empalmes                           [MANIPULADO]|
|  Detecta empalmes de múltiples imágenes                      |
|  mediante análisis de bordes e iluminación                   |
|                                                              |
|  Precisión diagnóstica                                       |
|  [██████████████████████░░░░░░░░░░░░░]  67%                  |
|                                                              |
|  Tiempo de ejecución                                   4.9s  |
+--------------------------------------------------------------+
```

**Test Card Structure:**
```
+--------------------------------------------------------------+
|  [Test Name]                                     [BADGE]     |
|  [Description - what the test detects]                       |
|                                                              |
|  Precisión diagnóstica                                       |
|  [Progress Bar]                                   XX%        |
|                                                              |
|  Tiempo de ejecución                              X.Xs       |
+--------------------------------------------------------------+
```

**Badge Colors:**
| Result | Badge | Progress Bar Color |
|--------|-------|-------------------|
| MANIPULADO | `bg-red-500 text-white` | `bg-orange-500` |
| MODIFICADO | `bg-orange-500 text-white` | `bg-orange-500` |
| LIMPIO | `bg-green-500 text-white` | `bg-green-500` |

---

### 5. Evidencias Tab Content (Visualizations)

```
+--------------------------------------------------------------+
|  Evidencia Visual                                    1 / 5   |
|                                                              |
|  +----------------------------------------------------------+|
|  | [Header: bg-muted/50]                                    ||
|  | Mapa de Calor Global                          [ALERTA]   ||
|  | Fusión de todos los algoritmos forenses                  ||
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |   [<]                                            [>]     ||
|  |                                                          ||
|  |                    HEATMAP IMAGE                         ||
|  |                    (shows manipulation areas)            ||
|  |                    (black background)                    ||
|  |                                                          ||
|  +----------------------------------------------------------+|
|                                                              |
|                     [●] [○] [○] [○] [○]                      |
|                     (pagination dots)                        |
+--------------------------------------------------------------+
```

**Visualization Types:**
| # | Name | Description |
|---|------|-------------|
| 1 | Mapa de Calor Global | Combined heatmap from all algorithms |
| 2 | ELA Heatmap | Error Level Analysis visualization |
| 3 | Noise Analysis | Noise pattern visualization |
| 4 | Clone Detection | Cloned region highlighting |
| 5 | Original Image | Reference original |

---

### 6. Sidebar Cards

#### 6a. Información del Caso

```
+--------------------------------+
|  (O) Información del Caso      |
|                                |
|  Caso          I-FB-20241015   |
|  Tipo          [icon] IMAGE    |
|  Reportado por usuario_456     |
|  Fecha         15/1/2024       |
+--------------------------------+
```

**Case ID Format:** `I-{SOURCE}-{DATE}-{SEQ}`
- I = Image
- SOURCE = FB (Facebook), TW (Twitter), WA (WhatsApp), etc.

#### 6b. Metadatos del Archivo (IMAGE SPECIFIC)

```
+--------------------------------+
|  [box] Metadatos del Archivo   |
|                                |
|  Tipo de archivo      IMAGEN   |
|  Tamaño               2.8 MB   |
|  Resolución        1920x1080   |
|                                |
|  Metadatos EXIF                |
|  ─────────────────────────     |
|  Cámara/Dispositivo            |
|              No disponible     |
|                                |
|  Software                      |
|              Edición detectada |  <- RED text (warning)
|                                |
|  Fecha de creación             |
|              Inconsistente     |  <- RED text (warning)
|                                |
|  GPS                           |
|              No disponible     |
+--------------------------------+
```

**EXIF Warning Indicators:**
| Field | Warning Value | Style |
|-------|---------------|-------|
| Software | "Edición detectada", "Photoshop", "GIMP" | `text-red-500` |
| Fecha | "Inconsistente", "Modificada" | `text-red-500` |
| Normal values | Any other | `text-gray-700` |

#### 6c. Estadísticas del Análisis

```
+--------------------------------+
|  [spark] Estadísticas del      |
|          Análisis              |
|                                |
|  Pruebas realizadas        6   |
|  Tiempo total          105.8s  |
|  Nivel de precisión       84%  |
+--------------------------------+
```

**Note:** IMAGE typically has 6 forensic tests vs TEXT which has 1.

#### 6d. Cadena de Custodia

```
+--------------------------------+
|  (O) Cadena de Custodia        |
|                                |
|  * Caso creado                 |
|    15 de enero de 2024         |
|    04:15:00 a.m.               |
|    Sistema Botilito            |
|                                |
|  * Análisis forense ejecutado  |
|    15 de enero de 2024         |
|    04:15:00 a.m.               |
|    6 pruebas completadas       |
|                                |
|  * Diagnóstico generado        |
|    15 de enero de 2024         |
|    Manipulado Digitalmente     |
+--------------------------------+
```

#### 6e. Recomendaciones

```
+--------------------------------+
|  [lightbulb] Recomendaciones   |  <- yellow background
|                                |
|  * Verificar origen del        |
|    archivo con el emisor       |
|                                |
|  * Buscar versiones            |
|    alternativas del contenido  |
|                                |
|  * No utilizar como evidencia  |
|    sin verificación adicional  |
+--------------------------------+
```

**Styling:**
- Background: `bg-[#FFFCE8]`
- Border: `border-yellow-200`

---

### 7. Human Validation Form

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
| Media Preview | Screenshot | **Image** | Video Player | Waveform |
| Content Info Card | Yes | No | No | No |
| Diagnóstico Card Title | "Infodémico" | **"Forense"** | "Forense" | "Forense" |
| AMI Analysis Section | Yes (4 cards) | No | No | No |
| **Tabs Section** | No | **Yes** | Yes | Yes |
| **Pruebas Tab** | No | **6 tests** | Video tests | Audio tests |
| **Evidencias Tab** | No | **Heatmaps** | Keyframes | Spectrograms |
| Información del Caso | Yes | Yes | Yes | Yes |
| **Metadatos del Archivo** | Basic | **+EXIF** | +Duration | +Duration |
| Estadísticas | Yes | Yes | Yes | Yes |
| Cadena de Custodia | Yes | Yes | Yes | Yes |
| Recomendaciones | Yes | Yes | Yes | Yes |
| Human Validation | Yes | Yes | Yes | Yes |

---

## IMAGE-Specific Forensic Tests (6 Core Tests)

| # | Test Name | Algorithm | Detects |
|---|-----------|-----------|---------|
| 1 | Análisis de Nivel de Error (ELA) | Error Level Analysis | Compression inconsistencies from editing |
| 2 | Análisis de Metadatos EXIF | EXIF Parser | Metadata tampering, software signatures |
| 3 | Análisis de Patrón de Ruido | Noise Analysis | AI-generated regions, edited areas |
| 4 | Detección de Artefactos de IA | GAN Detection | AI/Deepfake generated content |
| 5 | Detección de Copiar-Mover | SIFT/ORB | Clone stamping, duplicated regions |
| 6 | Detección de Empalmes | Edge/Illumination | Spliced/composite images |

---

## EXIF Metadata Fields

| Field | Description | Warning Indicators |
|-------|-------------|-------------------|
| Cámara/Dispositivo | Camera or device used | N/A |
| Software | Editing software detected | Photoshop, GIMP, etc. |
| Fecha de creación | Original creation date | Inconsistent, Modified |
| GPS | Geolocation data | N/A |

---

## CSS Grid Structure

```css
/* Main container */
.result-page {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

/* Main grid - IMAGE uses 2fr/1fr split (~65%/35%) */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;  /* mobile */
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: 2fr 1fr;  /* desktop */
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
  gap: 1rem;
}

/* Tab content area */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
| Image Preview | Built into `UnifiedAnalysisView.tsx` |
| Diagnosis Cards | Built into `UnifiedAnalysisView.tsx` |
| Tabs Container | `@/components/ui/tabs` |
| Test Results | `TestResults.tsx` or `ImageAIAnalysis.tsx` |
| Visualizations | `VisualizationsTab.tsx` |
| Case Info | `AnalysisSidebarCaseInfo.tsx` |
| File Metadata | `AnalysisSidebarMetadata.tsx` |
| Analysis Stats | `AnalysisSidebarStats.tsx` |
| Chain of Custody | `AnalysisSidebarChainOfCustody.tsx` |
| Recommendations | `AnalysisSidebarRecommendations.tsx` |
| Human Validation | `CaseDiagnosisForm.tsx` |

---

## Data Flow (IMAGE)

```typescript
// Key data sources for IMAGE analysis
interface ImageAnalysisData {
  // From StandardizedCase
  overview: {
    title: string;              // Filename or description
    summary: string;            // Forensic summary
    risk_score: number;         // 0-100 (manipulation probability)
    verdict_label: string;      // "Manipulado Digitalmente"
    main_asset_url: string;     // Original image URL
  };

  // Forensic test results
  insights: [
    { id: 'forensic_ela', label: 'ELA', confidence: 0.89, ... },
    { id: 'forensic_exif', label: 'EXIF', confidence: 0.92, ... },
    { id: 'forensic_noise', label: 'Noise', confidence: 0.87, ... },
    { id: 'forensic_ai', label: 'AI Detection', confidence: 0.18, ... },
    { id: 'forensic_clone', label: 'Clone', confidence: 0.91, ... },
    { id: 'forensic_splice', label: 'Splice', confidence: 0.67, ... }
  ];

  // Raw forensic data with heatmaps
  raw: {
    all_documents: [
      {
        result: {
          details: [
            { original_frame: string, heatmap: string, ... }
          ]
        }
      }
    ]
  };

  // File metadata
  file_info: {
    name: string;
    size_bytes: number;
    mime_type: string;
    dimensions: { width: number; height: number };
    exif_data: {
      camera: string;
      software: string;
      date_created: string;
      gps: string;
    };
  };

  // Community consensus
  community: {
    votes: number;
    status: string;
  };
}
```

---

## Key Differences from TEXT Layout

| Aspect | IMAGE | TEXT |
|--------|-------|------|
| Primary Analysis | **Forensic (Manipulation)** | AMI (Media Literacy) |
| Main Metric | **"Precisión diagnóstica"** | "Nivel de Riesgo" |
| Verdict Card Title | **"Diagnóstico Forense"** | "Diagnóstico Infodémico" |
| **Has Tabs** | **Yes (Pruebas/Evidencias)** | No |
| Has Content Info Card | No | Yes (Titular + Summary) |
| Has AMI Section | No | Yes (4 sub-cards) |
| **Has EXIF Metadata** | **Yes** | No |
| **Number of Tests** | **6 (forensic algorithms)** | 1 (AI analysis) |
| **Has Heatmaps** | **Yes (Evidencias tab)** | No |
| Processing Time | **~100s** | ~12s |

---

## Verdict Flow Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    IMAGE ANALYSIS FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Run 6 Forensic Tests                                    │
│     ├── ELA Analysis                                        │
│     ├── EXIF Analysis                                       │
│     ├── Noise Pattern Analysis                              │
│     ├── AI Artifact Detection                               │
│     ├── Clone Detection (SIFT/ORB)                          │
│     └── Splice Detection                                    │
│                                                             │
│  2. Calculate Overall Score                                 │
│     └── Weighted average of test confidences                │
│                                                             │
│  3. Determine Verdict                                       │
│     ├── Score < 30%  → "Auténtico" (green)                  │
│     ├── Score 30-70% → "Requiere Revisión" (yellow)         │
│     ├── Score > 70%  → "Manipulado Digitalmente" (red)      │
│     └── AI detected  → "Generado por IA" (red)              │
│                                                             │
│  4. Generate Visualizations                                 │
│     └── Heatmaps showing manipulation areas                 │
│                                                             │
│  5. Await Human Validation                                  │
│     └── Expert review and consensus                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Badge Reference

| Badge | When Used | Tailwind Classes |
|-------|-----------|------------------|
| MANIPULADO | Test detects manipulation | `bg-red-500 text-white` |
| MODIFICADO | Metadata shows editing | `bg-orange-500 text-white` |
| LIMPIO | No issues detected | `bg-green-500 text-white` |
| ALERTA | Visualization shows issues | `bg-yellow-500 text-black` |
| Manipulado Digitalmente | Final verdict: manipulated | `bg-red-500 text-white` |
| Generado por IA | Final verdict: AI-generated | `bg-red-600 text-white` |
| Auténtico | Final verdict: authentic | `bg-green-500 text-white` |
| Requiere Revisión | Final verdict: uncertain | `bg-yellow-500 text-black` |
