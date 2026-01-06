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
        </CardContent>
      </Card>

      {/* Footer text */}
      <p className="text-xs text-muted-foreground text-center max-w-2xl px-4 mt-4">
        Estamos aplicando múltiples pruebas forenses para determinar la autenticidad del contenido
      </p>
    </div>
  );
}
