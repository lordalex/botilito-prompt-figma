import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  X, Shield, AlertTriangle, CheckCircle, XCircle, 
  ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';

interface InPageOverlayProps {
  onClose?: () => void;
  position?: { x: number; y: number };
}

export function InPageOverlay({ onClose, position = { x: 20, y: 20 } }: InPageOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [analysisResult] = useState({
    status: 'warning',
    title: 'Alerta de contenido detectada',
    markers: [
      { type: 'Sensacionalista', confidence: 0.82 },
      { type: 'Manipulado', confidence: 0.75 },
      { type: 'Sin Verificar', confidence: 0.68 }
    ],
    summary: 'Este artículo presenta características típicas de contenido sensacionalista. Recomendamos verificar las fuentes antes de compartir.',
    caseNumber: 'T-WA-20241014-789'
  });

  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: any } = {
      'safe': {
        color: 'bg-green-500',
        icon: <CheckCircle className="h-5 w-5" />,
        borderColor: 'border-green-500'
      },
      'warning': {
        color: 'bg-orange-500',
        icon: <AlertTriangle className="h-5 w-5" />,
        borderColor: 'border-orange-500'
      },
      'alert': {
        color: 'bg-red-500',
        icon: <XCircle className="h-5 w-5" />,
        borderColor: 'border-red-500'
      }
    };
    return configs[status] || configs['warning'];
  };

  const config = getStatusConfig(analysisResult.status);

  return (
    <div 
      className="fixed z-[9999] shadow-2xl"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxWidth: '420px'
      }}
    >
      <Card className={`border-4 ${config.borderColor} bg-white`}>
        <CardHeader className="pb-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Análisis de Botilito</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3 pt-3">
            {/* Status Badge */}
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${analysisResult.status === 'alert' ? 'bg-red-700' : config.color} ${analysisResult.status === 'alert' ? '' : 'bg-opacity-20'} border-2 ${config.borderColor}`}>
              <div className={`${analysisResult.status === 'alert' ? 'bg-red-900' : config.color} p-1.5 rounded text-white`}>
                {config.icon}
              </div>
              <div>
                <p className={`font-medium text-sm ${analysisResult.status === 'alert' ? 'text-white' : ''}`}>{analysisResult.title}</p>
                <Badge variant="outline" className={`text-xs mt-1 ${analysisResult.status === 'alert' ? 'text-white border-white' : ''}`}>
                  Caso: {analysisResult.caseNumber}
                </Badge>
              </div>
            </div>

            {/* Marcadores Detectados */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Marcadores detectados:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {analysisResult.markers.map((marker, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className="text-xs"
                  >
                    {marker.type}
                    <span className="ml-1 opacity-70">
                      {(marker.confidence * 100).toFixed(0)}%
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div className="p-3 bg-secondary/20 rounded-lg border border-secondary/40">
              <p className="text-sm leading-relaxed">
                {analysisResult.summary}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs"
                onClick={() => window.open('https://botilito.app/analysis', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver detalles
              </Button>
              <Button 
                size="sm"
                className="flex-1 text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                Reportar
              </Button>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Análisis por <span className="text-primary font-medium">Botilito</span> • Digital-IA
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}