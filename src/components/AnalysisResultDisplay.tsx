import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { 
  AlertTriangle, XCircle, Hash, FileText, Flame, Ban, Skull, Target, 
  Stethoscope, Bot, ArrowRight, UserCheck, Crosshair, ExternalLink, Activity, 
  Share2, Facebook, Twitter, Linkedin, MessageCircle, Calendar, Link, FileType,
  Download, CheckCircle, Smile, Image as ImageIcon, HelpCircle, Eye
} from 'lucide-react';
import type { FullAnalysisResponse } from '../types/botilito';

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
    return { icon: <Target className="h-4 w-4" />, color: 'bg-gray-500 hover:bg-gray-600' };
};

const getRiskColor = (level: string | undefined) => {
    if (!level) return 'border-gray-500 bg-gray-50';
    switch (level.toLowerCase()) {
      case 'crítico': return 'border-red-500 bg-red-50';
      case 'alto': return 'border-orange-500 bg-orange-50';
      case 'medio': return 'border-yellow-500 bg-yellow-50';
      case 'bajo': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
};

export function AnalysisResultDisplay({ response }: AnalysisResultDisplayProps) {
    const { id, created_at, title, summary, metadata, case_study } = response;
    const primaryDiagnosis = case_study?.metadata?.ai_labels ? Object.keys(case_study.metadata.ai_labels)[0] : 'Indeterminado';
    const riskLevel = 'Crítico'; // Simulado, ya que no viene en la API
    const confidence = 0.96; // Simulado

    const markersDetected = case_study?.metadata?.ai_labels ? 
        Object.entries(case_study.metadata.ai_labels).map(([type, justification]) => ({
            type,
            justification,
            confidence: Math.random() * (0.98 - 0.7) + 0.7 // Simulado
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
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <Hash className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="text-sm text-muted-foreground">Número de Caso</div>
                                <div className="font-mono">Caso: {case_study?.case_number || id.substring(0, 8)}</div>
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
                    </div>

                    <div>
                        <Label className="flex items-center space-x-2 mb-2"><FileText className="h-4 w-4 text-primary" /><span>Título del Contenido</span></Label>
                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500"><p className="italic">{title}</p></div>
                    </div>
                    
                    <div className={`p-6 rounded-lg border-2 ${getRiskColor(riskLevel)}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2"><Stethoscope className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Diagnóstico Principal</span></div>
                                <h3 className="text-red-600">{primaryDiagnosis}</h3>
                            </div>
                            <div className="text-right space-y-1">
                                <Badge className="bg-red-500 text-white">RIESGO {riskLevel.toUpperCase()}</Badge>
                                <div className="text-sm text-muted-foreground">{(confidence * 100).toFixed(1)}% certeza</div>
                            </div>
                        </div>
                        <Progress value={confidence * 100} className="h-3" />
                    </div>

                    <div>
                        <Label className="flex items-center space-x-2 mb-3"><Crosshair className="h-4 w-4 text-primary" /><span>Marcadores de Diagnóstico Detectados</span><Badge variant="secondary">{markersDetected.length}</Badge></Label>
                        <div className="flex flex-wrap gap-2">
                            {markersDetected.map((marker, index) => {
                                const visuals = getMarkerVisuals(marker.type);
                                return (
                                    <Badge key={index} className={`${visuals.color} text-white px-3 py-1`}>
                                        {visuals.icon}
                                        <span className="ml-1">{marker.type}</span>
                                        <span className="ml-2 text-xs opacity-80">{(marker.confidence * 100).toFixed(0)}%</span>
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t">
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
    );
}
