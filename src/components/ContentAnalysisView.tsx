import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { analysisPipeline } from '../lib/analysisPipeline';
import { 
  AlertTriangle, XCircle, Hash, FileText, Flame, Ban, Skull, Target, 
  Stethoscope, Bot, Share2, Facebook, Twitter, Linkedin, 
  MessageCircle, Calendar, FileType, CheckCircle, Smile, Image as ImageIcon, 
  HelpCircle, Eye, User, ClipboardCheck, SearchCheck, Gavel, Clock, Globe, RefreshCw, Crosshair
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ContentAnalysisViewProps {
  contentToAnalyze: string;
  analysisResult?: {result: any, user_id: string} | null;
  onAnalyzeAnother: () => void;
}

const getMarkerVisuals = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('falso')) return { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500 hover:bg-red-600' };
    if (lowerType.includes('odio') || lowerType.includes('xenofobia')) return { icon: <Skull className="h-4 w-4" />, color: 'bg-red-700 hover:bg-red-800' };
    if (lowerType.includes('violencia')) return { icon: <Ban className="h-4 w-4" />, color: 'bg-red-900 hover:bg-red-950' };
    if (lowerType.includes('sensacionalista')) return { icon: <Flame className="h-4 w-4" />, color: 'bg-orange-400 hover:bg-orange-500' };
    if (lowerType.includes('engañoso')) return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-orange-500 hover:bg-orange-600' };
    if (lowerType.includes('manipulado')) return { icon: <ImageIcon className="h-4 w-4" />, color: 'bg-purple-500 hover:bg-purple-600' };
    if (lowerType.includes('contexto')) return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-amber-500 hover:bg-amber-600' };
    if (lowerType.includes('satírico')) return { icon: <Smile className="h-4 w-4" />, color: 'bg-blue-500 hover:bg-blue-600' };
    if (lowerType.includes('conspirativa')) return { icon: <Eye className="h-4 w-4" />, color: 'bg-violet-600 hover:bg-violet-700' };
    if (lowerType.includes('verificable')) return { icon: <HelpCircle className="h-4 w-4" />, color: 'bg-gray-500 hover:bg-gray-600' };
    if (lowerType.includes('verdadero')) return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-500 hover:bg-emerald-600' };
    if (lowerType.includes('en revisión')) return { icon: <Clock className="h-4 w-4" />, color: 'bg-sky-500 hover:bg-sky-600' };
    return { icon: <Target className="h-4 w-4" />, color: 'bg-gray-500 hover:bg-gray-600' };
};

export function ContentAnalysisView({ contentToAnalyze, analysisResult: initialAnalysisResult = null, onAnalyzeAnother }: ContentAnalysisViewProps) {
  const [analysisResult, setAnalysisResult] = useState<{result: any, user_id: string} | null>(initialAnalysisResult);
  const [isLoading, setIsLoading] = useState<boolean>(!initialAnalysisResult);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ step: string; status: string }>({ step: '', status: '' });

  useEffect(() => {
    if (initialAnalysisResult) {
      return;
    }
    const performAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analysisPipeline(contentToAnalyze, (progressUpdate) => {
          setProgress(progressUpdate);
        });
        setAnalysisResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [contentToAnalyze, initialAnalysisResult]);

  const handleShare = (platform: string) => {
    if (!analysisResult) return;
    const text = `Diagnóstico Desinfodémico - Caso ${analysisResult.result.case_study?.case_id || 'N/A'}: ${analysisResult.result.metadata?.comprehensive_judgement?.final_verdict || 'Análisis de Botilito'}`;
    const url = window.location.href;
    
    switch(platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
      case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'); break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="flex items-center justify-center space-x-3 text-xl font-semibold">
            <Bot className="h-8 w-8 text-primary animate-pulse" />
            <span>Análisis IA en progreso...</span>
          </h1>
          <p className="text-muted-foreground">
            Botilito está trabajando. Por favor espera.
          </p>
        </div>
        <Card>
          <CardHeader><CardTitle>Estado del Análisis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Etapa: {progress.step}</Label></div>
            <div><Label>Estado: {progress.status}</Label></div>
            <Progress value={50} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={onAnalyzeAnother} className="mt-4">Analizar otro contenido</Button>
      </Alert>
    );
  }

  if (!analysisResult) {
    return (
      <Alert>
        <AlertDescription>No se encontraron resultados del análisis.</AlertDescription>
        <Button onClick={onAnalyzeAnother} className="mt-4">Analizar otro contenido</Button>
      </Alert>
    );
  }

  const { result: data, user_id } = analysisResult;
  const { id, created_at, title, metadata, case_study } = data;

  const markersDetected = metadata?.classification_labels ? 
    Object.entries(metadata.classification_labels).map(([type, justification]) => ({
        type,
        justification: justification as string,
    })) : [];

  return (
    <TooltipProvider>
        <div className="space-y-6">
            <Card className="border-2 border-primary shadow-lg">
                <CardHeader className="bg-primary/10 border-b border-primary/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Stethoscope className="h-6 w-6 text-primary" />
                            <span>Diagnóstico Desinfodémico de Botilito</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button onClick={onAnalyzeAnother} variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Analizar otro contenido
                            </Button>
                            <Badge className="bg-primary text-primary-foreground"><Bot className="h-3 w-3 mr-1" /> IA</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* TODO: Screenshot URL should come from analysis pipeline */}
                    <ImageWithFallback
                        src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwd2Vic2l0ZSUyMHNjcmVlbnNob3R8ZW58MXx8fHwxNzU5MTgzOTcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Vista previa del sitio web analizado"
                        className="w-full h-auto object-cover rounded border-2"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <Hash className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Número de Caso</div>
                                <div className="font-mono">{case_study?.case_id || id}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Calendar className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Fecha de Análisis</div>
                                <div>{new Date(created_at).toLocaleString('es-CO')}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <FileType className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Tipo de Contenido</div>
                                <div className="capitalize">{metadata?.submissionType || (contentToAnalyze.startsWith('http') ? 'Enlace Web' : 'Texto')}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Tema</div>
                                <div className="capitalize">{metadata?.theme || 'No especificado'}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Globe className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Región</div>
                                <div className="capitalize">{metadata?.region || 'No especificado'}</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <User className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Analizado por</div>
                                <div>{user_id ? 'Usuario' : 'Botilito IA'}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="flex items-center space-x-2 mb-2"><FileText className="h-4 w-4 text-primary" /><span>Título del Contenido</span></Label>
                        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary"><p className="italic">{title}</p></div>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-lg">
                                <Gavel className="h-5 w-5 text-primary" />
                                <span>Veredicto Final</span>
                            </CardTitle>
                            <CardDescription>{metadata?.comprehensive_judgement?.final_verdict || 'Indeterminado'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold">Recomendación</h4>
                                <p className="text-sm text-muted-foreground">{metadata?.comprehensive_judgement?.recommendation}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Razonamiento</h4>
                                <p className="text-sm text-muted-foreground">{metadata?.comprehensive_judgement?.reasoning}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <Label className="flex items-center space-x-2 mb-3"><Crosshair className="h-4 w-4 text-primary" /><span>Marcadores Detectados</span><Badge variant="secondary">{markersDetected.length}</Badge></Label>
                        <div className="flex flex-wrap gap-3">
                            {markersDetected.map((marker, index) => {
                                const visuals = getMarkerVisuals(marker.type);
                                return (
                                    <Tooltip key={index}>
                                        <TooltipTrigger>
                                            <Badge className={`${visuals.color} text-white px-3 py-1 text-sm`}>
                                                {visuals.icon}
                                                <span className="ml-1.5">{marker.type}</span>
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>{marker.justification}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                    <span>Verificación de Hechos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Verificado en:</span>
                                    <span>{metadata?.fact_check_analysis?.verified_at ? new Date(metadata.fact_check_analysis.verified_at).toLocaleString('es-CO') : 'N/A'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Texto Original Verificado:</span>
                                    <p className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">{metadata?.fact_check_analysis?.original_text}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <SearchCheck className="h-5 w-5 text-primary" />
                                    <span>Evaluación de Búsqueda Web</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Veredicto:</span>
                                    <Badge variant={metadata?.web_search_evaluation?.credibility_score > 0 ? 'default' : 'destructive'}>
                                        {metadata?.web_search_evaluation?.verdict}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Puntaje de Credibilidad:</span>
                                    <span className="font-bold">{metadata?.web_search_evaluation?.credibility_score || 0}/100</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="pt-6 border-t">
                        <Label className="flex items-center space-x-2 mb-3"><Share2 className="h-4 w-4 text-primary" /><span>Compartir Diagnóstico</span></Label>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleShare('twitter')} className="flex items-center space-x-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"><Twitter className="h-4 w-4" /><span>Twitter</span></button>
                            <button onClick={() => handleShare('facebook')} className="flex items-center space-x-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"><Facebook className="h-4 w-4" /><span>Facebook</span></button>
                            <button onClick={() => handleShare('linkedin')} className="flex items-center space-x-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity"><Linkedin className="h-4 w-4" /><span>LinkedIn</span></button>
                            <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity"><MessageCircle className="h-4 w-4" /><span>WhatsApp</span></button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </TooltipProvider>
  );
}