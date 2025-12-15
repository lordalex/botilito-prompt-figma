import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  AlertTriangle, XCircle, Hash, FileText, Flame, Ban, Skull, Target, 
  Stethoscope, Bot, Crosshair, Share2, Facebook, Twitter, Linkedin, 
  MessageCircle, Calendar, FileType, CheckCircle, Smile, Image as ImageIcon, 
  HelpCircle, Eye, User, ClipboardCheck, SearchCheck, Gavel, Clock, Globe
} from 'lucide-react';
import type { FullAnalysisResponse } from '../types/botilito';
import { useAuth } from '../providers/AuthProvider';
import { api } from '../../lib/apiService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AnalysisResultDisplayProps {
  response: FullAnalysisResponse;
}

// Mapeo de colores y íconos para los marcadores de diagnóstico
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

export function AnalysisResultDisplay({ response }: AnalysisResultDisplayProps) {
    const { id, user_id, created_at, title, metadata, case_study } = response;
    const [authorName, setAuthorName] = useState('Cargando...');
    const { session } = useAuth();

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                if (user_id) {
                    const profile = await api.profile.get(session, user_id);
                    setAuthorName(profile.nombre_completo || profile.email || 'Desconocido');
                } else {
                    setAuthorName('Botilito IA');
                }
            } catch (error) {
                console.error("Error fetching author profile:", error);
                setAuthorName('Desconocido');
            }
        };

        fetchAuthor();
    }, [user_id, session]);

    const primaryDiagnosis = metadata?.comprehensive_judgement?.final_verdict || 'Indeterminado';
    
    const markersDetected = metadata?.classification_labels ? 
        Object.entries(metadata.classification_labels).map(([type, justification]) => ({
            type,
            justification: justification as string,
        })) : [];

    const handleShare = (platform: string) => {
        const text = `Diagnóstico Desinfodémico - Caso ${id}: ${primaryDiagnosis} detectado por Botilito`;
        const url = window.location.href;
        switch(platform) {
            case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'); break;
            case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
            case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
            case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'); break;
        }
    };

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
                            <Badge className="bg-primary text-primary-foreground"><Bot className="h-3 w-3 mr-1" /> IA</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-muted/30 rounded-lg">
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
                                    <div className="capitalize">{metadata?.submissionType || 'No especificado'}</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <User className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Analizado por</div>
                                    <div>{authorName}</div>
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
                                <CardDescription>{primaryDiagnosis}</CardDescription>
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
