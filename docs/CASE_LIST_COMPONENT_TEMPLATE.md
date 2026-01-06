# CaseList Component Template

## Overview

The `CaseList` component is the **single source of truth** for rendering lists of cases in Botilito. It replaces all previous implementations (`CaseValidationList`, `Historial`, `CaseListView`) and should be used whenever you need to display a list of cases.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ ValidationCase  │ CaseEnriched[]  │ StandardizedCase[]          │
│ DTO[] (raw API) │ (hooks)         │ (DTO.json format)           │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                        │
         ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CaseList Component                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Props:                                                       ││
│  │ - cases: any of the 3 formats above                          ││
│  │ - isEnrichedFormat?: boolean                                 ││
│  │ - isStandardizedFormat?: boolean                             ││
│  │ - title, description, emptyMessage: string                   ││
│  │ - onViewTask: (caseId, type, status?) => void                ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Transform Layer (useMemo)                                    ││
│  │ - transformCasesToListItems()                                ││
│  │ - transformEnrichedCasesToListItems()                        ││
│  │ - transformStandardizedCasesToListItems()                    ││
│  │                   ↓                                          ││
│  │ ValidationCaseListItemDTO[] (normalized format)              ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Filter Layer (useMemo)                                       ││
│  │ - searchQuery filter (title, caseCode, reporter, summary)    ││
│  │ - contentType filter (todos, texto, imagen, video, audio,url)││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Render Layer                                                 ││
│  │ - Map filteredCases to <CaseListItem />                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start Examples

### Example 1: Historial Tab (History View)

```tsx
import { CaseList } from '@/components/CaseList';
import { useCaseHistory } from '@/hooks/useCaseHistory';

export function ContentReview({ onViewTask }) {
  const { cases, loading, error, stats, refresh } = useCaseHistory();

  const handleSelectCase = (caseId: string, contentType: string) => {
    onViewTask(caseId, 'caseDetail', 'completed');
  };

  return (
    <CaseList
      cases={cases}
      onViewTask={handleSelectCase}
      isLoading={loading}
      isEnrichedFormat={true}  // CRITICAL: Must be true for useCaseHistory data
      title="Historial de Casos"
      description="Registro completo de todos los casos analizados por Botilito"
      emptyMessage="No se encontraron casos en el historial"
    />
  );
}
```

### Example 2: Human Validation Tab

```tsx
import { CaseList } from '@/components/CaseList';
import { useHumanVerification } from '@/hooks/useHumanVerification';

export function HumanVerification() {
  const { cases, isLoading, handleSelectCase } = useHumanVerification();

  return (
    <CaseList
      cases={cases}
      onViewTask={handleSelectCase}
      isLoading={isLoading}
      isEnrichedFormat={true}  // CRITICAL: Must be true for useHumanVerification data
      // Using defaults: title, description, emptyMessage
    />
  );
}
```

### Example 3: With Raw API Data (ValidationCaseDTO)

```tsx
import { CaseList } from '@/components/CaseList';

export function RawApiView({ apiResponse }) {
  return (
    <CaseList
      cases={apiResponse.documents}  // Raw ValidationCaseDTO[]
      onViewTask={(id, type) => console.log('Selected:', id)}
      isLoading={false}
      // No format flags = assumes ValidationCaseDTO[]
    />
  );
}
```

### Example 4: With Standardized DTO Format

```tsx
import { CaseList } from '@/components/CaseList';

export function StandardizedView({ standardizedCases }) {
  return (
    <CaseList
      cases={standardizedCases}
      onViewTask={(id, type) => navigateTo(id)}
      isLoading={false}
      isStandardizedFormat={true}  // For DTO.json format
    />
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cases` | `ValidationCaseDTO[] \| CaseEnrichedCompatible[] \| StandardizedCase[]` | **required** | Array of cases in any supported format |
| `onViewTask` | `(caseId: string, type: string, status?: string) => void` | **required** | Callback when case is clicked |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `isEnrichedFormat` | `boolean` | `false` | Set `true` for `CaseEnriched[]` from hooks |
| `isStandardizedFormat` | `boolean` | `false` | Set `true` for `StandardizedCase[]` |
| `title` | `string` | `"Casos Pendientes de Validación"` | Card header title |
| `description` | `string` | `"Revisa y valida los análisis..."` | Card header subtitle |
| `emptyMessage` | `string` | `"No hay casos pendientes..."` | Message when list is empty |

---

## File Structure

```
src/
├── components/
│   ├── CaseList.tsx              # Main list component (THIS FILE)
│   ├── CaseListItem.tsx          # Individual row component
│   ├── ContentReview.tsx         # Historial page (uses CaseList)
│   └── HumanVerification.tsx     # Validation page (uses CaseList)
├── hooks/
│   ├── useCaseHistory.ts         # Hook for Historial data
│   └── useHumanVerification.ts   # Hook for Validation data
├── types/
│   └── validation.ts             # DTOs and transform functions
└── utils/
    └── humanVerification/
        ├── api.ts                # fetchVerificationSummary()
        └── types.ts              # CaseEnriched type
```

---

## Data Types

### ValidationCaseListItemDTO (Normalized Output)

This is the internal format used by `CaseListItem`. All input formats are transformed to this:

```typescript
interface ValidationCaseListItemDTO {
  id: string;                    // Case UUID
  caseCode: string;              // Display code (e.g., "I-20240115-ABC")
  contentType: 'texto' | 'imagen' | 'video' | 'audio' | 'url';
  title: string;                 // Case title
  summary: string;               // Brief description
  createdAt: string;             // ISO date string
  reportedBy: string;            // Reporter name
  humanValidatorsCount: number;  // Number of human votes
  consensusState: ConsensusState;// 'ai_only' | 'human_consensus' | 'conflicted'
  theme?: string;                // 'Desinformódico' | 'Forense'
  amiScore?: number;             // AMI compliance score (0-100)
  amiLevel?: AMIComplianceLevel; // AMI compliance level
  screenshotUrl?: string;        // Optional preview image
}
```

### AMI Compliance Levels

| Level | Badge Color | Icon |
|-------|-------------|------|
| `Desarrolla las estrategias AMI` | Green | CheckCircle2 |
| `Cumple las premisas AMI` | Green | CheckCircle2 |
| `Requiere un enfoque AMI` | Orange | AlertTriangle |
| `No cumple las premisas AMI` | Red | Wand2 |
| `Generado por IA` | Purple | Bot |

---

## Creating a New View with CaseList

### Step 1: Create or Use a Data Hook

If you need custom data fetching:

```typescript
// hooks/useMyCustomCases.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchVerificationSummary } from '@/utils/humanVerification/api';
import type { CaseEnriched } from '@/utils/humanVerification/types';

export function useMyCustomCases() {
  const [cases, setCases] = useState<CaseEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchVerificationSummary(1, 10);
      setCases(result.cases || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { cases, loading, error, refresh: fetchCases };
}
```

### Step 2: Create the View Component

```tsx
// components/MyCustomView.tsx
import { CaseList } from '@/components/CaseList';
import { useMyCustomCases } from '@/hooks/useMyCustomCases';

interface MyCustomViewProps {
  onViewTask: (caseId: string, type: string, status?: string) => void;
}

export function MyCustomView({ onViewTask }: MyCustomViewProps) {
  const { cases, loading, error, refresh } = useMyCustomCases();

  const handleSelectCase = (caseId: string, contentType: string) => {
    onViewTask(caseId, contentType, 'pending');
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <button onClick={refresh}>Refresh</button>

      <CaseList
        cases={cases}
        onViewTask={handleSelectCase}
        isLoading={loading}
        isEnrichedFormat={true}
        title="My Custom Cases"
        description="A custom view of cases"
        emptyMessage="No cases found"
      />
    </div>
  );
}
```

### Step 3: Wire Up Navigation

The `onViewTask` callback typically navigates to a detail view:

```tsx
// In parent component or router
const handleViewTask = (caseId: string, type: string, status?: string) => {
  // Option 1: Update state to show detail view
  setSelectedCaseId(caseId);
  setViewMode('detail');

  // Option 2: Navigate via router
  navigate(`/cases/${caseId}`);

  // Option 3: Open modal
  openCaseDetailModal(caseId);
};
```

---

## Styling Reference

### Brand Colors (from CLAUDE.md)

| Element | Hex | Tailwind |
|---------|-----|----------|
| Case card border | `#ffda00` | `border-[#ffda00]` |
| Icon background | `var(--accent)` | `bg-[#ffe97a]` |
| Case code badge border | `var(--accent)` | `border-[#ffe97a]` |

### Content Type Icons

| Type | Icon | Background |
|------|------|------------|
| texto | FileText | `bg-amber-300` |
| imagen | ImageIcon | `bg-amber-300` |
| video | Video | `bg-amber-300` |
| audio | Volume2 | `bg-amber-300` |
| url | Link2 | `bg-amber-300` |

---

## Common Gotchas

### 1. Format Flag Required
**Problem**: Cases don't render correctly or show wrong data
**Solution**: Always set `isEnrichedFormat={true}` when using `useCaseHistory` or `useHumanVerification`

### 2. Missing Transform
**Problem**: Adding new data format but cases don't display
**Solution**: Add transform function in `@/types/validation.ts` and update CaseList to use it

### 3. Callback Signature
**Problem**: Case clicks don't work
**Solution**: Ensure `onViewTask` matches signature: `(caseId: string, type: string, status?: string) => void`

---

## Migration from Old Components

If you find code using these deprecated components, migrate to CaseList:

| Old Component | Replacement |
|---------------|-------------|
| `CaseValidationList` | `CaseList` (alias exists for backwards compatibility) |
| `Historial` | `ContentReview` (uses CaseList internally) |
| `CaseListView` | `CaseList` |

---

## Related Files

- `src/components/CaseList.tsx` - Main component
- `src/components/CaseListItem.tsx` - Row renderer
- `src/types/validation.ts` - Type definitions and transforms
- `src/hooks/useCaseHistory.ts` - History data hook
- `src/hooks/useHumanVerification.ts` - Validation data hook
- `CLAUDE.md` - Design system colors and tokens
