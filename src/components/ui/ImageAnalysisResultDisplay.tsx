import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { AlertTriangle, CheckCircle, Shield, Microscope, Sliders } from 'lucide-react';
import { useImageAnalysisResult } from '../../hooks/useImageAnalysisResult';
import type { AnalysisResult, AlgorithmResult } from '../../services/imageAnalysisTypes';

interface ImageAnalysisResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AlgorithmResultDisplay = ({ algo }: { algo: AlgorithmResult }) => (
  <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold capitalize flex items-center"><Sliders className="mr-2 h-4 w-4" />{algo.name}</h4>
          <Badge variant="secondary">{(algo.score * 100).toFixed(1)}%</Badge>
      </div>
      <img src={algo.heatmap} alt={`Heatmap for ${algo.name}`} className="w-full rounded-md border" />
  </div>
);

export function ImageAnalysisResultDisplay({ result, onReset }: ImageAnalysisResultDisplayProps) {
  const { summary, algorithms, verdictCardProps } = useImageAnalysisResult(result);

  const VerdictCard = () => {
    const Icon = verdictCardProps.variant === 'destructive' ? AlertTriangle : CheckCircle;
    return (
      <Card className={`border-${verdictCardProps.variant} bg-${verdictCardProps.variant}/10`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 text-${verdictCardProps.variant}`}>
            <Icon />
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultado del Análisis Forense de Imagen</CardTitle>
          <CardDescription>Análisis de falsificación y manipulación completado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerdictCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Microscope className="mr-2 h-5 w-5"/>Mapa de Calor Global</CardTitle>
                </CardHeader>
                <CardContent>
                    <img src={summary.heatmap} alt="Global heatmap" className="w-full rounded-md border" />
                    <p className="text-xs text-muted-foreground mt-2">Las áreas más brillantes indican mayor probabilidad de manipulación.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Shield className="mr-2 h-5 w-5"/>Regiones Sospechosas</CardTitle>
                </CardHeader>
                <CardContent>
                    <img src={summary.tampered_region} alt="Tampered regions" className="w-full rounded-md border" />
                    <p className="text-xs text-muted-foreground mt-2">Destaca las áreas con las anomalías más significativas.</p>
                </CardContent>
            </Card>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <h3 className="text-lg font-semibold flex items-center">
                        <Sliders className="mr-2 h-5 w-5" />
                        Desglose por Algoritmo
                    </h3>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    {algorithms.map(algo => <AlgorithmResultDisplay key={algo.name} algo={algo} />)}
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end">
            <Button onClick={onReset}>Analizar otra imagen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}