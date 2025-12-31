# Botilito Project Memory

## Project Overview
Botilito is a digital forensic analysis platform for detecting manipulated media (images, audio, video) and misinformation content. Built with React + Vite + TypeScript + Supabase.

---

## OFFICIAL DESIGNER COLORS - ALWAYS USE THESE

### Colores de Pruebas y Marcadores (Test & Marker Colors)

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Verde** (AUTHENTIC) | `#22c55e` | `green-500` | Authentic/verified content |
| **Amarillo** (WARNING) | `#eab308` | `yellow-500` | Warnings, uncertain results |
| **Naranja** (HIGH severity) | `#f97316` | `orange-500` | High severity findings |
| **Rojo** (MANIPULATED) | `#ef4444` | `red-500` | Manipulated content, progress bars |
| **Rojo** (SYNTHETIC/CRITICAL) | `#dc2626` | `red-600` | Synthetic/AI content, critical badges |

### Colores de Marca Botilito (Brand Colors)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Amarillo Principal** | `#ffda00` | `bg-primary` | Buttons, CTAs, primary actions |
| **Amarillo Resaltado** | `#ffe97a` | `bg-secondary` | Banners, backgrounds, highlights |

### Test Result Badge Colors

**IMPORTANT: Badge color ≠ Progress bar color for MANIPULATED!**

| Badge | Badge Color | Badge Tailwind | Progress Bar |
|-------|-------------|----------------|--------------|
| MANIPULATED | Orange `#f97316` | `bg-orange-500 hover:bg-orange-600 text-white` | `bg-red-500` |
| SYNTHETIC | Red `#dc2626` | `bg-red-600 hover:bg-red-700 text-white` | `bg-red-600` |
| UNCERTAIN | Yellow `#eab308` | `bg-yellow-500 hover:bg-yellow-600 text-white` | `bg-yellow-500` |
| NORMAL | Green `#dcfce7` | `bg-green-100 text-green-800 hover:bg-green-200` | `bg-green-500` |

### Other Badge Types (less common)
| Badge | Hex | Tailwind Classes |
|-------|-----|------------------|
| AUTÉNTICO | `#dcfce7` | `bg-green-100 text-green-800 hover:bg-green-200` |
| ALTA SEVERIDAD | `#f97316` | `bg-orange-500 hover:bg-orange-600 text-white` |
| CRÍTICO | `#dc2626` | `bg-red-600 hover:bg-red-700 text-white` |
| RELEVANTE | `#f97316` | `bg-orange-500 hover:bg-orange-600 text-white` |

### Risk Level Card Styles (Summary Card)

| Risk Level | Border | Background | Text | Progress | Circle Stroke | Circle BG |
|------------|--------|------------|------|----------|---------------|-----------|
| Safe (<30) | `border-green-500` | `bg-green-50` | `text-green-600` | `bg-green-500` | `#22c55e` | `#dcfce7` |
| Medium (30-70) | `border-yellow-500` | `bg-yellow-50` | `text-yellow-600` | `bg-yellow-500` | `#eab308` | `#fef9c3` |
| High (70-90) | `border-orange-500` | `bg-orange-50` | `text-orange-600` | `bg-orange-500` | `#f97316` | `#ffedd5` |
| Critical (≥90) | `border-red-500` | `bg-red-50` | `text-red-600` | `bg-red-500` | `#ef4444` | `#fee2e2` |

### Circular Meter (SVG)
```tsx
// Background circle uses strokeBg, progress circle uses stroke
<circle stroke={colors.strokeBg} strokeWidth="12" fill="none" />
<circle stroke={colors.stroke} strokeWidth="12" fill="none"
  strokeDasharray={`${2 * Math.PI * 56}`}
  strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
/>
```

### Botilito Banner
- Background: `#ffe97a` (`bg-[#ffe97a]`)
- Border: `#ffda00` (`border-[#ffda00]`)
- Text: Black

### Recommendations Card
- Background: `#FFFCE8` (`bg-[#FFFCE8]`)
- Border: `border-yellow-200`
- Bullets: `text-yellow-400`

### File Info Card
- Border: `border-yellow-200`
- Icon: `text-amber-500`

---

## Design Token Files
- `src/styles/design-tokens.ts` - TypeScript constants with helper functions
- `docs/DESIGN_SYSTEM.md` - Full reference documentation

---

## Key Architecture Notes

### Analysis Result Views
- Image Analysis: `src/components/image-analysis/ImageAnalysisResultView.tsx`
- Audio Analysis: `src/components/audio-analysis/AudioAnalysisResultView.tsx`
- Both use similar layout: Botilito banner, summary card, tabs, sidebar

### API Endpoints
- Image/Video Analysis: Supabase Edge Functions
- Audio Analysis: External server with `/submit` endpoint (base64 audio)

---

## Git Workflow
- Main branch: `main`
- Development: `dev`
- Features: `feat/<issue-number>/<description>`
- Always stay in `dev` for testing unless explicitly told to merge to `main`
