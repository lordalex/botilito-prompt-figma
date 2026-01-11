# CaseListItem Layout

## Component Location
`src/components/CaseListItem.tsx`

## Visual Layout (4-Column Design)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌────────┐  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  ┌─────────────┐ │
│  │        │  │                         │  │                                     │  │             │ │
│  │  ICON  │  │ Caso: T-OT-20260111-415 │  │  [Theme Badge]                      │  │ [AMI Badge] │ │
│  │        │  │                         │  │                                     │  │             │ │
│  └────────┘  └─────────────────────────┘  │  Title text goes here and can       │  └─────────────┘ │
│   Column 1        Column 2                │  span up to 2 lines maximum         │     Column 4     │
│   (shrink-0)      (shrink-0)              │                                     │     (shrink-0)   │
│                                           │  📅 Date  👤 Reporter  🛡 Count      │     (ml-auto)    │
│                                           └─────────────────────────────────────┘                  │
│                                                      Column 3 (flex-1)                             │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Desktop Layout (sm: and above)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ flex-row, items-center, gap-3, p-3, rounded-xl                                                           │
│                                                                                                          │
│  ┌────────┐  ┌──────────────────────────┐  ┌────────────────────────────────────────┐  ┌──────────────┐ │
│  │  📄    │  │ Caso: T-OT-20260111-415  │  │ ✨ Desinformódico                      │  │ ⚠ Requiere   │ │
│  │        │  │                          │  │                                        │  │    AMI       │ │
│  │ p-2    │  │ font-mono, border-2      │  │ Fiscalía abre indagación tras...       │  │              │ │
│  │ amber  │  │ border-[var(--accent)]   │  │ (line-clamp-2)                         │  │ shrink-0     │ │
│  │ bg     │  │                          │  │                                        │  │ ml-auto      │ │
│  └────────┘  └──────────────────────────┘  │ 📅 10 ene 2026  👤 Usuario  🛡 1       │  │ pl-4         │ │
│   shrink-0        shrink-0                 └────────────────────────────────────────┘  └──────────────┘ │
│                                                      flex-1, min-w-0                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (< sm)

```
┌──────────────────────────────────────┐
│ flex-col, gap-2, p-2, rounded-lg     │
│                                      │
│  ┌────────┐  ┌────────────────────┐  │
│  │  📄    │  │ Caso: T-OT-202...  │  │
│  └────────┘  └────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ✨ Desinformódico              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Title text that can wrap to    │  │
│  │ two lines on mobile screens    │  │
│  └────────────────────────────────┘  │
│                                      │
│  📅 10 ene  👤 Usuario  🛡 1         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ⚠ Requiere AMI                 │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

## Component Structure (4 Columns)

```
CaseListItem (root div)
│
├── Column 1: Icon + Case Code (shrink-0)
│   ├── Content Type Icon
│   │   └── bg: var(--accent) / amber-300
│   │   └── Icons: FileText, Image, Video, Volume2, Link2
│   │
│   └── Case Code Badge
│       └── font-mono, border-2, border-[var(--accent)]
│       └── "Caso: {caseCode}"
│
├── Column 2: Main Info (flex-1, min-w-0)
│   │
│   ├── Line 1: Theme Badge (optional)
│   │   └── Red: "Desinformódico"
│   │   └── Purple: "Forense"
│   │
│   ├── Line 2: Title
│   │   └── font-semibold, line-clamp-2
│   │
│   └── Line 3: Metadata
│       ├── 📅 Date (Calendar icon)
│       ├── 👤 Reporter (User icon)
│       └── 🛡 Validators count (Shield icon)
│
└── Column 3: AMI Badge (shrink-0, ml-auto, pl-4)
    └── Right-aligned AMI compliance badge
    └── Green: "Desarrolla AMI" / "Sin alteraciones"
    └── Orange: "Requiere AMI"
    └── Red: "Manipulado"
    └── Purple: "Generado por IA"
```

## Badge Color Reference

### Theme Badges (Column 2)
| Theme | Background | Text | Border |
|-------|------------|------|--------|
| Desinformódico | `bg-red-50` | `text-red-700` | `border-red-600` |
| Forense | `bg-purple-50` | `text-purple-700` | `border-purple-600` |

### AMI Compliance Badges (Column 3 - Right Side)
| Level | Background | Text | Border | Icon |
|-------|------------|------|--------|------|
| Desarrolla las estrategias AMI | `bg-green-50` | `text-green-700` | `border-green-600` | CheckCircle2 |
| Cumple las premisas AMI | `bg-green-50` | `text-green-700` | `border-green-600` | CheckCircle2 |
| Requiere un enfoque AMI | `bg-orange-50` | `text-orange-700` | `border-orange-600` | AlertTriangle |
| No cumple las premisas AMI | `bg-red-50` | `text-red-700` | `border-red-600` | Wand2 |
| Generado por IA | `bg-purple-50` | `text-purple-700` | `border-purple-600` | Bot |

### Content Type Icons (Column 1)
| Type | Icon | Background |
|------|------|------------|
| texto | FileText | `var(--accent)` |
| imagen | Image | `var(--accent)` |
| video | Video | `var(--accent)` |
| audio | Volume2 | `var(--accent)` |
| url | Link2 | `var(--accent)` |

## CSS Classes Summary

```css
/* Root container */
.case-card-hover
flex flex-col sm:flex-row
sm:items-center
gap-2 sm:gap-3
p-2 sm:p-3
rounded-lg sm:rounded-xl
cursor-pointer
bg-white
border border-gray-200

/* Column 1: Icon container */
shrink-0
p-1.5 sm:p-2
rounded-md sm:rounded-lg
bg: var(--accent)

/* Column 1: Case code */
text-xs sm:text-sm
font-mono
px-2 py-0.5
border-2
rounded-md sm:rounded-lg
bg-white
text-gray-700
border-color: var(--accent)

/* Column 2: Main info */
flex-1
min-w-0
space-y-1.5 sm:space-y-1

/* Column 2: Title */
text-xs sm:text-sm
font-semibold
text-gray-900
line-clamp-2

/* Column 2: Metadata */
text-[10px] sm:text-xs
text-gray-500

/* Column 3: AMI Badge container */
shrink-0
sm:ml-auto
sm:pl-4

/* Column 3: AMI Badge */
text-[10px] sm:text-xs
font-medium
px-2 py-0.5 sm:px-3 sm:py-1.5
```

## Data Interface

```typescript
interface ValidationCaseListItemDTO {
  id: string;
  caseCode: string;           // e.g., "T-OT-20260111-415"
  contentType: 'texto' | 'imagen' | 'video' | 'audio' | 'url';
  title: string;
  createdAt: string;          // ISO date string
  reportedBy: string;
  humanValidatorsCount: number;
  theme?: 'Desinformódico' | 'Forense';
  amiLevel?: AMIComplianceLevel;
}
```

## Key Design Decisions

1. **AMI Badge in separate column**: The AMI badge is now in its own column (Column 3) on the far right, making it more prominent and easier to scan.

2. **Right alignment**: Using `ml-auto` and `pl-4` to push the AMI badge to the right edge with padding.

3. **Responsive behavior**: On mobile, the AMI badge stacks below the metadata. On desktop, it appears as a distinct right-aligned column.

4. **Visual hierarchy**: The 4-column layout creates clear visual separation:
   - Quick identification (icon + case code)
   - Content details (theme, title, metadata)
   - Compliance status (AMI badge)
