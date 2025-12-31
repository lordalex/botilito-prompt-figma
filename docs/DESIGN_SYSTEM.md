# Botilito Design System Reference

## OFFICIAL DESIGNER COLORS

> **DO NOT CHANGE WITHOUT DESIGNER APPROVAL**

---

## Colores de Pruebas y Marcadores (Test & Marker Colors)

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Verde (AUTHENTIC) | `#22c55e` | `green-500` | Authentic/verified content |
| Amarillo (WARNING) | `#eab308` | `yellow-500` | Warnings, uncertain results |
| Naranja (HIGH severity) | `#f97316` | `orange-500` | High severity findings |
| Rojo (MANIPULATED) | `#ef4444` | `red-500` | Manipulated content, progress bars |
| Rojo (SYNTHETIC/CRITICAL) | `#dc2626` | `red-600` | Synthetic/AI content, critical badges |

---

## Colores de Marca Botilito (Brand Colors)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Amarillo Principal | `#ffda00` | `bg-primary` | Buttons, CTAs, primary actions |
| Amarillo Resaltado | `#ffe97a` | `bg-secondary` | Banners, backgrounds, highlights |

### Botilito Banner
| Element | Hex | Tailwind |
|---------|-----|----------|
| Background | `#ffe97a` | `bg-[#ffe97a]` |
| Border | `#ffda00` | `border-[#ffda00]` |
| Text | `#000000` | `text-black` |

---

## Risk Level Colors

### Safe / Low Risk (Score < 30)
| Element | Hex | Tailwind |
|---------|-----|----------|
| Primary | `#22c55e` | `green-500` |
| Background | `#f0fdf4` | `bg-green-50` |
| Border | `#22c55e` | `border-green-500` |
| Text | `#15803d` | `text-green-700` |
| Progress | `#22c55e` | `bg-green-500` |

### Medium Risk (Score 30-70)
| Element | Hex | Tailwind |
|---------|-----|----------|
| Primary | `#eab308` | `yellow-500` |
| Background | `#fefce8` | `bg-yellow-50` |
| Border | `#eab308` | `border-yellow-500` |
| Text | `#ca8a04` | `text-yellow-600` |
| Progress | `#eab308` | `bg-yellow-500` |

### High Severity (Score 70-90)
| Element | Hex | Tailwind |
|---------|-----|----------|
| Primary | `#f97316` | `orange-500` |
| Background | `#fff7ed` | `bg-orange-50` |
| Border | `#f97316` | `border-orange-500` |
| Text | `#ea580c` | `text-orange-600` |
| Progress | `#f97316` | `bg-orange-500` |

### Critical Risk (Score > 90)
| Element | Hex | Tailwind |
|---------|-----|----------|
| Primary | `#ef4444` | `red-500` |
| Background | `#fef2f2` | `bg-red-50` |
| Border | `#ef4444` | `border-red-500` |
| Text | `#dc2626` | `text-red-600` |
| Progress | `#ef4444` | `bg-red-500` |

---

## Badge Colors

### Test Result Badges
| Badge | Background | Text | Tailwind Classes |
|-------|-----------|------|------------------|
| AUTÉNTICO | `#dcfce7` | `#166534` | `bg-green-100 text-green-800 hover:bg-green-200` |
| MANIPULADO | `#ef4444` | `#ffffff` | `bg-red-500 hover:bg-red-600 text-white` |
| SINTÉTICO | `#dc2626` | `#ffffff` | `bg-red-600 hover:bg-red-700 text-white` |
| INCIERTO | `#eab308` | `#ffffff` | `bg-yellow-500 hover:bg-yellow-600 text-white` |
| ALTA SEVERIDAD | `#f97316` | `#ffffff` | `bg-orange-500 hover:bg-orange-600 text-white` |
| CRÍTICO | `#dc2626` | `#ffffff` | `bg-red-600 hover:bg-red-700 text-white` |
| RELEVANTE | `#f97316` | `#ffffff` | `bg-orange-500 hover:bg-orange-600 text-white` |
| NORMAL | `#dcfce7` | `#166534` | `bg-green-100 text-green-800 hover:bg-green-200` |

---

## Progress Bar Colors

| Result Type | Tailwind | Hex |
|-------------|----------|-----|
| Authentic | `bg-green-500` | `#22c55e` |
| Manipulated | `bg-red-500` | `#ef4444` |
| Synthetic | `bg-red-600` | `#dc2626` |
| Uncertain | `bg-yellow-500` | `#eab308` |
| High Severity | `bg-orange-500` | `#f97316` |
| Critical | `bg-red-500` | `#ef4444` |

---

## Card Styles

### Summary Card
```tsx
// Dynamic based on risk score
const getSummaryStyle = (riskScore: number) => {
  if (riskScore < 30) {
    return 'border-2 border-green-500 bg-green-50';
  } else if (riskScore < 70) {
    return 'border-2 border-yellow-500 bg-yellow-50';
  } else {
    return 'border-2 border-red-500 bg-red-50';
  }
};
```

### File Info Card
| Element | Tailwind |
|---------|----------|
| Border | `border-yellow-200` |
| Icon | `text-amber-500` |
| Background | `bg-white` |

### Stats Card
| Element | Tailwind |
|---------|----------|
| Border | `border-gray-100` |
| Background | `bg-white` |

### Recommendations Card
| Element | Tailwind |
|---------|----------|
| Background | `bg-[#FFFCE8]` |
| Border | `border-yellow-200` |
| Bullet | `text-yellow-400` |

### Test Result Card
| Element | Tailwind |
|---------|----------|
| Border | `border-gray-100` |
| Background | `bg-white` |
| Shadow | `shadow-sm` |

---

## Button Styles

| Button | Tailwind Classes |
|--------|------------------|
| Download Report | `bg-white hover:bg-gray-50 border border-gray-200 text-gray-900` |
| Share Analysis | `bg-green-50 hover:bg-green-100 border border-green-200 text-green-800` |
| New Analysis | `bg-secondary hover:bg-primary text-primary-foreground` |

---

## Text Colors

| Type | Tailwind | Hex |
|------|----------|-----|
| Primary | `text-gray-900` | `#111827` |
| Secondary | `text-gray-700` | `#374151` |
| Muted | `text-gray-500` | `#6B7280` |
| Disabled | `text-gray-400` | `#9CA3AF` |
| Warning | `text-orange-500` | `#F97316` |
| Error | `text-red-500` | `#EF4444` |
| Success | `text-green-600` | `#16A34A` |

---

## Timeline (Chain of Custody)

| Element | Tailwind |
|---------|----------|
| Node Background | `bg-yellow-100` |
| Node Border | `border-2 border-yellow-400` |
| Node Inner Dot | `bg-yellow-500` |
| Connecting Line | `bg-gray-200` |

---

## Audio Visualizations

### Waveform
```tsx
// Container gradient
className="bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"
// Bars
className="bg-primary/60"
```

### Spectrogram
```tsx
// Gradient (vertical)
className="bg-gradient-to-b from-purple-900 via-red-600 to-yellow-400"
```

---

## CSS Variables (globals.css)

```css
:root {
  --primary: #ffda00;
  --secondary: #ffe97a;
  --destructive: #FF4444;
  --marcador-manipulado: #a855f7;
  --marcador-enganoso: #f97316;
  --marcador-falso: #ef4444;
  --marcador-verdadero: #10b981;
}
```

---

## Implementation Example

```tsx
import { getBadgeConfig, getRiskColors, getSummaryCardStyles } from '@/styles/design-tokens';

// Get badge styling
const badgeConfig = getBadgeConfig('manipulated', 0.85);
// Returns: { bg, text, tailwind, label }

// Get risk colors
const riskColors = getRiskColors(75);
// Returns colors for high risk

// Get summary card styles
const summaryStyles = getSummaryCardStyles(85);
// Returns: { border, bg, text, progress }
```

---

## Visual Reference

```
+----------------------------------------------------------+
|  [Banner: #FFE97A bg, #FFDA00 border]                    |
|  "Botilito: Listo parce! Ya termine el analisis..."     |
+----------------------------------------------------------+

+------------------------+  +-----------------------------+
| [Summary Card]         |  | [File Info: border-yellow]  |
| Circle: green/yellow/  |  | Icon: amber-500             |
| red based on score     |  +-----------------------------+
| Progress: matches      |  | [Stats: border-gray-100]    |
+------------------------+  +-----------------------------+
                           | [Recommendations: #FFFCE8]   |
| [Test Cards]             | Bullets: yellow-400          |
| Badge: MANIPULADO        +-----------------------------+
| (orange-500)            |
| Progress: orange-500    |
+------------------------+

+----------------------------------------------------------+
| [Buttons]                                                |
| [Download: white] [Share: green-50] [New: secondary]     |
+----------------------------------------------------------+
```
