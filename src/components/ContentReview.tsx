import React, { useState, useRef, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Search, Filter, Bot, FileText, Image, Video, Volume2,
  CheckCircle, AlertTriangle, Clock, Eye, Hash, Layers,
  Calendar, User, Shield, XCircle, AlertCircle, ArrowLeft,
  Newspaper, Tag, ExternalLink, Syringe, Target, Activity,
  Users, TrendingUp, Share2, MessageCircle, Zap, Flame,
  Crosshair, Brain, BookOpen, CheckSquare, Plus, Edit, Trash2,
  Download, Twitter, Facebook, Linkedin
} from 'lucide-react';
import { useHistorialData } from '../utils/historial/useHistorialData';
import { fetchCaseDetails } from '../utils/historial/api';

export function ContentReview() {
  // Fetch real data from API
  const { loading: apiLoading, error: apiError, cases: apiCases } = useHistorialData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const casesPerPage = 10;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estado para las vacunas de inmunización
  const [vaccines, setVaccines] = useState<any[]>([
    {
      id: '1',
      title: 'Verificación de Datos sobre Vacunas COVID',
      description: 'Infografía explicando con datos reales y estudios verificados los efectos de las vacunas, desmintiendo el contenido falso.',
      format: 'Infografía',
      platforms: ['Instagram', 'Facebook', 'Twitter'],
      reach: 'Alto',
      engagement: '8.5%',
      status: 'active'
    },
    {
      id: '2',
      title: 'Video Educativo: Cómo Identificar Desinformación Médica',
      description: 'Tutorial corto mostrando señales de alerta en contenido médico falso y cómo verificar información de salud.',
      format: 'Video corto',
      platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      reach: 'Muy Alto',
      engagement: '12.3%',
      status: 'active'
    }
  ]);

  const [newVaccine, setNewVaccine] = useState({
    title: '',
    description: '',
    format: '',
    platforms: [] as string[],
    reach: '',
  });

  const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);

  // Fetch full case details when a case is selected
  useEffect(() => {
    if (!selectedCaseId) {
      setCaseDetails(null);
      return;
    }

    async function loadCaseDetails() {
      try {
        setLoadingDetails(true);
        const details = await fetchCaseDetails(selectedCaseId);
        console.log('📊 Case Details Loaded:', details);
        console.log('📍 Marcadores:', details?.analisis_del_caso?.marcadores);
        console.log('📍 Evaluación:', details?.evaluacion_epidemiologica);
        setCaseDetails(details);
      } catch (error) {
        console.error('❌ Error loading case details:', error);
        setCaseDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadCaseDetails();
  }, [selectedCaseId]);

  // Transform API data to match the component's expected format
  const historialCasos = apiCases.map(apiCase => {
    // Get the markers and their display data
    const markersDetected = apiCase.diagnosticLabels.map(label => ({
      type: label.label,
      confidence: label.percentage / 100
    }));

    const consensusMarkers = apiCase.diagnosticLabels.map(label => label.label.toLowerCase().replace(' ', '_'));
    const consensusPercentages = apiCase.diagnosticLabels.reduce((acc, label) => {
      acc[label.label.toLowerCase().replace(' ', '_')] = label.percentage;
      return acc;
    }, {} as Record<string, number>);

    return {
      id: apiCase.id, // UUID from database
      displayId: apiCase.displayId, // Generated display code (e.g., T-WB-20241015-156)
      type: apiCase.submissionType.toLowerCase(),
      title: apiCase.title,
      content: apiCase.title, // Use title as content
      headline: apiCase.title,
      url: apiCase.url,
      screenshot: null, // No screenshot in API data
      source: {
        name: new URL(apiCase.url).hostname.replace('www.', ''),
        url: apiCase.url
      },
      theme: 'General', // Would need to be in API
      aiAnalysis: {
        veracity: apiCase.finalVerdict,
        confidence: 0.85,
        detectedMarkers: consensusMarkers,
        issues: [],
        summary: `Caso con ${apiCase.humanVotesCount} verificadores. Estado: ${apiCase.verificationMethod}`,
        sources: [apiCase.submissionType],
        markersDetected
      },
      consensusMarkers,
      consensusPercentages,
      status: apiCase.consensusState === 'ai_only' ? 'ai_only' : 'verified',
      submittedBy: 'usuario',
      submittedAt: apiCase.createdAt,
      verifiedAt: apiCase.humanVotesCount > 0 ? apiCase.createdAt : null,
      humanVerifiers: apiCase.humanVotesCount,
      priority: apiCase.priority,
      votesCount: apiCase.humanVotesCount,
    };
  });

  // Marcadores disponibles
  const marcadoresDisponibles = [
    { id: 'verdadero', label: 'Verdadero', icon: CheckCircle },
    { id: 'falso', label: 'Falso', icon: XCircle },
    { id: 'enganoso', label: 'Engañoso', icon: AlertTriangle },
    { id: 'satirico', label: 'Satírico/Humorístico', icon: Bot },
    { id: 'manipulado', label: 'Manipulado', icon: Crosshair },
    { id: 'sin_contexto', label: 'Sin contexto', icon: AlertCircle },
    { id: 'no_verificable', label: 'No verificable', icon: Clock },
    { id: 'teoria_conspirativa', label: 'Teoría conspirativa', icon: Eye },
    { id: 'suplantacion_identidad', label: 'Suplantación de identidad', icon: Shield },
    { id: 'sensacionalista', label: 'Sensacionalista', icon: Flame },
  ];

  const getMarcador = (id: string) => {
    return marcadoresDisponibles.find(m => m.id === id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Volume2;
      default: return FileText;
    }
  };

  const getVeracityBadge = (veracity: string) => {
    const config: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      'Verdadero': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      'Falso': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
      'Engañoso': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
      'Sin contexto': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
      'Satírico/Humorístico': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Bot },
      'Suplantación de identidad': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Shield },
      'Teoría conspirativa': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: Eye },
      'No verificable': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Clock },
    };

    const { bg, text, border, icon: Icon } = config[veracity] || config['No verificable'];

    return (
      <Badge variant="outline" className={`${bg} ${text} ${border}`}>
        <Icon className="h-3 w-3 mr-1" />
        {veracity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verificado por humanos
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Bot className="h-3 w-3 mr-1" />
          Solo análisis IA
        </Badge>
      );
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Alta Prioridad' },
      medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Prioridad Media' },
      low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Prioridad Baja' },
    };

    const { bg, text, border, label } = config[priority] || config['medium'];

    return (
      <Badge variant="outline" className={`${bg} ${text} ${border}`}>
        {label}
      </Badge>
    );
  };

  // Filtrado
  const filteredCasos = historialCasos.filter((caso) => {
    const matchesSearch = 
      caso.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'verified') return matchesSearch && caso.status === 'verified';
    if (selectedFilter === 'ai_only') return matchesSearch && caso.status === 'ai_only';
    if (selectedFilter === 'text') return matchesSearch && caso.type === 'text';
    if (selectedFilter === 'image') return matchesSearch && caso.type === 'image';
    if (selectedFilter === 'video') return matchesSearch && caso.type === 'video';
    if (selectedFilter === 'audio') return matchesSearch && caso.type === 'audio';

    return matchesSearch;
  });

  // Paginación
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCasos.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCasos.length / casesPerPage);

  // Caso seleccionado para ver detalle
  const selectedCase = selectedCaseId ? historialCasos.find(c => c.id === selectedCaseId) : null;

  // Función para dibujar rectángulos redondeados
  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Generar imagen del diagnóstico
  const generateDiagnosticImage = () => {
    if (!selectedCase) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcular altura necesaria
    const baseHeight = 800;
    const markersHeight = (selectedCase.aiAnalysis.markersDetected.length * 85) + 100;
    const totalHeight = baseHeight + markersHeight;
    
    canvas.width = 1200;
    canvas.height = totalHeight;

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Franja superior amarilla con info de Botilito
    ctx.fillStyle = '#ffe97a';
    ctx.fillRect(20, 20, canvas.width - 40, 140);
    ctx.strokeStyle = '#ffda00';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, 140);

    // Logo/Título "BOTILITO"
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 42px Lexend, sans-serif';
    ctx.fillText('BOTILITO', 40, 70);
    
    // Subtítulo
    ctx.font = '22px Lexend, sans-serif';
    ctx.fillText('Diagnóstico Desinfodémico', 40, 105);

    // Número de caso
    ctx.font = 'bold 20px Lexend, sans-serif';
    ctx.fillText(`Caso: ${selectedCase.id}`, 40, 140);

    let yPosition = 200;

    // Título del contenido
    if (selectedCase.headline || selectedCase.title) {
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(40, yPosition, canvas.width - 80, 120);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, yPosition, canvas.width - 80, 120);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 26px Lexend, sans-serif';
      const maxWidth = canvas.width - 120;
      const title = selectedCase.headline || selectedCase.title;
      const words = title.split(' ');
      let line = '';
      let y = yPosition + 40;
      let lineCount = 0;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 60, y);
          line = words[i] + ' ';
          y += 35;
          lineCount++;
          if (lineCount >= 2) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);
      yPosition += 140;
    }

    // Tema
    if (selectedCase.theme) {
      yPosition += 10;
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('TEMA:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(selectedCase.theme, 110, yPosition);
      yPosition += 35;
    }

    // Fuente
    if (selectedCase.source) {
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('FUENTE:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(selectedCase.source.name, 130, yPosition);
      yPosition += 45;
    }

    // Veredicto
    yPosition += 20;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Lexend, sans-serif';
    ctx.fillText('VEREDICTO:', 40, yPosition);
    yPosition += 10;

    const veracityColors: { [key: string]: string } = {
      'Verdadero': '#10b981',
      'Falso': '#ef4444',
      'Engañoso': '#f97316',
      'Sin contexto': '#f59e0b',
      'Satírico/Humorístico': '#3b82f6',
      'Suplantación de identidad': '#a855f7',
      'Teoría conspirativa': '#7c3aed',
      'No verificable': '#6b7280',
    };

    const veracityColor = veracityColors[selectedCase.aiAnalysis.veracity] || '#6b7280';
    ctx.fillStyle = veracityColor;
    drawRoundedRect(ctx, 40, yPosition, canvas.width - 80, 80, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Lexend, sans-serif';
    ctx.fillText(selectedCase.aiAnalysis.veracity.toUpperCase(), 60, yPosition + 50);

    yPosition += 100;

    // Marcadores detectados
    yPosition += 20;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Lexend, sans-serif';
    ctx.fillText('Marcadores de Diagnóstico:', 40, yPosition);
    yPosition += 20;

    const topMarkers = selectedCase.aiAnalysis.markersDetected.slice(0, 5);
    
    topMarkers.forEach((marker: any, index: number) => {
      const markerColors: { [key: string]: string } = {
        'Verdadero': '#10b981',
        'Falso': '#ef4444',
        'Engañoso': '#f97316',
        'Satírico/Humorístico': '#3b82f6',
        'Manipulado': '#a855f7',
        'Sin contexto': '#f59e0b',
        'No verificable': '#6b7280',
        'Teoría conspirativa': '#7c3aed',
        'Suplantación de identidad': '#a855f7',
        'Sensacionalista': '#fb923c',
      };

      const color = markerColors[marker.type] || '#6b7280';
      const confidence = (marker.confidence * 100).toFixed(0);

      yPosition += 15;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      ctx.fillStyle = color;
      const badgeWidth = canvas.width - 80;
      const badgeHeight = 70;
      drawRoundedRect(ctx, 40, yPosition, badgeWidth, badgeHeight, 12);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${index === 0 ? '32' : '26'}px Lexend, sans-serif`;
      ctx.fillText(`${marker.type}`, 60, yPosition + 30);
      
      ctx.font = `${index === 0 ? '24' : '20'}px Lexend, sans-serif`;
      ctx.fillText(`Confianza: ${confidence}%`, 60, yPosition + 58);

      yPosition += 70;
    });

    // Footer
    yPosition += 30;
    
    // Estado de verificación
    if (selectedCase.status === 'verified') {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px Lexend, sans-serif';
      ctx.fillText(`✓ Verificado por ${selectedCase.humanVerifiers} especialistas`, 40, yPosition);
      yPosition += 30;
    }
    
    ctx.fillStyle = '#666666';
    ctx.font = '16px Lexend, sans-serif';
    const reportDate = new Date(selectedCase.submittedAt).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    ctx.fillText(`Reportado: ${reportDate}`, 40, yPosition);
    
    yPosition += 30;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Lexend, sans-serif';
    ctx.fillText('Verificado por Botilito - Análisis desinfodémico con IA', 40, yPosition);
  };

  // Descargar imagen
  const handleDownloadImage = () => {
    if (!selectedCase) return;
    
    generateDiagnosticImage();
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `botilito-caso-${selectedCase.id}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    }, 100);
  };

  // Compartir en redes sociales
  const shareOnTwitter = () => {
    if (!selectedCase) return;
    const topMarker = selectedCase.aiAnalysis.markersDetected[0];
    const markerText = topMarker ? `${topMarker.type} (${(topMarker.confidence * 100).toFixed(0)}%)` : 'contenido analizado';
    const title = selectedCase.headline || selectedCase.title;
    const text = `🔍 Botilito detectó: ${markerText}\n${title ? `\n"${title}"\n` : ''}\nCaso: ${selectedCase.id}\n#Botilito #VerificaciónDeFechos #Desinformación`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!selectedCase) return;
    const topMarker = selectedCase.aiAnalysis.markersDetected[0];
    const markerText = topMarker ? `${topMarker.type} (${(topMarker.confidence * 100).toFixed(0)}%)` : 'contenido analizado';
    const title = selectedCase.headline || selectedCase.title;
    const text = `🔍 *Botilito* detectó: *${markerText}*\n${title ? `\n"${title}"\n` : ''}\nCaso: ${selectedCase.id}\n\nVerificación completa de desinformación con IA`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  // Si hay un caso seleccionado, mostrar vista de detalle
  if (selectedCase) {
    return (
      <div className="space-y-6">
        {/* Mensaje de Botilito */}
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img 
              src={botilitoImage} 
              alt="Botilito" 
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Ey parcero! Acá tienes el diagnóstico completo de este caso 🔬👀
              </p>
              <p className="text-sm mt-1 opacity-80">
                {selectedCase.status === 'verified' 
                  ? 'Este caso ya fue verificado por especialistas humanos. Puedes revisar el análisis y las estrategias de inmunización.' 
                  : 'Este caso solo tiene análisis de IA. Si quieres, puedes enviarlo a verificación humana.'}
              </p>
            </div>
          </div>
        </div>

        {/* Canvas oculto para generar la imagen */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Detalle del caso */}
        <Card>
          <CardHeader>
            {/* Botón de volver */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCaseId(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al historial
              </Button>
            </div>

            {/* Franja unificada con toda la info del caso */}
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-6 py-4 rounded-lg border-2 border-primary/30">
              {/* Código del caso */}
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Código del Caso</p>
                  <p className="font-mono font-medium text-sm">{selectedCase.id}</p>
                  {selectedCase.displayId && (
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {selectedCase.displayId}</p>
                  )}
                </div>
              </div>

              <Separator orientation="vertical" className="h-12" />

              {/* Prioridad */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Prioridad</p>
                {getPriorityBadge(selectedCase.priority)}
              </div>

              <Separator orientation="vertical" className="h-12" />

              {/* Reportado por */}
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reportado por</p>
                  <p className="text-sm font-medium">{selectedCase.submittedBy}</p>
                </div>
              </div>

              <Separator orientation="vertical" className="h-12" />

              {/* Fecha de reporte */}
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de reporte</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedCase.submittedAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contenido del caso */}
            <div>
              <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
                {/* Captura con marcadores */}
                {selectedCase.screenshot && (
                  <div>
                    <Label>Captura del contenido:</Label>
                    <div className="mt-2 rounded-lg overflow-hidden border-2 border-secondary/40 relative max-h-48">
                      <img 
                        src={selectedCase.screenshot} 
                        alt="Captura" 
                        className="w-full h-48 object-cover object-top"
                      />
                      

                    </div>
                  </div>
                )}
                
                {/* Fuente y tema */}
                {(selectedCase.source || selectedCase.theme) && (
                  <div className="flex flex-wrap items-center gap-4 pb-2">
                    {selectedCase.source && (
                      <div className="flex items-center space-x-2">
                        <Newspaper className="h-4 w-4 text-primary" />
                        <Label className="text-sm">Fuente:</Label>
                        <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                          {selectedCase.source.name}
                        </Badge>
                      </div>
                    )}
                    
                    {selectedCase.theme && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <Label className="text-sm">Tema:</Label>
                        <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                          {selectedCase.theme}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Titular */}
                {selectedCase.headline && (
                  <div>
                    <Label>Titular:</Label>
                    <div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                      <p className="font-medium">{selectedCase.headline}</p>
                    </div>
                  </div>
                )}
                
                {/* Contenido */}
                <div>
                  <Label>Contenido analizado:</Label>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {selectedCase.content}
                  </p>
                </div>
              </div>

              {/* Evaluación epidemiológica */}
              {(caseDetails?.evaluacion_epidemiologica || selectedCase.aiAnalysis.summary) && (
                <div className="mt-6">
                  <h4>Evaluación epidemiológica:</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {caseDetails?.evaluacion_epidemiologica || selectedCase.aiAnalysis.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Análisis Unificado: IA + Humano */}
            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <Activity className="h-4 w-4 text-primary" />
                <span>Análisis del Caso</span>
              </Label>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-lg space-y-4">
                {/* Fila de participantes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Análisis IA */}
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Analizado por IA</p>
                        <p className="text-sm font-medium">
                          {caseDetails?.analisis_del_caso?.participantes?.ia || 'Botilito'}
                        </p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-12" />

                    {/* Análisis Humano */}
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Red de Epidemiólogos</p>
                        <p className="text-sm font-medium">
                          {caseDetails?.analisis_del_caso?.participantes?.humanos_conteo
                            ? `${caseDetails.analisis_del_caso.participantes.humanos_conteo} epidemiólogos participaron`
                            : selectedCase.status === 'verified'
                              ? `${selectedCase.humanVerifiers} epidemiólogos participaron`
                              : 'Pendiente verificación humana'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {(caseDetails?.analisis_del_caso?.verificado_el || (selectedCase.status === 'verified' && selectedCase.verifiedAt)) && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Verificado el</p>
                      <p className="text-sm font-medium">
                        {new Date(caseDetails?.analisis_del_caso?.verificado_el || selectedCase.verifiedAt).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Marcadores detectados unificados (IA + Red Humana) */}
                <div>
                  <Label className="text-sm mb-2">Marcadores de diagnóstico detectados:</Label>
                  {loadingDetails ? (
                    <div className="text-sm text-muted-foreground">Cargando marcadores...</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        // Get pre-merged marcadores from case-detail endpoint
                        const marcadores = caseDetails?.analisis_del_caso?.marcadores || [];

                        if (marcadores.length === 0) {
                          // Fallback to summary data if no marcadores available
                          return selectedCase.aiAnalysis.markersDetected.map((m: any, idx: number) => {
                            const marcadorId = m.type.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
                            const marcador = getMarcador(marcadorId);
                            if (!marcador) return null;
                            const Icon = marcador.icon;
                            const confidence = Math.round(m.confidence * 100);

                            return (
                              <span key={idx} className="inline-flex items-center space-x-1 px-2 py-1 rounded-md border bg-white border-gray-200 text-xs">
                                <Icon className="h-3 w-3 text-muted-foreground" />
                                <span>{marcador.label}</span>
                                <span className="font-medium text-muted-foreground">
                                  {confidence}%
                                </span>
                              </span>
                            );
                          });
                        }

                        // Use pre-merged marcadores from case-detail endpoint
                        // marcadores = [{ label: "Falso", confidence: 92 }, ...]
                        return marcadores.map((marker: any, idx: number) => {
                          // Map label name to marcador ID
                          const marcadorId = marker.label.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
                          const marcador = getMarcador(marcadorId);

                          if (!marcador) {
                            // Render unknown marker with default styling
                            return (
                              <span key={idx} className="inline-flex items-center space-x-1 px-2 py-1 rounded-md border bg-white border-gray-200 text-xs">
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                                <span>{marker.label}</span>
                                <span className="font-medium text-muted-foreground">
                                  {marker.confidence}%
                                </span>
                              </span>
                            );
                          }

                          const Icon = marcador.icon;

                          // Color coding based on confidence
                          const getConfidenceColor = (pct: number) => {
                            if (pct >= 80) return 'text-red-600 bg-red-50 border-red-300';
                            if (pct >= 60) return 'text-orange-600 bg-orange-50 border-orange-300';
                            if (pct >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
                            return 'text-blue-600 bg-blue-50 border-blue-300';
                          };

                          return (
                            <span key={idx} className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md border text-xs ${getConfidenceColor(marker.confidence)}`}>
                              <Icon className="h-3 w-3" />
                              <span className="font-medium">{marcador.label}</span>
                              <span className="font-bold">
                                {marker.confidence}%
                              </span>
                            </span>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Problemas identificados */}
                {(caseDetails?.analisis_del_caso?.problemas_identificados?.length > 0 || (selectedCase.aiAnalysis.issues && selectedCase.aiAnalysis.issues.length > 0)) && (
                  <div>
                    <Label className="text-sm mb-2">Problemas identificados:</Label>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {(caseDetails?.analisis_del_caso?.problemas_identificados || selectedCase.aiAnalysis.issues || []).map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Nivel de confianza */}
                <div>
                  <Label className="text-sm mb-2">Nivel de confianza del análisis IA:</Label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white rounded-full h-3 border border-blue-200">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${caseDetails?.analisis_del_caso?.nivel_de_confianza_ia || (selectedCase.aiAnalysis.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {caseDetails?.analisis_del_caso?.nivel_de_confianza_ia || (selectedCase.aiAnalysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estrategias de Inmunización */}
            {selectedCase.status === 'verified' && (
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  <Syringe className="h-4 w-4 text-primary" />
                  <span>Estrategias de Inmunización Desarrolladas</span>
                </Label>
                
                {/* Franja de inmunizadores */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Red de Inmunizadores</p>
                      <p className="text-sm font-medium">
                        {vaccines.length > 0 
                          ? `${vaccines.length * 2} inmunizadores participaron en el desarrollo`
                          : 'Pendiente desarrollo de estrategias'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {vaccines.map((vaccine) => (
                    <div key={vaccine.id} className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">{vaccine.title}</h4>
                          <p className="text-sm text-blue-700 mt-1">{vaccine.description}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            vaccine.status === 'active' 
                              ? 'bg-green-100 text-green-700 border-green-300' 
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {vaccine.status === 'active' ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600">Formato:</span>
                          <span className="ml-2 font-medium">{vaccine.format}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Alcance:</span>
                          <span className="ml-2 font-medium">{vaccine.reach}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Engagement:</span>
                          <span className="ml-2 font-medium">{vaccine.engagement}</span>
                        </div>
                        <div>
                          <span className="text-blue-600">Plataformas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {vaccine.platforms.map((platform: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-white">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {vaccines.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Aún no se han desarrollado estrategias de inmunización para este caso
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compartir y Descargar */}
            <div className="pt-4 border-t">
              <Label className="flex items-center space-x-2 mb-3">
                <Share2 className="h-4 w-4 text-primary" />
                <span>Compartir Diagnóstico</span>
              </Label>
              
              <div className="space-y-4">
                {/* Botón de descargar */}
                <div>
                  <Button
                    onClick={handleDownloadImage}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar imagen del diagnóstico
                  </Button>
                </div>

                {/* Botones de compartir en redes */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Compartir en redes sociales:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnTwitter}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnFacebook}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnWhatsApp}
                      className="flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareOnLinkedIn}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de lista de casos (por defecto)
  return (
    <div className="space-y-6">
      {/* Mensaje de Botilito */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img 
            src={botilitoImage} 
            alt="Botilito" 
            className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
          />
          <div className="flex-1">
            <p className="text-xl">
              ¡Ey parcero! Acá está el historial de todos los casos que he analizado 📊🔍
            </p>
            <p className="text-sm mt-1 opacity-80">
              Puedes filtrar por estado, tipo de contenido y buscar lo que necesites. Los casos verificados ya pasaron por diagnóstico humano. ¡Échale un ojo! 👀
            </p>
          </div>
        </div>
      </div>

      {/* Título */}
      <div>
        <h1>Historial de Casos</h1>
        <p className="text-muted-foreground">
          Registro completo de todos los contenidos analizados por Botilito
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl">{historialCasos.length}</p>
                <p className="text-sm text-muted-foreground">Total Casos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 rounded">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl">{historialCasos.filter(c => c.status === 'verified').length}</p>
                <p className="text-sm text-muted-foreground">Verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl">{historialCasos.filter(c => c.status === 'ai_only').length}</p>
                <p className="text-sm text-muted-foreground">Solo IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl">
                  {historialCasos.filter(c => 
                    c.aiAnalysis.veracity === 'Falso' || 
                    c.aiAnalysis.veracity === 'Engañoso'
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Desinformación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de casos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-[24px]">
                <Layers className="h-5 w-5 text-primary" />
                <span>Listado de Casos Históricos</span>
              </CardTitle>
              <CardDescription>
                Todos los contenidos procesados y su estado de verificación
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Hash className="h-3 w-3 mr-1" />
              {filteredCasos.length} casos
            </Badge>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, contenido o código de caso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border border-gray-300"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedFilter} 
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Todos los casos</option>
                <option value="verified">Verificados por humanos</option>
                <option value="ai_only">Solo análisis IA</option>
                <option value="text">Solo texto</option>
                <option value="image">Solo imágenes</option>
                <option value="video">Solo videos</option>
                <option value="audio">Solo audios</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista con scroll */}
          <div className="space-y-4 max-h-[700px] min-h-[500px] overflow-y-auto custom-scrollbar">
            {currentCases.map((caso) => {
              const TypeIcon = getTypeIcon(caso.type);
              
              return (
                <div
                  key={caso.id}
                  className="p-4 border rounded-lg cursor-pointer transition-all duration-200 bg-gray-50/50 hover:bg-accent hover:shadow-md hover:border-primary/50"
                  onClick={() => setSelectedCaseId(caso.id)}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-3 bg-muted rounded-lg">
                        <TypeIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-white border-primary/30 font-mono">
                              Caso: {caso.id}
                            </Badge>
                            <h4 className="font-medium text-sm">{caso.title}</h4>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Fecha y usuario */}
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(caso.submittedAt).toLocaleDateString('es-CO', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                <span className="ml-1">
                                  (hace {Math.floor((Date.now() - new Date(caso.submittedAt).getTime()) / (1000 * 60 * 60 * 24))} días)
                                </span>
                              </span>
                            </div>
                            
                            <Separator orientation="vertical" className="h-3" />
                            
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Reportado por: <span className="font-medium">{caso.submittedBy}</span></span>
                            </div>
                          </div>
                          
                          {/* Verificadores humanos */}
                          {caso.humanVerifiers > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3 text-emerald-600" />
                              <span>{caso.humanVerifiers} verificadores humanos</span>
                            </div>
                          )}
                          
                          {/* Marcadores detectados */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {caso.aiAnalysis.markersDetected.map((marker: any, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[10px] px-2 py-0.5"
                              >
                                {marker.type} • {(marker.confidence * 100).toFixed(0)}%
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {getVeracityBadge(caso.aiAnalysis.veracity)}
                      {getStatusBadge(caso.status)}
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sin resultados */}
      {filteredCasos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>No se encontraron casos</h3>
            <p className="text-muted-foreground">
              No hay casos que coincidan con los filtros seleccionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
