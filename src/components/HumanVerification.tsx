import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { useVerificationData } from '../utils/humanVerification/useVerificationData';
import { submitHumanVerification, fetchCaseDetails } from '../utils/humanVerification/api';
import type { CaseEnriched } from '../../utils/humanVerification/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Users, CheckCircle, XCircle, AlertTriangle, Bot, 
  FileText, Image, Video, Volume2, 
  MessageSquare, Award, Clock, Send, Smile, Shield,
  Target, Flame, Eye, Ban, Skull,
  Microscope, AlertCircle, HelpCircle,
  Megaphone, Calendar, 
  Filter, Search, Layers, Hash,
  User, Gauge, Link, ExternalLink, ArrowLeft, Link2,
  Newspaper, Tag, Trophy, Sparkles, TrendingUp,
  Gavel, ClipboardCheck, SearchCheck, Globe, Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ImageWithFallback } from './figma/ImageWithFallback';

const ETIQUETAS_CATEGORIAS = [
  { id: 'verdadero', label: 'Verdadero', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', virulencia: 0, descripcion: 'Información verificada y respaldada por fuentes confiables' },
  { id: 'falso', label: 'Falso', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', virulencia: 90, descripcion: 'Información completamente falsa sin sustento verificable' },
  { id: 'enganoso', label: 'Engañoso', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 75, descripcion: 'Mezcla hechos reales con interpretaciones falsas o exageradas' },
  { id: 'satirico', label: 'Satírico/Humorístico', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', virulencia: 20, descripcion: 'Contenido humorístico o satírico que puede confundirse con noticias reales' },
  { id: 'manipulado', label: 'Manipulado', icon: Image, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', virulencia: 85, descripcion: 'Contenido editado o alterado para cambiar su significado original' },
  { id: 'sin_contexto', label: 'Sin contexto', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', virulencia: 60, descripcion: 'Contenido real usado fuera de su contexto temporal o situacional' },
  { id: 'no_verificable', label: 'No verificable', icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 35, descripcion: 'Información que no puede confirmarse con fuentes disponibles' },
  { id: 'teoria_conspirativa', label: 'Teoría conspirativa', icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', virulencia: 80, descripcion: 'Narrativas que sugieren conspiraciones sin evidencia sólida' },
  { id: 'discurso_odio_racismo', label: 'Racismo/Xenofobia', icon: Skull, color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', virulencia: 95, descripcion: 'Contenido que promueve odio contra grupos raciales o étnicos' },
  { id: 'discurso_odio_sexismo', label: 'Sexismo/LGBTQ+fobia', icon: Ban, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 95, descripcion: 'Contenido discriminatorio por género u orientación sexual' },
  { id: 'discurso_odio_clasismo', label: 'Clasismo/Aporofobia', icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación basada en clase social o condición económica' },
  { id: 'discurso_odio_ableismo', label: 'Ableismo', icon: Shield, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación contra personas con discapacidades' },
  { id: 'incitacion_violencia', label: 'Incitación a la violencia', icon: Flame, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-400', virulencia: 98, descripcion: 'Contenido que promueve o incita actos violentos' },
  { id: 'acoso_ciberbullying', label: 'Acoso/Ciberbullying', icon: Target, color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', virulencia: 85, descripcion: 'Ataques sistemáticos contra individuos específicos en línea' },
  { id: 'contenido_prejuicioso', label: 'Contenido prejuicioso', icon: AlertTriangle, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', virulencia: 70, descripcion: 'Presenta sesgos evidentes sin considerar otras perspectivas' },
  { id: 'bot_coordinado', label: 'Bot/Coordinado', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', virulencia: 65, descripcion: 'Contenido generado o amplificado por cuentas automatizadas' },
  { id: 'suplantacion_identidad', label: 'Suplantación de identidad', icon: User, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', virulencia: 88, descripcion: 'Se hace pasar por otra persona, organización o medio legítimo' },
  { id: 'sensacionalista', label: 'Sensacionalista', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 55, descripcion: 'Exagera o dramatiza para generar clics o emociones fuertes' },
  { id: 'en_revision', label: 'En revisión', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 40, descripcion: 'Contenido pendiente de verificación adicional' }
];

const getMarkerVisuals = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('falso')) return { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500 hover:bg-red-600' };
    if (lowerType.includes('odio') || lowerType.includes('xenofobia')) return { icon: <Skull className="h-4 w-4" />, color: 'bg-red-700 hover:bg-red-800' };
    if (lowerType.includes('violencia')) return { icon: <Ban className="h-4 w-4" />, color: 'bg-red-900 hover:bg-red-950' };
    if (lowerType.includes('sensacionalista')) return { icon: <Flame className="h-4 w-4" />, color: 'bg-orange-400 hover:bg-orange-500' };
    if (lowerType.includes('engañoso')) return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-orange-500 hover:bg-orange-600' };
    if (lowerType.includes('manipulado')) return { icon: <Image className="h-4 w-4" />, color: 'bg-purple-500 hover:bg-purple-600' };
    if (lowerType.includes('contexto')) return { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-amber-500 hover:bg-amber-600' };
    if (lowerType.includes('satírico')) return { icon: <Smile className="h-4 w-4" />, color: 'bg-blue-500 hover:bg-blue-600' };
    if (lowerType.includes('conspirativa')) return { icon: <Eye className="h-4 w-4" />, color: 'bg-violet-600 hover:bg-violet-700' };
    if (lowerType.includes('verificable')) return { icon: <HelpCircle className="h-4 w-4" />, color: 'bg-gray-500 hover:bg-gray-600' };
    if (lowerType.includes('verdadero')) return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-500 hover:bg-emerald-600' };
    if (lowerType.includes('en revisión')) return { icon: <Clock className="h-4 w-4" />, color: 'bg-sky-500 hover:bg-sky-600' };
    return { icon: <Target className="h-4 w-4" />, color: 'bg-gray-500 hover:bg-gray-600' };
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta Prioridad</Badge>;
      case 'medium':
        return <Badge variant="default">Prioridad Media</Badge>;
      case 'low':
        return <Badge variant="secondary">Baja Prioridad</Badge>;
      default:
        return <Badge variant="outline">Sin Prioridad</Badge>;
    }
};

export function HumanVerification() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState<CaseEnriched | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [verificationNotes, setVerificationNotes] = useState('');
  const [marcadoresDiagnostico, setMarcadoresDiagnostico] = useState<string[]>([]);
  const [marcadoresJustificaciones, setMarcadoresJustificaciones] = useState<{ [key: string]: string }>({});
  const [marcadoresEnlaces, setMarcadoresEnlaces] = useState<{ [key: string]: string }>({});
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [gamificationData, setGamificationData] = useState({
    pointsEarned: 0,
    currentLevel: '',
    currentLevelBadge: '',
    currentLevelSubtitle: '',
    totalDiagnoses: 0,
    streak: 0,
    newBadge: null as string | null,
    newBadgeIcon: null as string | null,
    newBadgeDescription: null as string | null,
    currentXP: 0,
    nextLevelXP: 0,
    progressToNext: 0
  });

  const { loading, error, summaryData, cases, userStats, refresh } = useVerificationData(page, pageSize);

  useEffect(() => {
    if (selectedContentId === null) {
        refresh();
    }
  }, [selectedContentId]);

  const handleSelectCase = async (caseId: string) => {
    setIsDetailLoading(true);
    setSelectedContentId(caseId);
    try {
        const details = await fetchCaseDetails(caseId);
        setSelectedCaseDetails(details);
    } catch (error) {
        console.error("Error fetching case details:", error);
    } finally {
        setIsDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedContentId(null);
    setSelectedCaseDetails(null);
    setVerificationNotes('');
    setMarcadoresDiagnostico([]);
    setMarcadoresJustificaciones({});
    setMarcadoresEnlaces({});
    refresh();
  };

  const handleVerificationSubmit = async () => {
    if (!selectedContentId || marcadoresDiagnostico.length === 0) return;

    setIsSubmitting(true);
    try {
      const result = await submitHumanVerification(
        selectedContentId,
        marcadoresDiagnostico,
        verificationNotes
      );

      if (!result.success) {
        console.error('Error al enviar verificación:', result.message);
        setIsSubmitting(false);
        return;
      }
      
      // Gamification logic
      const basePoints = 20;
      const markerBonus = marcadoresDiagnostico.length * 5;
      const justificationBonus = Object.keys(marcadoresJustificaciones).filter(k => marcadoresJustificaciones[k].length > 20).length * 10;
      const linkBonus = Object.keys(marcadoresEnlaces).filter(k => marcadoresEnlaces[k]).length * 15;
      const totalPoints = basePoints + markerBonus + justificationBonus + linkBonus;
      
      const levels = [
        { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, badge: '👁️' },
        { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, badge: '🔬' },
        { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, badge: '💉' }
      ];
      
      const currentXP = (userStats?.points || 0) + totalPoints;
      const getCurrentLevel = (xp: number) => {
        return levels.find(level => xp >= level.minXP && xp < level.maxXP) || levels[levels.length - 1];
      };
      
      const currentLevel = getCurrentLevel(currentXP);
      const nextLevel = levels.find(level => level.level === currentLevel.level + 1);
      const progressToNext = nextLevel ? 
        Math.round(((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
        : 100;
      
      const totalDiagnoses = (userStats?.total_verifications || 0) + 1;
      const streak = userStats?.streak || 0;
      
      setGamificationData({
        pointsEarned: totalPoints,
        currentLevel: currentLevel.title,
        currentLevelBadge: currentLevel.badge,
        currentLevelSubtitle: currentLevel.subtitle,
        totalDiagnoses,
        streak,
        newBadge: null,
        newBadgeIcon: null,
        newBadgeDescription: null,
        currentXP,
        nextLevelXP: nextLevel ? nextLevel.minXP : currentLevel.maxXP,
        progressToNext
      });

      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Error al enviar verificación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setTimeout(() => {
      handleBackToList();
    }, 300);
  };

  const toggleMarcadorDiagnostico = (marcadorId: string) => {
    setMarcadoresDiagnostico(prev => {
      if (prev.includes(marcadorId)) {
        const newJustificaciones = { ...marcadoresJustificaciones };
        const newEnlaces = { ...marcadoresEnlaces };
        delete newJustificaciones[marcadorId];
        delete newEnlaces[marcadorId];
        setMarcadoresJustificaciones(newJustificaciones);
        setMarcadoresEnlaces(newEnlaces);
        return prev.filter(m => m !== marcadorId);
      } else {
        return [...prev, marcadorId];
      }
    });
  };

  const updateMarcadorJustificacion = (marcadorId: string, justificacion: string) => {
    setMarcadoresJustificaciones(prev => ({ ...prev, [marcadorId]: justificacion }));
  };

  const updateMarcadorEnlace = (marcadorId: string, enlace: string) => {
    setMarcadoresEnlaces(prev => ({ ...prev, [marcadorId]: enlace }));
  };

  const getMarcador = (marcadorId: string) => ETIQUETAS_CATEGORIAS.find(c => c.id === marcadorId);

  const renderSuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={(open) => { if (!open) return; }}>
      <DialogContent 
        className="max-w-md border-4 border-primary shadow-2xl [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce-subtle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${Math.random() * 20 + 10}px`
                  }}
                >
                  {['🎉', '⭐', '🔬', '💛', '✨', '🏆'][Math.floor(Math.random() * 6)]}
                </div>
              ))}
            </div>
          </div>

          <DialogHeader className="relative z-10">
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative">
                <img 
                  src={botilitoImage} 
                  alt="Botilito" 
                  className="w-32 h-32 object-contain animate-bounce-subtle"
                />
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 animate-pulse-glow">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>

              <DialogTitle className="text-center text-3xl">
                ¡Berraquísimo, parcero! 🎉
              </DialogTitle>
              
              <DialogDescription className="text-center text-lg">
                Tu diagnóstico está más afilado que un bisturí. ¡Sos una chimba contribuyendo a la inmunización digital del país! 💉💛
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 relative z-10">
            <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">¡Ganaste XP!</p>
              </div>
              <p className="text-5xl font-bold text-primary mb-1">+{gamificationData.pointsEarned}</p>
              <p className="text-sm text-muted-foreground">puntos de experiencia</p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{gamificationData.currentLevelBadge}</div>
                  <div>
                    <p className="text-xs text-purple-600 uppercase tracking-wider">Tu rango actual</p>
                    <p className="text-sm">{gamificationData.currentLevel}</p>
                    <p className="text-xs text-muted-foreground">{gamificationData.currentLevelSubtitle}</p>
                  </div>
                </div>
              </div>
              
              {gamificationData.progressToNext < 100 && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{gamificationData.currentXP} XP</span>
                    <span>{gamificationData.nextLevelXP} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${gamificationData.progressToNext}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    {gamificationData.progressToNext}% al siguiente nivel
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/30 rounded-lg p-3 text-center border border-secondary/40">
                <div className="flex items-center justify-center mb-1">
                  <Microscope className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl">{gamificationData.totalDiagnoses}</p>
                <p className="text-xs text-muted-foreground">Diagnósticos</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-xl">{gamificationData.streak}</p>
                <p className="text-xs text-muted-foreground">Días racha</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xl">92%</p>
                <p className="text-xs text-muted-foreground">Precisión</p>
              </div>
            </div>

            {gamificationData.newBadge && (
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-lg p-4 text-center border-2 border-yellow-500 shadow-lg animate-pulse-glow">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Award className="h-6 w-6 text-yellow-800" />
                  <p className="text-yellow-900">¡Insignia Desbloqueada!</p>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="text-2xl">{gamificationData.newBadgeIcon}</span>
                  <p className="text-lg text-yellow-900">{gamificationData.newBadge}</p>
                </div>
                <p className="text-xs text-yellow-800">{gamificationData.newBadgeDescription}</p>
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4 text-center border border-muted">
              <p className="text-sm italic">
                "Cada diagnóstico que haces ayuda a proteger a miles de colombianos de la desinformación. ¡Sigue así, crack!" 💪🇨🇴
              </p>
            </div>

            <Button
              onClick={handleCloseSuccessDialog}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              ¡A darle duro al siguiente caso!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading && !selectedContentId) {
    return <div className="flex justify-center items-center h-96"><Progress /></div>;
  }

  if (error && !cases.length) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  if (selectedContentId) {
    const caseData = selectedCaseDetails;
    const aiMarkers = caseData?.diagnostic_labels || [];
    
    const humanVotes = caseData?.human_votes?.entries || [];
    const humanVotesByClassification = humanVotes.reduce((acc, vote) => {
        const classification = vote.vote;
        if (!acc[classification]) {
            acc[classification] = [];
        }
        acc[classification].push(vote);
        return acc;
    }, {});

    return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-start">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista de casos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-primary" />
              <span>Análisis Especializado del Caso: {selectedContentId}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isDetailLoading || !caseData ? (
                <div className="flex justify-center items-center h-64"><Progress /></div>
            ) : (
            <>
                {/* Content Details */}
                <div className="p-4 bg-secondary/30 border rounded-lg space-y-4">
                    <div className="relative rounded-lg overflow-hidden border-2">
                        <ImageWithFallback
                            src={caseData.metadata?.screenshotUrl}
                            alt="Captura de contenido analizado"
                            className="w-full h-auto object-cover"
                        />
                        {aiMarkers.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <Label className="text-white text-sm font-semibold">Marcadores Detectados por IA</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {aiMarkers.map((marker, index) => {
                                        const visuals = getMarkerVisuals(marker);
                                        return (
                                            <Tooltip key={index}>
                                                <TooltipTrigger>
                                                    <Badge className={`${visuals.color} text-white px-2 py-1 text-xs`}>
                                                        {visuals.icon}
                                                        <span className="ml-1.5">{marker}</span>
                                                    </Badge>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Titular:</Label>
                        <p className="font-medium text-lg">{caseData.title}</p>
                    </div>
                    
                    <div>
                        <Label>Resumen:</Label>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.summary}</p>
                    </div>
                </div>
                
                {caseData.case_judgement && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-lg">
                                <Gavel className="h-5 w-5 text-primary" />
                                <span>Veredicto Final de IA</span>
                            </CardTitle>
                            <CardDescription>{caseData.case_judgement.final_verdict}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold">Recomendación</h4>
                                <p className="text-sm text-muted-foreground">{caseData.case_judgement.recommendation}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Razonamiento</h4>
                                <p className="text-sm text-muted-foreground">{caseData.case_judgement.reasoning}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                <Separator />

                {/* Human Votes Section */}
                {Object.keys(humanVotesByClassification).length > 0 && (
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Diagnósticos de la Comunidad</Label>
                        <Accordion type="single" collapsible className="w-full">
                            {Object.entries(humanVotesByClassification).map(([classification, votes]) => {
                                const stats = caseData.human_votes?.statistics?.find(s => s.label === classification);
                                return (
                                <AccordionItem value={classification} key={classification}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center space-x-2">
                                                <span>{classification}</span>
                                                <Badge variant="secondary">{(votes as any[]).length} votos</Badge>
                                            </div>
                                            {stats && (
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <span>({stats.percentage.toFixed(1)}%)</span>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pl-4">
                                            {(votes as any[]).map((vote, index) => (
                                                <div key={index} className="border-l-2 pl-4 py-2">
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold">{vote.user.nombre_completo || 'Anónimo'}</span>
                                                        <Badge variant="outline">Rep: {vote.user.reputation}</Badge>
                                                        <span className="text-muted-foreground text-xs">{new Date(vote.date).toLocaleString('es-CO')}</span>
                                                    </div>
                                                    {vote.reason && <p className="text-sm italic mt-2">"{vote.reason}"</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )})}
                        </Accordion>
                    </div>
                )}
                
                <Separator />

                {/* Human Diagnosis Form */}
                <div>
                  <Label className="mb-3 flex items-center space-x-2 text-lg font-semibold">
                    <User className="h-5 w-5 text-primary" />
                    <span>Tu Diagnóstico Humano</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona los marcadores que apliquen. Al seleccionar cada uno, puedes justificar tu elección y agregar enlaces de soporte.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ETIQUETAS_CATEGORIAS.map((marcador) => {
                      const Icon = marcador.icon;
                      const isSelected = marcadoresDiagnostico.includes(marcador.id);
                      return (
                        <div key={marcador.id} className={`border-2 rounded-lg transition-all ${isSelected ? `${marcador.border} ${marcador.bg} shadow-md col-span-1 lg:col-span-3` : 'border-gray-200 hover:border-primary/30'}`}>
                          <div className="flex items-start space-x-3 p-4 cursor-pointer" onClick={() => toggleMarcadorDiagnostico(marcador.id)}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleMarcadorDiagnostico(marcador.id)} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Icon className={`h-5 w-5 ${marcador.color}`} />
                                <Label className="cursor-pointer font-medium">{marcador.label}</Label>
                              </div>
                              <p className="text-xs text-muted-foreground">{marcador.descripcion}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="px-4 pb-4 space-y-3 border-t pt-3 mt-2">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1"><MessageSquare className="h-3 w-3" /><span>Justificación:</span></Label>
                                <Textarea placeholder={`Explica por qué este contenido es "${marcador.label}"...`} value={marcadoresJustificaciones[marcador.id] || ''} onChange={(e) => updateMarcadorJustificacion(marcador.id, e.target.value)} className="text-sm" rows={3} />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1"><Link2 className="h-3 w-3" /><span>Enlace de soporte (opcional):</span></Label>
                                <Input type="url" placeholder="https://ejemplo.com/fuente" value={marcadoresEnlaces[marcador.id] || ''} onChange={(e) => updateMarcadorEnlace(marcador.id, e.target.value)} className="text-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="mb-2 flex items-center space-x-2"><MessageSquare className="h-4 w-4 text-primary" /><span>Notas Adicionales</span></Label>
                  <Textarea id="notes" placeholder="Observaciones generales sobre el caso..." value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={4} />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleVerificationSubmit} disabled={isSubmitting || marcadoresDiagnostico.length === 0} size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Procesando...' : 'Enviar diagnóstico'}
                  </Button>
                </div>
            </>
            )}
          </CardContent>
        </Card>
        {renderSuccessDialog()}
      </div>
    </TooltipProvider>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Casos Pendientes de Verificación</CardTitle>
            <CardDescription>Casos que requieren diagnóstico humano especializado.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Case List */}
            <div className="space-y-2">
              {cases.map((content) => (
                <div key={content.id} className="p-4 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => handleSelectCase(content.id)}>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{content.title || 'Contenido sin título'}</div>
                    {getPriorityBadge(content.priority)}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{content.content}</div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>ID: {content.id}</span>
                    <span>Votos: {content.human_votes?.count || 0}</span>
                    <span>Consenso: {content.consensus?.state || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="pt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Página {summaryData?.pagination.page || 1}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!summaryData?.pagination.hasMore}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
