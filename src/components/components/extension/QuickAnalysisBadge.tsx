import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

interface QuickAnalysisBadgeProps {
  status: 'safe' | 'warning' | 'alert';
  position?: { x: number; y: number };
  compact?: boolean;
}

export function QuickAnalysisBadge({ 
  status, 
  position = { x: 0, y: 0 },
  compact = false 
}: QuickAnalysisBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    safe: {
      color: 'bg-green-500',
      text: 'Verificado',
      icon: <CheckCircle className="h-4 w-4" />,
      message: 'Este contenido ha sido verificado'
    },
    warning: {
      color: 'bg-orange-500',
      text: '⚠️ Precaución',
      icon: <AlertTriangle className="h-4 w-4" />,
      message: 'Este contenido presenta señales sospechosas'
    },
    alert: {
      color: 'bg-red-500',
      text: '⛔ No Verificado',
      icon: <XCircle className="h-4 w-4" />,
      message: 'Alto riesgo de desinformación detectado'
    }
  };

  const config = statusConfig[status];

  if (compact) {
    return (
      <div 
        className="fixed z-[9999]"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      >
        <Badge 
          className={`${config.color} text-white cursor-pointer shadow-lg hover:scale-105 transition-transform`}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Shield className="h-3 w-3 mr-1" />
          {config.text}
        </Badge>

        {showDetails && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black rounded-lg shadow-xl p-3 space-y-2">
            <div className="flex items-start space-x-2">
              <div className={`${config.color} p-1.5 rounded text-white`}>
                {config.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm mb-2">{config.message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => window.open('https://botilito.app/analysis', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver análisis completo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="fixed z-[9999] bg-white border-4 border-primary rounded-lg shadow-2xl p-4"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxWidth: '320px'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className={`${config.color} p-2 rounded-lg text-white`}>
          <Shield className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${config.color} text-white`}>
              {config.text}
            </Badge>
          </div>
          <p className="text-sm mb-3">{config.message}</p>
          <Button 
            size="sm"
            className="w-full text-xs"
            onClick={() => window.open('https://botilito.app/analysis', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver más detalles
          </Button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Verificado por <span className="text-primary font-medium">Botilito</span>
        </p>
      </div>
    </div>
  );
}
