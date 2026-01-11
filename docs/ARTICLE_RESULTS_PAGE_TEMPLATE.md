# Article Results Page Template

> **Purpose**: Reference guide for the Article/URL Analysis Results Page layout, data requirements, and component specifications.

---

## Table of Contents

1. [Page Layout Overview](#page-layout-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Required Data Fields (API Contract)](#required-data-fields-api-contract)
4. [Color States Reference](#color-states-reference)
5. [Responsive Breakpoints](#responsive-breakpoints)
6. [Loading & Error States](#loading--error-states)
7. [Conditional Sections](#conditional-sections)
8. [Interactive Elements](#interactive-elements)
9. [Empty State Handling](#empty-state-handling)
10. [File Locations](#file-locations)

---

## Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BOTILITO BANNER (Yellow: #ffe97a)                                          │
│  ┌─────────┐  "¡Qué más parce! Este es el análisis AMI completo 📰🎓"       │
│  │ Mascot  │   Contenido analizado desde la perspectiva de AMI...           │
│  └─────────┘                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

← Volver al listado (Back Button)

┌─────────────────────────────────────────┬───────────────────────────────────┐
│           LEFT COLUMN (7fr)             │      RIGHT SIDEBAR (3fr)          │
│                                         │                                   │
│  ┌──────────────────────────────────────┐│  ┌─────────────────────────────┐  │
│  │ SCREENSHOT/IMAGE (Dark Card)         ││  │ CASE INFO                   │  │
│  │                                      ││  │ • Caso: #ID                 │  │
│  │  📷 Captura Original                 ││  │ • Tipo: TEXTO               │  │
│  │                                      ││  │ • Vector: Web               │  │
│  │  [Image or Placeholder]              ││  │ • Reportado: Name           │  │
│  │                                      ││  │ • Fecha: Date               │  │
│  └──────────────────────────────────────┘│  └─────────────────────────────┘  │
│                                         │                                   │
│  ┌──────────────────────────────────────┐│  ┌─────────────────────────────┐  │
│  │ CONTENT INFO CARD                    ││  │ STATISTICS                  │  │
│  │                                      ││  │ • Pruebas realizadas: 1     │  │
│  │ 📄 Titular                           ││  │ • Tiempo total: 12.0s       │  │
│  │ "Title of the article..."            ││  │ • Precisión diagnóstica: X% │  │
│  │ ────────────────────────             ││  └─────────────────────────────┘  │
│  │ 📄 Contenido Analizado               ││                                   │
│  │ "Summary text..."                    ││  ┌─────────────────────────────┐  │
│  │                                      ││  │ CHAIN OF CUSTODY            │  │
│  │ [Fuente: X] [Tipo: TEXTO] [Tema: Y]  ││  │ ● Caso creado - fecha      │  │
│  └──────────────────────────────────────┘│  │ ● Análisis ejecutado       │  │
│                                         │  └─────────────────────────────┘  │
│                                         │                                   │
│                                         │  ┌─────────────────────────────┐  │
│                                         │  │ RECOMMENDATIONS (Yellow)    │  │
│                                         │  │ • Bullet point 1            │  │
│                                         │  │ • Bullet point 2            │  │
│                                         │  │ • Bullet point 3            │  │
│                                         │  └─────────────────────────────┘  │
│                                         │                                   │
│  ┌─────────────────┐ ┌─────────────────┐│                                   │
│  │ DIAGNÓSTICO     │ │ ANÁLISIS        ││                                   │
│  │ INFODÉMICO      │ │ HUMANO          ││                                   │
│  │                 │ │                 ││                                   │
│  │ ⚠️ AlertTriangle│ │ 👥 Users        ││                                   │
│  │                 │ │                 ││                                   │
│  │ 88%             │ │ --%             ││                                   │
│  │ Nivel de Riesgo │ │ Consenso        ││                                   │
│  │                 │ │                 ││                                   │
│  │ [Análisis IA]   │ │ [Análisis       ││                                   │
│  │ [Verdict Badge] │ │  Humano]        ││                                   │
│  │                 │ │ [Pendiente]     ││                                   │
│  │ Description...  │ │ Description...  ││                                   │
│  └─────────────────┘ └─────────────────┘│                                   │
│                                         │                                   │
│  ┌──────────────────────────────────────┐│                                   │
│  │ ⚡ ANÁLISIS AMI                       ││                                   │
│  │                                      ││                                   │
│  │ ┌────────────────────────────────┐   ││                                   │
│  │ │ 📋 Resumen del Contenido       │   ││                                   │
│  │ │ Qué: summary text              │   ││                                   │
│  │ │ Quién: source                  │   ││                                   │
│  │ │ Cuándo: date                   │   ││                                   │
│  │ │ Dónde: platform                │   ││                                   │
│  │ └────────────────────────────────┘   ││                                   │
│  │                                      ││                                   │
│  │ ┌────────────────────────────────┐   ││                                   │
│  │ │ 🛡️ Análisis de Fuentes         │   ││                                   │
│  │ │ (Blue if reliable/Orange if not)│  ││                                   │
│  │ │ Source reliability analysis... │   ││                                   │
│  │ └────────────────────────────────┘   ││                                   │
│  │                                      ││                                   │
│  │ ┌────────────────────────────────┐   ││                                   │
│  │ │ ⚠️ Alerta: Titular vs Contenido │   │                                   │
│  │ │ (Red if clickbait/Green if ok) │   ││                                   │
│  │ │ Clickbait detection text...    │   ││                                   │
│  │ └────────────────────────────────┘   ││                                   │
│  │                                      ││                                   │
│  │ ┌────────────────────────────────┐   ││                                   │
│  │ │ ✅ Competencias AMI Recomendadas│   │                                   │
│  │ │ (Green background)             │   ││                                   │
│  │ │ 1. Acceso a la información     │   ││                                   │
│  │ │ 2. Evaluación crítica          │   ││                                   │
│  │ │ 3. Comprensión del contexto    │   ││                                   │
│  │ │ 4. Producción responsable      │   ││                                   │
│  │ └────────────────────────────────┘   ││                                   │
│  └──────────────────────────────────────┘│                                   │
└─────────────────────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  HUMAN VALIDATION FORM (Full Width - if hideVoting=false)                   │
│  CaseDiagnosisForm component                                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                  BOTILITO INTELLIGENCE ECOSYSTEM • 2026                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
CaseDetailView (Entry Point)
├── useCaseDetail hook (fetches data)
├── transformHumanCaseToUI() (transforms data)
└── UnifiedAnalysisView (Main Layout)
    ├── Botilito Banner
    ├── Back Button
    ├── Main Grid (7fr / 3fr)
    │   ├── LEFT COLUMN
    │   │   ├── Screenshot Card (dark bg, full width)
    │   │   ├── Content Info Card
    │   │   │   ├── Titular section
    │   │   │   ├── Contenido Analizado section
    │   │   │   └── Tags (Fuente, Tipo, Tema)
    │   │   ├── Diagnosis Cards (2-col grid)
    │   │   │   ├── Diagnóstico Infodémico (AI)
    │   │   │   └── Análisis Humano (Consensus)
    │   │   └── AMI Analysis Card
    │   │       ├── Resumen del Contenido (gray bg)
    │   │       ├── Análisis de Fuentes (blue/orange bg)
    │   │       ├── Alerta: Titular vs Contenido (red/green bg)
    │   │       └── Competencias AMI (green bg)
    │   └── RIGHT SIDEBAR (sticky)
    │       ├── AnalysisSidebarCaseInfo
    │       ├── AnalysisSidebarStats
    │       ├── AnalysisSidebarChainOfCustody
    │       └── AnalysisSidebarRecommendations
    ├── CaseDiagnosisForm (conditional)
    └── Footer
```

---

## Required Data Fields (API Contract)

### StandardizedCase Structure

```typescript
interface StandardizedCase {
  id: string;                    // Required: Case UUID
  display_id?: string;           // Optional: Human-readable ID (e.g., "BOT-ABC123")
  created_at: string;            // Required: ISO timestamp
  type: 'TEXT' | 'URL';          // Required: Content type

  overview: {
    title: string;               // Required: Article headline
    summary: string;             // Required: Content summary
    verdict_label: string;       // Required: e.g., "Requiere un enfoque AMI"
    risk_score: number;          // Required: 0-100
    main_asset_url?: string;     // Optional: Screenshot URL
    source_domain?: string;      // Optional: e.g., "example.com"
  };

  insights: Insight[];           // Required: Array of analysis insights

  reporter?: {
    name?: string;               // Optional: Reporter name
  };

  community?: {
    votes?: number;              // Optional: Vote count
    status?: string;             // Optional: Consensus status
  };

  metadata?: {
    vector?: string;             // Optional: "Web", "WhatsApp", etc.
    theme?: string;              // Optional: Topic/theme
    is_forensic?: boolean;       // Optional: Forensic analysis flag
  };
}
```

### Insight Structure

```typescript
interface Insight {
  id: string;                    // Required: Unique identifier
  label: string;                 // Required: Display label
  description: string;           // Required: Detailed description
  category: 'metadata' | 'content_quality' | 'forensics' | 'competency';
  score?: number;                // Optional: 0-100
  value?: any;                   // Optional: Additional data
  raw_data?: {                   // Optional: Raw analysis data
    analisis?: string;
  };
}
```

### Key Insight IDs

| Insight ID | Purpose | Section | Value Examples |
|------------|---------|---------|----------------|
| `meta_context_type` | Content classification type | CONTENT INFO CARD → "Tipo" badge | `"Hecho"`, `"Opinión"` |
| `tech_sources` | Source reliability analysis | Análisis de Fuentes | - |
| `tech_clickbait` | Clickbait detection | Alerta: Titular vs Contenido | - |
| `ami_*` | AMI competency recommendations | Competencias AMI | - |

### `meta_context_type` Insight Structure

**IMPORTANT**: This insight is used for the "Tipo" badge in the CONTENT INFO CARD (TEXT content only).

```json
{
  "id": "meta_context_type",
  "label": "Clasificación de Contexto",
  "score": null,
  "value": "Hecho",              // <-- Used for "Tipo" badge
  "category": "metadata",
  "raw_data": {
    "clasificacion": {
      "tipo": "Hecho",
      "razon": "..."
    },
    "conclusion": "...",
    "invitacion": "..."
  }
}
```

**Lookup Method**:
```typescript
const metaContextTypeInsight = insights.find(i => i.id === 'meta_context_type');
const tipo = metaContextTypeInsight?.value || fallback;
```

**Note**: The insight position in the `insights[]` array varies. Always use `.find()` by `id`, never by array index.

### Fallback Values

| Field | Fallback Value |
|-------|----------------|
| `overview.title` | `'Contenido Analizado'` |
| `overview.summary` | `'Sin resumen disponible'` |
| `overview.verdict_label` | `'Requiere un enfoque AMI'` |
| `overview.risk_score` | `0` |
| `overview.source_domain` | `'Fuente desconocida'` |
| `reporter.name` | `'Anónimo'` or `'Comunidad'` |
| `community.votes` | `0` |
| `community.status` | `'Pendiente'` |
| `metadata.vector` | `'Web'` |

---

## Color States Reference

### Risk Level Colors (Diagnosis Cards)

| Risk Score | State | Border | Background | Text | Badge BG |
|------------|-------|--------|------------|------|----------|
| 0-50 (Low Risk) | Success | `border-emerald-200` | `bg-emerald-50` | `text-emerald-600` | `bg-emerald-500 text-white` |
| 51-100 (High Risk) | Warning | `border-rose-200` | `bg-rose-50` | `text-rose-600` | `bg-rose-500 text-white` |

### Summary Card Risk Colors (from CLAUDE.md)

| Risk Level | Score Range | Border | Background | Text | Progress | Circle Stroke |
|------------|-------------|--------|------------|------|----------|---------------|
| Safe | < 30 | `border-green-500` | `bg-green-50` | `text-green-600` | `bg-green-500` | `#22c55e` |
| Medium | 30-70 | `border-yellow-500` | `bg-yellow-50` | `text-yellow-600` | `bg-yellow-500` | `#eab308` |
| High | 70-90 | `border-orange-500` | `bg-orange-50` | `text-orange-600` | `bg-orange-500` | `#f97316` |
| Critical | >= 90 | `border-red-500` | `bg-red-50` | `text-red-600` | `bg-red-500` | `#ef4444` |

### Source Analysis Colors

| State | Condition | Background | Border | Icon Color |
|-------|-----------|------------|--------|------------|
| Reliable | `value === 'Fuentes Sólidas'` or contains `'Confiable'` | `bg-blue-50` | `border-blue-200` | `text-blue-600` |
| Unreliable | Otherwise | `bg-orange-50` | `border-orange-200` | `text-orange-600` |

### Clickbait Alert Colors

| State | Condition | Background | Border | Icon Color |
|-------|-----------|------------|--------|------------|
| Clickbait Detected | `es_clickbait === true` or value contains clickbait indicators | `bg-red-50` | `border-red-200` | `text-red-600` |
| No Clickbait | Otherwise | `bg-green-50` | `border-green-200` | `text-green-600` |

### AMI Competencies Section

| Section | Background | Border | Icon Color |
|---------|------------|--------|------------|
| Competencias AMI | `bg-green-50` | `border-green-200` | `text-green-600` |

### Content Summary Section

| Section | Background | Border |
|---------|------------|--------|
| Resumen del Contenido | `bg-gray-50` | `border-gray-200` |

### Botilito Banner

| Element | Color | Tailwind |
|---------|-------|----------|
| Background | `#ffe97a` | `bg-[#ffe97a]` |
| Border | `#ffda00` | `border-[#ffda00]` |
| Text | Black | `text-black` |

### Recommendations Card

| Element | Color | Tailwind |
|---------|-------|----------|
| Background | `#FFFCE8` | `bg-[#FFFCE8]` |
| Border | Yellow 200 | `border-yellow-200` |
| Bullets | Yellow 400 | `text-yellow-400` |

### Content Tags

| Tag | Background | Border | Text |
|-----|------------|--------|------|
| Fuente | `bg-red-50` | `border-red-200` | `text-red-700` |
| Tipo | `bg-blue-50` | `border-blue-200` | `text-blue-700` |
| Tema | `bg-gray-50` | `border-gray-200` | `text-gray-700` |

---

## Responsive Breakpoints

### Grid Layout

```css
/* Desktop (lg: 1024px+) */
.main-grid {
  grid-template-columns: 7fr 3fr;
}

/* Tablet/Mobile (< 1024px) */
.main-grid {
  grid-template-columns: 1fr; /* Single column, sidebar below content */
}
```

### Screenshot Card

```css
/* All breakpoints */
.screenshot-card {
  width: 100%; /* Full width of left column */
}
```

### Diagnosis Cards

```css
/* Tablet+ (md: 768px+) */
.diagnosis-cards {
  grid-template-columns: 1fr 1fr; /* Side by side */
}

/* Mobile (< 768px) */
.diagnosis-cards {
  grid-template-columns: 1fr; /* Stacks vertically */
}
```

### Sidebar Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (lg+) | Sticky, fixed to right column |
| Tablet/Mobile | Flows below main content, not sticky |

**Sidebar Order (top to bottom):**
1. Case Info
2. Statistics
3. Chain of Custody
4. Recommendations

### Element Visibility

| Element | Desktop | Mobile |
|---------|---------|--------|
| Botilito Banner | Full width, horizontal | Full width, may wrap text |
| Back Button | Left aligned | Left aligned |
| Screenshot | 200px height | 200px height |
| Diagnosis % | 42px font | 42px font (may need adjustment) |

---

## Loading & Error States

### Loading State

**Displayed when**: `isLoading === true` in `UnifiedAnalysisView` or `loading === true` in `CaseDetailView`

```
┌─────────────────────────────────────────┐
│                                         │
│     🤖 (Bot icon, pulsing animation)    │
│                                         │
│     Análisis IA en progreso...          │
│     Botilito está procesando...         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Estado del Análisis               │  │
│  │                                   │  │
│  │ Etapa: [step name]          [X%] │  │
│  │ ████████░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │                                   │  │
│  │ "Preparando motores..."           │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:
- `Loader2` icon with `animate-spin` class
- `Progress` bar component
- Status text from `progress.status`

### Error State

**Displayed when**: `error !== null` or `caseDetail === null` in `CaseDetailView`

```
┌─────────────────────────────────────────┐
│                                         │
│         ⚠️ (AlertTriangle icon)          │
│         text-destructive (red)          │
│                                         │
│     [Error message or "Caso no          │
│      encontrado."]                      │
│                                         │
│     ┌─────────────────────────┐         │
│     │ ← Volver a la lista     │         │
│     └─────────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:
- `AlertTriangle` icon (12x12, centered)
- Error message text
- `Button` with `variant="outline"` and `ArrowLeft` icon

---

## Conditional Sections

### Human Validation Form

| Prop | Value | Behavior |
|------|-------|----------|
| `hideVoting` | `true` | Form is hidden (AI mode from Historial) |
| `hideVoting` | `false` | Form is shown (Human validation mode) |
| `mode` | `'ai'` | Sets `hideVoting: true` by default |
| `mode` | `'human'` | Shows validation form |

### Screenshot Display

| Condition | Display |
|-----------|---------|
| `visualUrl` exists | Shows image with "📷 Captura Original" badge |
| `visualUrl` is null | Shows placeholder: gray bg, image icon, "Imagen no disponible" |

```
Placeholder Structure:
┌────────────────────────────────────┐
│  📷 Captura (badge, top-left)      │
│                                    │
│         🖼️ (ImageIcon, gray)        │
│                                    │
│     Imagen no disponible           │
│     No se proporcionó captura...   │
└────────────────────────────────────┘
```

### Audio Content Display

| Condition | Display |
|-----------|---------|
| `contentType === 'audio'` && `visualUrl` exists | Audio player with Volume2 icon |
| `contentType === 'audio'` && `visualUrl` is null | Placeholder with "Audio no disponible" |

### Consensus Display

| Condition | Display |
|-----------|---------|
| `humanConsensus.hasVotes === true` | Shows `X%` with colored text |
| `humanConsensus.hasVotes === false` | Shows `--%` with gray text, "Pendiente" badge |

### Multi-Image Navigation

| Condition | Display |
|-----------|---------|
| `availableImages.length > 1` | Shows prev/next arrows and "X / Y" counter |
| `availableImages.length <= 1` | No navigation arrows |

---

## Interactive Elements

### Back Button

```tsx
<Button variant="ghost" onClick={onReset}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Volver al listado
</Button>
```

| Prop | Value |
|------|-------|
| `variant` | `"ghost"` |
| `onClick` | `onReset` (navigates back to list) |
| Hover | `hover:text-black` |

### Image Navigation (Multi-Image)

```tsx
<button onClick={handlePrevImage}>
  <ChevronLeft />
</button>
<div>X / Y</div>
<button onClick={handleNextImage}>
  <ChevronRight />
</button>
```

| Element | Style |
|---------|-------|
| Buttons | `bg-black/80 hover:bg-black/95 rounded-full h-12 w-12` |
| Counter | `bg-black/80 text-white px-4 py-2 rounded-full` |

### Screenshot Image

| Property | Value |
|----------|-------|
| Height | `h-[200px]` |
| Fit | `object-cover` |
| Hover | N/A (static display) |

### Human Validation Form

Handled by `CaseDiagnosisForm` component:
- Vote buttons
- Diagnosis selection
- Submit button with loading state (`isSubmittingDiagnosis`)

---

## Empty State Handling

### No Screenshot Provided

```tsx
<div className="bg-gray-800 h-[250px] flex flex-col items-center justify-center">
  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
    <ImageIcon className="h-10 w-10 text-gray-500" />
  </div>
  <p className="text-gray-400">Imagen no disponible</p>
  <p className="text-gray-500 text-sm">No se proporcionó captura de pantalla</p>
</div>
```

### No Recommendations

```tsx
// In AnalysisSidebarRecommendations
{recommendations.length === 0 ? (
  <p className="text-sm text-gray-500 italic">
    No hay recomendaciones disponibles para este análisis.
  </p>
) : (
  // Render bullet list
)}
```

### No AMI Competencies

```tsx
{amiCompetencies.length > 0 ? (
  amiCompetencies.map((insight, idx) => (
    // Render competency
  ))
) : (
  <p className="text-[13px] text-gray-500 italic">
    No se generaron recomendaciones específicas.
  </p>
)}
```

### No Human Votes

| Field | Display |
|-------|---------|
| Percentage | `--%` (gray color) |
| Badge | "Pendiente" (gray bg) |
| Description | "Aún no hay suficientes votos de la comunidad para establecer consenso." |

### Missing Source Insight

```tsx
// Fallback when tech_sources insight not found
{sourceInsight.description || sourceInsight.raw_data?.analisis ||
  'El contenido proviene de fuentes que requieren verificación adicional. Se recomienda contrastar con medios verificados y fuentes oficiales.'}
```

### Missing Clickbait Insight

```tsx
// Fallback when tech_clickbait insight not found
{clickbaitInsight.description || clickbaitInsight.raw_data?.analisis ||
  (isClickbait
    ? '⚠️ El titular presenta características de clickbait o sensacionalismo...'
    : '✓ El titular es coherente con el contenido presentado.')}
```

---

## File Locations

| Component/File | Path |
|----------------|------|
| Entry Point (Case Detail) | `src/components/CaseDetailView.tsx` |
| Main Layout | `src/components/UnifiedAnalysisView.tsx` |
| Case Info Sidebar | `src/components/analysis-shared/AnalysisSidebarCaseInfo.tsx` |
| Statistics Sidebar | `src/components/analysis-shared/AnalysisSidebarStats.tsx` |
| Chain of Custody | `src/components/analysis-shared/AnalysisSidebarChainOfCustody.tsx` |
| Recommendations | `src/components/analysis-shared/AnalysisSidebarRecommendations.tsx` |
| Votes Sidebar | `src/components/analysis-shared/AnalysisSidebarVotes.tsx` |
| Verdict Cards | `src/components/analysis-shared/AnalysisVerdictCards.tsx` |
| Diagnosis Form | `src/components/CaseDiagnosisForm.tsx` |
| Data Transformation | `src/services/analysisPresentationService.ts` |
| Case Detail Hook | `src/hooks/useCaseDetail.ts` |
| Sidebar Data Hook | `src/hooks/useAnalysisSidebarData.ts` |
| Design Tokens | `src/styles/design-tokens.ts` |

---

## Data Flow Summary

```
User clicks case in Historial
        ↓
CaseDetailView receives caseId
        ↓
useCaseDetail(caseId) fetches from API
        ↓
transformHumanCaseToUI(caseDetail) normalizes data
        ↓
UnifiedAnalysisView renders with:
  - data (transformed)
  - contentType ('text' for articles)
  - mode ('ai' or 'human')
  - caseNumber, timestamp, reportedBy, screenshot
        ↓
useAnalysisSidebarData extracts sidebar props
        ↓
Page renders with all sections
```

---

## Quick Reference: Key Tailwind Classes

### Container
- Max width: `max-w-7xl`
- Padding: `p-4 md:p-6 lg:pt-5`
- Spacing: `space-y-6`

### Cards
- Border radius: `rounded-[12px]` or `rounded-xl`
- Border: `border border-[#e5e7eb]` or `border-2`
- Shadow: `shadow-sm`

### Typography
- Titular: `text-[20px] leading-[30px] font-medium`
- Body: `text-[14px] leading-[24px]`
- Labels: `text-[14px] leading-[20px] text-[#4a5565]`
- Small: `text-[12px]` or `text-[13px]`
- Percentage: `text-[42px] font-bold tracking-tight`

### Grid
- Main: `grid lg:grid-cols-[7fr_3fr] gap-6`
- Preview row: `grid md:grid-cols-[2fr_1fr] gap-4`
- Diagnosis: `grid md:grid-cols-2 gap-6`
