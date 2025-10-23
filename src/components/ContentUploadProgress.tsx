import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Bot } from 'lucide-react';

interface ContentUploadProgressProps {
  progress: number;
}

export function ContentUploadProgress({ progress }: ContentUploadProgressProps) {
  const getStatusMessage = (p: number) => {
    if (p < 20) return "Secuenciando contenido desinfodémico...";
    if (p < 50) return "Identificando vectores de transmisión...";
    if (p < 80) return "Calculando índice de infectividad...";
    if (p < 95) return "Generando diagnóstico epidemiológico...";
    return "Finalizando análisis...";
  };

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
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground text-center font-medium">
              {getStatusMessage(progress)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
