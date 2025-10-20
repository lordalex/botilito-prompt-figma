import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smile,
  Image,
  Heart,
  Shield,
  Target,
  Flame,
  Users,
  Vote,
  DollarSign,
  Zap,
  Eye,
  Ban,
  Skull,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  MapPin,
  Bot,
  Microscope,
  AlertCircle,
  HelpCircle,
  GitBranch,
  Radio,
  Globe,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Definición de las 20 categorías de etiquetas con enfoque epidemiológico
const ETIQUETAS_CATEGORIAS = [
  { id: 'verdadero', label: 'Verdadero', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', virulencia: 0 },
  { id: 'falso', label: 'Falso', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', virulencia: 90 },
  { id: 'enganoso', label: 'Engañoso', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 75 },
  { id: 'satirico', label: 'Satírico', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', virulencia: 20 },
  { id: 'manipulado', label: 'Manipulado', icon: Image, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', virulencia: 85 },
  { id: 'discurso_odio', label: 'Discurso de Odio', icon: Skull, color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', virulencia: 95 },
  { id: 'propaganda', label: 'Propaganda', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', virulencia: 70 },
  { id: 'spam', label: 'Spam', icon: Ban, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 30 },
  { id: 'conspiracion', label: 'Conspiración', icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', virulencia: 80 },
  { id: 'sesgo_politico', label: 'Sesgo Político', icon: Vote, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', virulencia: 65 },
  { id: 'estafa', label: 'Estafa', icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', virulencia: 88 },
  { id: 'sensacionalista', label: 'Sensacionalista', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 55 },
  { id: 'descontextualizado', label: 'Descontextualizado', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', virulencia: 60 },
  { id: 'parcialmente_cierto', label: 'Parcialmente Cierto', icon: HelpCircle, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', virulencia: 35 },
  { id: 'contenido_patrocinado', label: 'Contenido Patrocinado', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', virulencia: 25 },
  { id: 'opinion', label: 'Opinión', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', virulencia: 15 },
  { id: 'rumor', label: 'Rumor', icon: Radio, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', virulencia: 50 },
  { id: 'deepfake', label: 'Deepfake', icon: Bot, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 92 },
  { id: 'sin_verificar', label: 'Sin Verificar', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 40 }
];

interface AIAnalysisViewProps {
  contentId?: string;
}

export function AIAnalysisView({ contentId = "caso_001" }: AIAnalysisViewProps) {
  const [etiquetasDetectadas, setEtiquetasDetectadas] = useState([
    { categoria: 'enganoso', confianza: 0.89, activa: true },
    { categoria: 'sensacionalista', confianza: 0.73, activa: true },
    { categoria: 'sesgo_politico', confianza: 0.65, activa: false }
  ]);

  const [metricsEpidemicas, setMetricsEpidemicas] = useState({
    r0: 2.4,
    infectividad: 0.78,
    virulencia: 0.75,
    velocidadTransmision: 1.8,
    tiempoIncubacion: 3.2
  });

  const toggleEtiqueta = (categoriaId: string) => {
    setEtiquetasDetectadas(prev => 
      prev.map(etiqueta => 
        etiqueta.categoria === categoriaId 
          ? { ...etiqueta, activa: !etiqueta.activa }
          : etiqueta
      )
    );
  };

  const agregarEtiqueta = (categoriaId: string) => {
    const categoria = ETIQUETAS_CATEGORIAS.find(c => c.id === categoriaId);
    if (!categoria) return;

    const etiquetaExistente = etiquetasDetectadas.find(e => e.categoria === categoriaId);
    if (etiquetaExistente) return;

    setEtiquetasDetectadas(prev => [...prev, {
      categoria: categoriaId,
      confianza: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
      activa: true
    }]);
  };

  const eliminarEtiqueta = (categoriaId: string) => {
    setEtiquetasDetectadas(prev => prev.filter(e => e.categoria !== categoriaId));
  };

  const getCategoria = (categoriaId: string) => {
    return ETIQUETAS_CATEGORIAS.find(c => c.id === categoriaId);
  };

  const calcularRiesgoEpidemico = () => {
    const etiquetasActivas = etiquetasDetectadas.filter(e => e.activa);
    if (etiquetasActivas.length === 0) return { nivel: 'Bajo', color: 'text-green-600', porcentaje: 10 };

    const promedioPonderado = etiquetasActivas.reduce((acc, etiqueta) => {
      const categoria = getCategoria(etiqueta.categoria);
      return acc + (categoria?.virulencia || 0) * etiqueta.confianza;
    }, 0) / etiquetasActivas.length;

    if (promedioPonderado >= 80) return { nivel: 'Crítico', color: 'text-red-600', porcentaje: promedioPonderado };
    if (promedioPonderado >= 60) return { nivel: 'Alto', color: 'text-orange-600', porcentaje: promedioPonderado };
    if (promedioPonderado >= 40) return { nivel: 'Moderado', color: 'text-yellow-600', porcentaje: promedioPonderado };
    return { nivel: 'Bajo', color: 'text-green-600', porcentaje: promedioPonderado };
  };

  const riesgoEpidemico = calcularRiesgoEpidemico();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header del análisis */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center space-x-2">
              <Microscope className="h-6 w-6 text-primary" />
              <span>Análisis Epidemiológico de IA</span>
            </h1>
            <p className="text-muted-foreground">
              Clasificación automática de patógenos informativos - {contentId}
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary">
            <Bot className="h-3 w-3 mr-1" />
            IA Activa
          </Badge>
        </div>

        {/* Alert de riesgo epidémico */}
        <Alert className={`border-l-4 ${riesgoEpidemico.nivel === 'Crítico' ? 'border-l-red-500 bg-red-50' : 
          riesgoEpidemico.nivel === 'Alto' ? 'border-l-orange-500 bg-orange-50' :
          riesgoEpidemico.nivel === 'Moderado' ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-green-500 bg-green-50'}`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${riesgoEpidemico.color}`}>
                Nivel de Riesgo Epidémico: {riesgoEpidemico.nivel}
              </span>
              <span className={`text-sm ${riesgoEpidemico.color}`}>
                {riesgoEpidemico.porcentaje.toFixed(1)}% de virulencia
              </span>
            </div>
            <Progress value={riesgoEpidemico.porcentaje} className="h-2" />
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal de etiquetas detectadas */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Patógenos Detectados</span>
                  <Badge variant="secondary">{etiquetasDetectadas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {etiquetasDetectadas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No se detectaron patógenos informativos</p>
                  </div>
                ) : (
                  etiquetasDetectadas.map((etiqueta) => {
                    const categoria = getCategoria(etiqueta.categoria);
                    if (!categoria) return null;

                    const IconComponent = categoria.icon;
                    
                    return (
                      <div key={etiqueta.categoria} 
                           className={`p-4 rounded-lg border-2 transition-all ${
                             etiqueta.activa ? `${categoria.bg} ${categoria.border}` : 'bg-gray-50 border-gray-200 opacity-50'
                           }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <IconComponent className={`h-5 w-5 ${etiqueta.activa ? categoria.color : 'text-gray-400'}`} />
                            <div>
                              <h3 className={`font-medium ${etiqueta.activa ? 'text-foreground' : 'text-gray-400'}`}>
                                {categoria.label}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>Confianza: {(etiqueta.confianza * 100).toFixed(1)}%</span>
                                <span>•</span>
                                <span>Virulencia: {categoria.virulencia}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEtiqueta(etiqueta.categoria)}
                                  className={etiqueta.activa ? 'text-primary hover:bg-primary/10' : 'text-gray-400'}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {etiqueta.activa ? 'Desactivar etiqueta' : 'Activar etiqueta'}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => eliminarEtiqueta(etiqueta.categoria)}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Eliminar etiqueta
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={etiqueta.confianza * 100} 
                            className={`h-2 ${etiqueta.activa ? '' : 'opacity-50'}`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Banco de etiquetas disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Banco de Patógenos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {ETIQUETAS_CATEGORIAS.map((categoria) => {
                    const yaDetectada = etiquetasDetectadas.some(e => e.categoria === categoria.id);
                    const IconComponent = categoria.icon;
                    
                    return (
                      <Tooltip key={categoria.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => agregarEtiqueta(categoria.id)}
                            disabled={yaDetectada}
                            className={`flex items-center space-x-2 h-auto py-2 px-3 ${
                              yaDetectada ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10'
                            }`}
                          >
                            <IconComponent className={`h-4 w-4 ${categoria.color}`} />
                            <span className="text-xs">{categoria.label}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{categoria.label}</p>
                            <p>Virulencia: {categoria.virulencia}%</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral de métricas epidémicas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Métricas Epidémicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">R₀ (Reproducción)</span>
                    </div>
                    <Badge variant={metricsEpidemicas.r0 > 2 ? "destructive" : "secondary"}>
                      {metricsEpidemicas.r0}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Infectividad</span>
                    </div>
                    <Badge variant="outline">
                      {(metricsEpidemicas.infectividad * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Skull className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Virulencia</span>
                    </div>
                    <Badge variant="outline">
                      {(metricsEpidemicas.virulencia * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Vel. Transmisión</span>
                    </div>
                    <Badge variant="outline">
                      {metricsEpidemicas.velocidadTransmision} h⁻¹
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">T. Incubación</span>
                    </div>
                    <Badge variant="outline">
                      {metricsEpidemicas.tiempoIncubacion} h
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Propagación Regional</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Región Andina</span>
                    <Badge variant="destructive" className="text-xs">Alto</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Región Caribe</span>
                    <Badge variant="outline" className="text-xs">Moderado</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Región Pacífica</span>
                    <Badge variant="outline" className="text-xs">Bajo</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Región Orinoquía</span>
                    <Badge variant="outline" className="text-xs">Bajo</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Región Amazonia</span>
                    <Badge variant="secondary" className="text-xs">Contenido</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Región Insular</span>
                    <Badge variant="secondary" className="text-xs">Contenido</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <Shield className="h-4 w-4 mr-2" />
                Aplicar Análisis
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Bot className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}