import React from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '../services/imageAnalysisTypes';
import MetadataDisplay from './image-analysis/MetadataDisplay';
import { useImageAnalysisResult } from '../hooks/useImageAnalysisResult';

interface ImageAnalysisResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ImageAnalysisResultDisplay({ result, onReset }: ImageAnalysisResultDisplayProps) {
  const { 
    isTampered, 
    confidencePercent, 
    verdictCardProps, 
    metadataInsight,
    meta 
  } = useImageAnalysisResult(result);

  const getVerdictCard = () => {
    if (isTampered) {
      return (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle />
              <span>{verdictCardProps.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{verdictCardProps.description}</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-primary bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <CheckCircle />
            <span>{verdictCardProps.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{verdictCardProps.description}</p>
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
                <span className="text-sm font-medium">Nivel de Confianza (Manipulación)</span>
                <Badge variant={isTampered ? "destructive" : "secondary"}>{confidencePercent}%</Badge>
              </div>
              <Progress value={parseFloat(confidencePercent)} className={isTampered ? "bg-destructive" : ""} />
            </CardContent>
          </Card>

          {metadataInsight && <MetadataDisplay insights={[metadataInsight]} />}

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
