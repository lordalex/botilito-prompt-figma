# ContentUploadProgress Loader Component

This document contains the code for the analysis progress loader component from the `feature/loaders` branch.

---

## Overview

The `ContentUploadProgress` component displays a loading state while Botilito performs forensic analysis on uploaded content. It shows progress, file information, and provides action buttons when analysis completes.

---

## Props Interface

```tsx
interface ContentUploadProgressProps {
  step: string;           // Current analysis step name
  status: string;         // Status message to display
  progress: number;       // Progress percentage (0-100)
  fileName?: string;      // Optional: Name of file being analyzed
  onViewResult?: () => void;  // Optional: Callback when "Ver resultado" is clicked
}
```

---

## New Version (feature/loaders)

This is the redesigned loader with Colombian-themed messaging and improved UX:

```tsx
import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { FileText, Upload, Loader2, Coffee, SquareCheck } from 'lucide-react';

interface ContentUploadProgressProps {
  step: string;
  status: string;
  progress: number;
  fileName?: string;
  onViewResult?: () => void;
}

export function ContentUploadProgress({ step, status, progress, fileName, onViewResult }: ContentUploadProgressProps) {
  const isComplete = progress >= 100;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Botilito character */}
      <div className="flex justify-center mb-0">
        <img src={botilitoImage} alt="Botilito" className="w-32 h-32 object-contain" />
      </div>

      {/* Main card */}
      <Card className="w-full max-w-2xl bg-white border-2 border-[#ffda00] shadow-2xl">
        <CardContent className="p-8 space-y-6">
          {/* Header text */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-center text-gray-900 flex items-center justify-center gap-2">
              <Coffee className="h-6 w-6" style={{ color: '#ffda00', stroke: '#ffda00' }} />
              ¡Bien parce! Ya hemos cargado tu archivo
            </h2>
            <p className="text-sm text-center text-gray-600">
              Esto puede tardar un tiempito, te invito a tomarte un tinto☕ mientras esperas.
            </p>
            <p className="text-sm text-center font-medium text-gray-900">
              ¡Tú tranqui, yo te aviso cuando esté listo!
            </p>
          </div>

          {/* File name box */}
          {fileName && (
            <div className="bg-[#ffe97a] border border-[#ffda00] rounded-lg p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-900 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Analizando:</p>
                <p className="text-sm text-gray-700 truncate">{fileName}</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-2 bg-gray-100" />
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">{status}</p>
              <p className="font-medium text-gray-900">{Math.round(progress)}%</p>
            </div>
          </div>

          {/* Success message when complete */}
          {isComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <SquareCheck className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm font-medium text-green-800">
                ¡Listo parce! El análisis forense está completo
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-white hover:bg-gray-50" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Reportar otro contenido
            </Button>
            <Button
              className="flex-1 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffda00' }}
              disabled={!isComplete}
              onClick={onViewResult}
            >
              {isComplete ? (
                <SquareCheck className="h-4 w-4 mr-2" />
              ) : (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Ver resultado del análisis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer text */}
      <p className="text-xs text-muted-foreground text-center max-w-2xl px-4 mt-4">
        Estamos aplicando múltiples pruebas forenses para determinar la autenticidad del contenido
      </p>
    </div>
  );
}
```

---

## Original Version (main)

For reference, this was the previous simpler version:

```tsx
import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Bot } from 'lucide-react';

interface ContentUploadProgressProps {
  step: string;
  status: string;
  progress: number;
}

export function ContentUploadProgress({ step, status, progress }: ContentUploadProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="flex justify-center">
        <img
          src={botilitoImage}
          alt="Botilito analizando"
          className="w-48 h-48 object-contain animate-bounce"
        />
      </div>
      <Card className="w-full max-w-3xl shadow-lg border-2">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Botilito está diagnosticando...
            </h2>
            <p className="text-muted-foreground text-base">
              Aplicando análisis epidemiológico para detectar patrones de desinformación y evaluar su potencial viral
            </p>
          </div>
          <div className="space-y-4">
            <Progress value={progress} className="w-full h-3 animate-pulse" />
            <p className="text-sm text-muted-foreground text-center font-medium">
              {step}: {status}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Key Differences

| Feature | Original (main) | New (feature/loaders) |
|---------|-----------------|----------------------|
| **Botilito Size** | 192x192px (w-48 h-48) | 128x128px (w-32 h-32) |
| **Animation** | `animate-bounce` | None |
| **Card Border** | Default | `border-[#ffda00]` (Botilito yellow) |
| **Header Icon** | Bot icon | Coffee icon |
| **Messaging** | Technical ("epidemiológico") | Friendly Colombian slang ("parce", "tinto") |
| **File Name Display** | Not shown | Yellow box with file name |
| **Progress Display** | Step: Status | Status + percentage |
| **Completion State** | None | Green success message |
| **Action Buttons** | None | "Reportar otro" + "Ver resultado" |
| **Callback** | None | `onViewResult` prop |

---

## Design Tokens Used

| Element | Color | Hex |
|---------|-------|-----|
| Card border | Amarillo Principal | `#ffda00` |
| File name box background | Amarillo Resaltado | `#ffe97a` |
| Primary button | Amarillo Principal | `#ffda00` |
| Coffee icon | Amarillo Principal | `#ffda00` |
| Success message | Green | `bg-green-50`, `border-green-200`, `text-green-800` |

---

## Usage Example

```tsx
import { ContentUploadProgress } from '@/components/ContentUploadProgress';

function AnalysisPage() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleViewResult = () => {
    navigate('/analysis/result/123');
  };

  return (
    <ContentUploadProgress
      step="Análisis de imagen"
      status="Detectando manipulaciones..."
      progress={progress}
      fileName="evidencia-foto.jpg"
      onViewResult={handleViewResult}
    />
  );
}
```
