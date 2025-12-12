import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, FilePlus } from 'lucide-react';
import BotilitoError from '../assets/BotilitoError.png';

interface ErrorManagerProps {
  error: { message: string };
  onRetry: () => void;
  onReset: () => void;
  retryCount: number;
}

export function ErrorManager({ error, onRetry, onReset, retryCount }: ErrorManagerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <img
        src={BotilitoError}
        alt="Botilito triste por un error"
        className="w-48 h-48 object-contain"
      />
      <Card className="w-full max-w-2xl shadow-lg border-2 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            ¡Uy, parce! Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Parece que mis circuitos tuvieron un cortocircuito. Esto fue lo que pasó:
          </p>
          <div className="p-4 bg-destructive/10 rounded-md">
            <p className="text-destructive font-mono text-sm">{error.message}</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar Análisis ({retryCount}/3)
            </Button>
            <Button onClick={onReset}>
              <FilePlus className="mr-2 h-4 w-4" />
              Analizar Otro Contenido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
