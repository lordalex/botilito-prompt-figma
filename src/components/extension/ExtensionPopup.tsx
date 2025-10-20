import React, { useState } from 'react';
import botilitoLogo from 'figma:asset/8604399dafdf4284ef499af970e8af43ff13e21b.png';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { 
  Shield, Send, ExternalLink, Clock, CheckCircle, 
  XCircle, AlertTriangle, Bot, Zap
} from 'lucide-react';

export function ExtensionPopup() {
  const [contentToAnalyze, setContentToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);

  const analyzeCurrentPage = () => {
    setIsAnalyzing(true);
    // Simular análisis rápido
    setTimeout(() => {
      setQuickResult({
        status: 'warning',
        markers: ['Sensacionalista', 'Manipulado'],
        confidence: 0.75,
        message: 'Este contenido presenta señales de desinformación'
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const analyzeSelection = () => {
    if (!contentToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setQuickResult({
        status: 'alert',
        markers: ['Falso', 'Conspiración'],
        confidence: 0.89,
        message: 'Alto riesgo de desinformación detectado'
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'safe': 'bg-green-500',
      'warning': 'bg-orange-500',
      'alert': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'safe': <CheckCircle className="h-5 w-5" />,
      'warning': <AlertTriangle className="h-5 w-5" />,
      'alert': <XCircle className="h-5 w-5" />
    };
    return icons[status] || <Shield className="h-5 w-5" />;
  };

  return (
    <div className="w-[380px] h-[600px] bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-[rgb(255,255,255)] p-4 border border-gray-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={botilitoLogo} alt="Botilito" className="h-10 object-contain" />
          </div>
          <Badge variant="secondary" className="text-xs">v1.0</Badge>
        </div>
        <p className="text-xs text-black mt-1">
          Detector de Desinformación
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Análisis Rápido de Página */}
        <Card className="border-2 border-primary/40">
          <CardHeader className="pb-[0px] pt-[17px] px-4 pr-[16px] pl-[16px]">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Análisis Rápido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-[0px] pr-[24px] pb-[20px] pl-[24px] mt-[-14px] mr-[0px] mb-[1px] ml-[0px]">
            <Button 
              onClick={analyzeCurrentPage}
              disabled={isAnalyzing}
              className="w-full px-[10px] py-[0px]"
              size="sm"
            >
              {isAnalyzing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analizando...' : 'Analizar esta página'}
            </Button>

            {quickResult && (
              <div className={`p-2 rounded-lg border-2 ${getStatusColor(quickResult.status)} bg-opacity-10`}>
                <div className="flex items-start space-x-2 mb-1.5">
                  <div className={`${getStatusColor(quickResult.status)} p-1 rounded text-white`}>
                    {getStatusIcon(quickResult.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-1">{quickResult.message}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {quickResult.markers.map((marker: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {marker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-1.5 text-xs"
                  onClick={() => window.open('https://botilito.app/analysis', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver análisis completo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analizar Texto Seleccionado */}
        <Card className="border-2 border-secondary/40">
          <CardHeader className="pb-[0px] pt-[20px] px-4 pr-[0px] pl-[16px]">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Bot className="h-4 w-4 text-primary" />
              <span>Analizar Contenido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-[0px] pr-[24px] pb-[20px] pl-[24px]">
            <Textarea
              placeholder="Pega aquí el texto que quieres verificar..."
              value={contentToAnalyze}
              onChange={(e) => setContentToAnalyze(e.target.value)}
              rows={2}
              className="resize-none text-sm border border-gray-300 mt-[-15px] mr-[0px] mb-[9px] ml-[0px]"
            />
            <Button 
              onClick={analyzeSelection}
              disabled={!contentToAnalyze.trim() || isAnalyzing}
              className="w-full"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar a Botilito
            </Button>
          </CardContent>
        </Card>

        {/* Estadísticas Rápidas */}
        <Card className="border border-secondary/40">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Casos analizados hoy */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="h-4 w-4 text-blue-600 mr-1" />
                  <p className="text-2xl text-blue-700">47</p>
                </div>
                <p className="text-xs text-blue-600">Casos analizados hoy</p>
              </div>
              
              {/* Precisión */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center transition-all hover:shadow-md">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <p className="text-2xl text-green-700">92%</p>
                </div>
                <p className="text-xs text-green-600">Precisión</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open('https://botilito.app', '_blank')}
          >
            Abrir aplicación completa
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}