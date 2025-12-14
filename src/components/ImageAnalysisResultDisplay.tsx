import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import type { AnalysisResult } from '../services/imageAnalysisTypes';

interface ImageAnalysisResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ImageAnalysisResultDisplay({ result, onReset }: ImageAnalysisResultDisplayProps) {
  const { summary, meta } = result;
  const isTampered = summary.global_verdict === 'TAMPERED';
  const confidencePercent = (summary.confidence_score * 100).toFixed(1);

  const getVerdictCard = () => {
    if (isTampered) {
      return (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle />
              <span>Veredicto: Imagen Posiblemente Manipulada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nuestros análisis sugieren que esta imagen puede haber sido alterada digitalmente.</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-primary bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <CheckCircle />
            <span>Veredicto: Imagen Limpia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se encontraron señales evidentes de manipulación en esta imagen.</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultado del Análisis de Imagen</CardTitle>
          <CardDescription>Análisis de falsificación y manipulación completado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {getVerdictCard()}
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Nivel de Confianza (Manipulación)</Label>
                <Badge variant={isTampered ? "destructive" : "secondary"}>{confidencePercent}%</Badge>
              </div>
              <Progress value={parseFloat(confidencePercent)} className={isTampered ? "bg-destructive" : ""} />
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center">
            Análisis completado en {meta.duration_ms}ms. {meta.cached && "(Resultado de caché)"}
          </div>

          <div className="flex justify-end">
            <Button onClick={onReset}>Analizar otra imagen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
