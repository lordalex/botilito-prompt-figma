import React, { useState, useRef } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Upload, FileText, Send, X, CheckCircle, Clock, Bot, Share2,
  XCircle, Flame, Ban, Skull, Target, Crosshair, Link2, Image, Video, Volume2,
  Download, Twitter, Facebook, MessageCircle, Linkedin, User, Newspaper, ExternalLink, Tag,
  Plus, Paperclip, Mail, Instagram, Music, Hash, Youtube, Smartphone, MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { generateCaseCode, ContentType, TransmissionVector } from '../utils/caseCodeGenerator';
import { analyzeContent, TransmissionVector as APITransmissionVector, FullAnalysisResponse, Consensus } from '../utils/aiAnalysis';

export function ContentUpload() {
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [contentType, setContentType] = useState<ContentType>('texto');
  const [transmissionMedium, setTransmissionMedium] = useState<TransmissionVector>('Otro');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [contentTheme, setContentTheme] = useState('');
  const [newsScreenshot, setNewsScreenshot] = useState('');
  const [reportDateTime, setReportDateTime] = useState('');
  const [newsSource, setNewsSource] = useState<{name: string, url: string} | null>(null);
  const [reportedBy, setReportedBy] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const transmissionMediums = [
    { value: 'WhatsApp' as TransmissionVector, label: 'WhatsApp', icon: MessageCircle },
    { value: 'Facebook' as TransmissionVector, label: 'Facebook', icon: Facebook },
    { value: 'Instagram' as TransmissionVector, label: 'Instagram', icon: Instagram },
    { value: 'Twitter/X' as TransmissionVector, label: 'Twitter/X', icon: Twitter },
    { value: 'TikTok' as TransmissionVector, label: 'TikTok', icon: Music },
    { value: 'Telegram' as TransmissionVector, label: 'Telegram', icon: Send },
    { value: 'YouTube' as TransmissionVector, label: 'YouTube', icon: Youtube },
    { value: 'Email' as TransmissionVector, label: 'Email', icon: Mail },
    { value: 'SMS' as TransmissionVector, label: 'SMS', icon: Smartphone },
    { value: 'Web' as TransmissionVector, label: 'Web/Sitio', icon: Link2 },
    { value: 'Otro' as TransmissionVector, label: 'Otra plataforma digital', icon: Share2 },
  ];

  // Auto-expand textarea based on content length
  const calculateTextareaRows = (text: string): number => {
    if (!text || text.length === 0) return 1;

    // Count newlines in the text
    const newlineCount = (text.match(/\n/g) || []).length;

    // Check if it's a URL (short and compact)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isOnlyUrl = urlRegex.test(text.trim()) && text.trim().length < 200 && newlineCount === 0;

    if (isOnlyUrl) return 1;

    // Base calculation on content length
    let rows = 1;
    if (text.length > 50 && text.length <= 150) rows = 2;
    else if (text.length > 150 && text.length <= 300) rows = 3;
    else if (text.length > 300 && text.length <= 500) rows = 4;
    else if (text.length > 500 && text.length <= 800) rows = 5;
    else if (text.length > 800) rows = 6;

    // Add rows for newlines (each newline adds a row)
    rows = Math.max(rows, Math.min(newlineCount + 1, 6));

    // Cap at 6 rows maximum
    return Math.min(rows, 6);
  };

  // Handle content change with auto-detection and auto-expand
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Auto-expand textarea based on content
    const newRows = calculateTextareaRows(newContent);
    setTextareaRows(newRows);

    // Auto-detect content type (URL vs text)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(newContent);
    if (hasUrl) {
      setContentType('url');
    } else {
      setContentType('texto');
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Detectar tipo de contenido basado en el archivo
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setContentType('imagen');
      } else if (file.type.startsWith('video/')) {
        setContentType('video');
      } else if (file.type.startsWith('audio/')) {
        setContentType('audio');
      } else {
        setContentType('texto');
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Map UI transmission vector to API transmission vector
  const mapTransmissionVector = (uiVector: TransmissionVector): APITransmissionVector => {
    const mapping: Record<string, APITransmissionVector> = {
      'WhatsApp': 'WhatsApp',
      'Facebook': 'Facebook',
      'Instagram': 'Otro', // Not directly supported by API
      'Twitter/X': 'Twitter',
      'TikTok': 'Otro', // Not directly supported by API
      'Telegram': 'Telegram',
      'YouTube': 'Otro', // Not directly supported by API
      'Email': 'Email',
      'SMS': 'Otro', // Not directly supported by API
      'Web': 'Otro',
      'Otro': 'Otro'
    };
    return mapping[uiVector] || 'Otro';
  };

  // Transform API response to UI format
  const transformAPIResponse = (apiResponse: FullAnalysisResponse) => {
    // Get labels from consensus if available, otherwise from classification_labels
    let labels: Record<string, string> = {};
    let consensusState: Consensus['state'] | null = null;

    if (apiResponse.consensus) {
      // Use consensus final_labels
      consensusState = apiResponse.consensus.state;
      const aiLabels = apiResponse.metadata?.classification_labels ||
                       apiResponse.case_study?.metadata?.ai_labels || {};

      // Build labels object from consensus final_labels
      apiResponse.consensus.final_labels.forEach(label => {
        labels[label] = aiLabels[label] || 'Verificado por consenso';
      });
    } else {
      // Use classification_labels directly
      labels = apiResponse.metadata?.classification_labels ||
               apiResponse.case_study?.metadata?.ai_labels || {};
    }

    // Transform labels object to array format for UI
    const markersDetected = Object.entries(labels).map(([type, explanation]) => ({
      type,
      explanation,
      // No confidence scores from API - removed fake values
    }));

    return {
      title: apiResponse.title,
      summary: apiResponse.summary,
      theme: apiResponse.metadata?.theme,
      region: apiResponse.metadata?.region,
      caseNumber: apiResponse.case_study?.case_number,
      consensusState,
      consensus: apiResponse.consensus,
      markersDetected,
      vectores: apiResponse.metadata?.vectores_de_transmision || [],
      relatedDocuments: apiResponse.case_study?.metadata?.related_documents || [],
      webSearchResults: apiResponse.case_study?.metadata?.web_search_results || [],
      finalVerdict: apiResponse.metadata?.comprehensive_judgement?.final_verdict || 'Análisis en proceso',
      fullResult: apiResponse
    };
  };

  const performRealAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisComplete(false);

    try {
      // Determine if it's URL or text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlRegex);
      const isUrl = urls && urls.length > 0;

      // Prepare content for analysis
      const analysisContent = isUrl
        ? { url: urls[0] } // Send first URL found
        : { text: content };

      // Map transmission vector to API format
      const apiVector = mapTransmissionVector(transmissionMedium);

      // Call real AI analysis with progress updates
      const result = await analyzeContent(
        analysisContent,
        apiVector,
        (progress, status) => {
          setAnalysisProgress(progress);
        }
      );

      // Analysis complete - set results
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setAnalysisProgress(100);

      // Transform API response to UI format
      const transformedData = transformAPIResponse(result);

      // Update all UI state with transformed data
      setNewsTitle(transformedData.title);
      setNewsContent(transformedData.summary);

      // Set theme if available
      if (transformedData.theme) {
        setContentTheme(transformedData.theme);
      }

      // Set case number from API (not generated)
      if (transformedData.caseNumber) {
        setCaseNumber(`CASO-${transformedData.caseNumber}`);
      }

      // Determine veracity message based on consensus
      let veracityMessage = 'Análisis Completado';
      if (transformedData.consensusState === 'human_consensus') {
        veracityMessage = 'Verificado por Humanos';
      } else if (transformedData.consensusState === 'conflicted') {
        veracityMessage = 'Opiniones Divididas';
      } else if (transformedData.consensusState === 'ai_only') {
        veracityMessage = 'Análisis AI';
      }

      // Store full analysis result with proper markers
      setAiAnalysis({
        veracity: veracityMessage,
        consensusState: transformedData.consensusState,
        consensus: transformedData.consensus,
        markersDetected: transformedData.markersDetected,
        summary: transformedData.summary,
        theme: transformedData.theme,
        region: transformedData.region,
        sources: transformedData.vectores.length > 0 ? transformedData.vectores : [transmissionMedium],
        recommendation: transformedData.consensusState === 'human_consensus'
          ? 'Análisis verificado por la comunidad'
          : 'Revisa los resultados del análisis',
        finalVerdict: transformedData.finalVerdict,
        fullResult: transformedData.fullResult
      });

    } catch (error: any) {
      console.error('Error en análisis AI:', error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);

      // Show error to user
      setAiAnalysis({
        veracity: 'Error en Análisis',
        confidence: 0,
        markersDetected: [],
        summary: error.message || 'Ocurrió un error durante el análisis. Por favor, intenta de nuevo.',
        sources: [],
        recommendation: 'Verifica tu conexión e intenta nuevamente'
      });
      setAnalysisComplete(true);
    }
  };

  const handleSubmit = () => {
    if (!content && uploadedFiles.length === 0) {
      return;
    }
    if (!transmissionMedium || transmissionMedium === 'Otro') {
      // Si no se seleccionó medio o es "Otro", usar Web como default
      setTransmissionMedium('Web');
    }
    
    // Detectar tipo de contenido si no está definido
    let finalContentType = contentType;
    if (content && content.match(/(https?:\/\/[^\s]+)/g)) {
      finalContentType = 'url';
    }
    
    // Generar número de caso único basado en tipo de contenido y vector de transmisión
    const generatedCaseNumber = generateCaseCode(finalContentType, transmissionMedium);
    setCaseNumber(generatedCaseNumber);
    
    // Generar fecha y hora del reporte
    const now = new Date();
    const dateTimeString = now.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setReportDateTime(dateTimeString);
    
    // Simular usuario que reportó
    const userNames = ['María González', 'Carlos Rodríguez', 'Ana Martínez', 'Juan Pérez', 'Laura Sánchez', 'Diego López'];
    const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
    setReportedBy(randomUser);
    
    // Detectar si es una URL y simular extracción de contenido
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    
    if (urls && urls.length > 0) {
      // Simular extracción de título y contenido de noticia
      setNewsTitle('Descubren nueva vacuna experimental que promete curar todas las enfermedades en 24 horas');
      setNewsContent('Científicos de una universidad desconocida afirman haber desarrollado una vacuna revolucionaria que puede curar cualquier enfermedad en menos de un día. El tratamiento, que aún no ha sido revisado por pares ni aprobado por ninguna agencia reguladora, está generando controversia en redes sociales. Expertos independientes señalan que no existen evidencias científicas que respalden estas afirmaciones extraordinarias.');
      setContentTheme('Salud y Medicina');
      setNewsScreenshot('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800');
      // Simular fuente de la noticia con nombre y URL
      const newsSources = [
        { name: 'El Tiempo', url: 'https://www.eltiempo.com' },
        { name: 'Semana', url: 'https://www.semana.com' },
        { name: 'La República', url: 'https://www.larepublica.co' },
        { name: 'El Espectador', url: 'https://www.elespectador.com' },
        { name: 'Portafolio', url: 'https://www.portafolio.co' },
        { name: 'RCN Noticias', url: 'https://www.canalrcn.com' },
        { name: 'Caracol Noticias', url: 'https://noticias.caracoltv.com' },
        { name: 'BluRadio', url: 'https://www.bluradio.com' },
        { name: 'W Radio', url: 'https://www.wradio.com.co' },
        { name: 'Pulzo', url: 'https://www.pulzo.com' }
      ];
      const randomSource = newsSources[Math.floor(Math.random() * newsSources.length)];
      setNewsSource(randomSource);
    } else {
      // No es URL, limpiar título y contenido pero detectar tema del texto
      setNewsTitle('');
      setNewsContent('');
      setContentTheme('Información General');
      setNewsScreenshot('');
      setNewsSource(null);
    }

    performRealAIAnalysis();
  };

  const resetForm = () => {
    setContent('');
    setUploadedFiles([]);
    setTransmissionMedium('');
    setAnalysisComplete(false);
    setAiAnalysis(null);
    setAnalysisProgress(0);
    setCaseNumber('');
    setNewsTitle('');
    setNewsContent('');
    setContentTheme('');
    setNewsScreenshot('');
    setReportDateTime('');
    setNewsSource(null);
    setReportedBy('');
    setTextareaRows(1);
  };

  // Función helper para dibujar rectángulos redondeados
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

  // Función para generar imagen resumen para redes sociales
  const generateSummaryImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !aiAnalysis) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar dimensiones más grandes para mejor calidad
    canvas.width = 1200;
    canvas.height = 1400;

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Franja amarilla superior con borde
    ctx.fillStyle = '#ffe97a';
    ctx.fillRect(20, 20, canvas.width - 40, 140);
    ctx.strokeStyle = '#ffda00';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, 140);

    // Logo/Título "BOTILITO" en la franja
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 42px Lexend, sans-serif';
    ctx.fillText('BOTILITO', 40, 70);
    
    // Subtítulo
    ctx.font = '22px Lexend, sans-serif';
    ctx.fillText('Diagnóstico Desinfodémico', 40, 105);

    // Número de caso
    ctx.font = 'bold 20px Lexend, sans-serif';
    ctx.fillText(`Caso: ${caseNumber}`, 40, 140);

    // Tarjeta de contenido con borde
    let yPosition = 200;
    
    // Título de la noticia con fondo
    if (newsTitle) {
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(40, yPosition, canvas.width - 80, 120);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, yPosition, canvas.width - 80, 120);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 26px Lexend, sans-serif';
      const maxWidth = canvas.width - 120;
      const words = newsTitle.split(' ');
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
          if (lineCount >= 2) break; // Máximo 3 líneas
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);
      yPosition += 140;
    }

    // Tema del contenido
    if (contentTheme) {
      yPosition += 10;
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('TEMA:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(contentTheme, 110, yPosition);
      yPosition += 35;
    }

    // Fuente
    if (newsSource) {
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('FUENTE:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(newsSource.name, 130, yPosition);
      yPosition += 45;
    }

    // Espacio para indicar que hay captura (sin cargar la imagen para evitar problemas async)
    if (newsScreenshot) {
      const imgWidth = canvas.width - 80;
      const imgHeight = 300;
      
      // Fondo gris con indicador de captura
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(40, yPosition, imgWidth, imgHeight);
      
      // Borde
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, yPosition, imgWidth, imgHeight);
      
      // Texto indicando captura
      ctx.fillStyle = '#999999';
      ctx.font = '20px Lexend, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Captura de pantalla incluida', canvas.width / 2, yPosition + imgHeight / 2);
      ctx.textAlign = 'left';
      
      yPosition += 320;
    } else {
      yPosition += 20;
    }

    // Marcadores detectados con badges coloridos
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Lexend, sans-serif';
    ctx.fillText('Marcadores de Diagnóstico:', 40, yPosition);
    yPosition += 20;

    // Dibujar marcadores como badges
    const topMarkers = aiAnalysis.markersDetected?.slice(0, 5) || [];
    
    topMarkers.forEach((marker: any, index: number) => {
      const markerColors: { [key: string]: string } = {
        'Verdadero': '#10b981',
        'Falso': '#ef4444',
        'Engañoso': '#f97316',
        'Satírico': '#3b82f6',
        'Manipulado': '#a855f7',
        'Discurso de odio': '#991b1b',
        'Discurso de odio (Xenofobia)': '#991b1b',
        'Propaganda': '#6366f1',
        'Spam': '#6b7280',
        'Conspiración': '#8b5cf6',
        'Sesgo Político': '#ec4899',
        'Estafa': '#ef4444',
        'Sensacionalista': '#fb923c',
        'Incitación a la violencia': '#7f1d1d',
        'Descontextualizado': '#f59e0b',
        'Parcialmente Cierto': '#06b6d4',
        'Contenido Patrocinado': '#10b981',
        'Opinión': '#64748b',
        'Rumor': '#14b8a6',
        'Deepfake': '#991b1b',
        'Sin Verificar': '#6b7280'
      };

      const color = markerColors[marker.type] || '#6b7280';
      const confidence = (marker.confidence * 100).toFixed(0);

      // Badge background con sombra
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

      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${index === 0 ? '32' : '26'}px Lexend, sans-serif`;
      ctx.fillText(`${marker.type}`, 60, yPosition + 30);
      
      ctx.font = `${index === 0 ? '24' : '20'}px Lexend, sans-serif`;
      ctx.fillText(`Confianza: ${confidence}%`, 60, yPosition + 58);

      yPosition += 70;
    });

    // Footer con fecha
    yPosition += 30;
    ctx.fillStyle = '#666666';
    ctx.font = '16px Lexend, sans-serif';
    ctx.fillText(reportDateTime, 40, yPosition);
    
    yPosition += 30;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Lexend, sans-serif';
    ctx.fillText('Verificado por Botilito - Análisis desinfodémico con IA', 40, yPosition);
  };

  // Función para descargar la imagen
  const handleDownloadImage = () => {
    generateSummaryImage();
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `botilito-diagnostico-${caseNumber}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    }, 100);
  };

  // Funciones para compartir en redes sociales
  const shareOnTwitter = () => {
    const topMarker = aiAnalysis?.markersDetected?.[0];
    const markerText = topMarker ? `${topMarker.type} (${(topMarker.confidence * 100).toFixed(0)}%)` : 'contenido analizado';
    const text = `🔍 Botilito detectó: ${markerText}\n${newsTitle ? `\n"${newsTitle}"\n` : ''}\nCaso: ${caseNumber}\n#Botilito #VerificaciónDeFechos #Desinformación`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const topMarker = aiAnalysis?.markersDetected?.[0];
    const markerText = topMarker ? `${topMarker.type} (${(topMarker.confidence * 100).toFixed(0)}%)` : 'contenido analizado';
    const text = `🔍 *Botilito* detectó: *${markerText}*\n${newsTitle ? `\n"${newsTitle}"\n` : ''}\nCaso: ${caseNumber}\n\nVerificación completa de desinformación con IA`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-[20px] pr-[0px] pb-[0px] pl-[0px]">
      {/* Franja superior de Botilito cuando el análisis está completo */}
      {analysisComplete && (
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img 
              src={botilitoImage} 
              alt="Botilito" 
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Mis circuitos ya escanearon esto de arriba a abajo! 🔍⚡
              </p>
              <p className="text-sm mt-1 opacity-80">
                Ya le pasé este caso a mis parceros de carne y hueso de <span className="font-medium">Digital-IA</span> para que hagan su diagnóstico humano! 🤝
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!analysisComplete && (
        <>
          {/* Main Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Ajá! ¿listos para diagnosticar juntos lo que se esconde detrás de lo evidente?</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Universal Input Area */}
              <div 
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-solid rounded-xl p-8 transition-all duration-300 bg-[#ffeea9] border-secondary/60 ${
                  isDragging 
                    ? 'bg-[#ffe68f] border-primary scale-[1.02] shadow-lg' 
                    : 'hover:bg-[#ffeb98] hover:border-primary/80 hover:shadow-md'
                }`}
              >
                {/* Layout Horizontal: Botilito a la izquierda, contenido a la derecha */}
                <div className="grid grid-cols-[auto_1fr] gap-8 items-center">
                  {/* Columna Derecha: Contenido */}
                  <div className="space-y-6 col-span-2">
                    {/* Sección Superior: Formatos Soportados */}
                    <div className="flex items-center gap-4 px-[92px] py-[0px] bg-[rgb(255,233,122)] rounded-[10px] border-2 border-[#ffda00]">
                      {/* Botilito a la izquierda */}
                      <img src={botilitoImage} alt="Botilito" className="h-[100px] w-[100px] object-contain flex-shrink-0 pt-[4px] pr-[0px] pb-[0px] pl-[0px]" />
                      
                      {/* Contenido a la derecha */}
                      <div className="flex-1 space-y-3">
                        <p className="text-left px-[7px] py-[0px]">
                          <strong>En Digital-IA me incorporaron tecnología para analizar:</strong>
                        </p>
                        <TooltipProvider>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Enlaces */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help">
                                  <Link2 className="h-4 w-4 text-black" />
                                  <span className="text-sm">Enlaces</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Pega URLs de redes sociales, noticias o cualquier link pa' verificar</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Texto */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help">
                                  <FileText className="h-4 w-4 text-black" />
                                  <span className="text-sm">Texto</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Escribe o pega el texto que quieres chequear, parce</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Imágenes */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help">
                                  <Image className="h-4 w-4 text-black" />
                                  <span className="text-sm">Imágenes</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Sube capturas de pantalla, memes o fotos que te parezcan raras</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Videos */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help">
                                  <Video className="h-4 w-4 text-black" />
                                  <span className="text-sm">Videos</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Sube tus archivos de video MP4, MOV, AVI o cualquier formato</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Audios */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 cursor-help">
                                  <Volume2 className="h-4 w-4 text-black" />
                                  <span className="text-sm">Audios</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Sube notas de voz, podcasts o audios que circulan por ahí</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Sección Media: Instrucciones */}
                    <div className="text-center">
                      <p>Arrastra y suelta o pega tu contenido aquí</p>
                    </div>

                    {/* Sección Inferior: Barra de Input */}
                    <div className="space-y-2">
                      <div className="relative flex items-start bg-white border-2 border-secondary/60 rounded-[8px] shadow-sm min-h-11">
                        {/* Botón + integrado a la izquierda */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-transparent hover:bg-primary no-hover-effect group transition-colors"
                          title="Adjuntar archivo"
                        >
                          <Plus className="h-4 w-4 text-black/60" />
                        </button>

                        {/* Textarea integrado en el centro */}
                        <Textarea
                          placeholder="Pega aquí una URL, texto sospechoso, o escribe lo que quieras analizar..."
                          value={content}
                          onChange={handleContentChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e as any);
                            }
                          }}
                          rows={textareaRows}
                          className="flex-1 resize-none border-0 bg-transparent px-3 min-h-11 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground text-sm leading-relaxed transition-all duration-200"
                        />
                      </div>
                      {content.length > 0 && (
                        <p className="text-xs text-muted-foreground text-right">
                          {content.length} caracteres
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Input de archivo oculto - Se activa con el botón + de la barra de chat */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-6 mt-6 border-t border-secondary/40">
                    <Label>Archivos seleccionados:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-secondary/40 rounded-lg hover:border-primary/60 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-secondary/40 rounded">
                            {file.type.startsWith('image/') && <Image className="h-4 w-4 text-black" />}
                            {file.type.startsWith('video/') && <Video className="h-4 w-4 text-black" />}
                            {file.type.startsWith('audio/') && <Volume2 className="h-4 w-4 text-black" />}
                            {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && <FileText className="h-4 w-4 text-black" />}
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 hover:bg-secondary/40"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transmission Medium Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Vector de Transmisión
              </CardTitle>
              <CardDescription>
                ¿Por dónde recibiste este contenido? Esta información nos ayuda a rastrear las rutas epidemiológicas de la desinformación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Select value={transmissionMedium} onValueChange={setTransmissionMedium}>
                  <SelectTrigger className="w-full border-2 border-gray-300 focus:border-primary/50 transition-colors">
                    <SelectValue placeholder="Cuéntame, ¿por dónde viste eso?" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionMediums.map((medium) => {
                      const IconComponent = medium.icon;
                      return (
                        <SelectItem key={medium.value} value={medium.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{medium.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={(!content && uploadedFiles.length === 0) || !transmissionMedium}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Iniciar Diagnóstico</span>
            </Button>
          </div>
        </>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary animate-pulse" />
              <span>Botilito está diagnosticando...</span>
            </CardTitle>
            <CardDescription>
              Aplicando análisis epidemiológico para detectar patrones de desinformación y evaluar su potencial viral. Esto puede tomar hasta 2-3 minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {analysisProgress < 20 && "Secuenciando contenido desinfodémico..."}
                {analysisProgress >= 20 && analysisProgress < 50 && "Identificando vectores de transmisión..."}
                {analysisProgress >= 50 && analysisProgress < 80 && "Calculando índice de infectividad..."}
                {analysisProgress >= 80 && analysisProgress < 95 && "Generando diagnóstico epidemiológico..."}
                {analysisProgress >= 95 && "Finalizando análisis..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisComplete && aiAnalysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-[24px]">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="text-[24px] font-bold">Diagnóstico Desinfodémico de Botilito</span>
                </CardTitle>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge variant="outline" className="text-sm bg-[#ffe97a]">
                      Caso: {caseNumber}
                    </Badge>
                    {aiAnalysis.consensusState && (
                      <Badge
                        variant="outline"
                        className={`text-sm ${
                          aiAnalysis.consensusState === 'human_consensus'
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                            : aiAnalysis.consensusState === 'conflicted'
                            ? 'bg-orange-100 border-orange-500 text-orange-700'
                            : 'bg-blue-100 border-blue-500 text-blue-700'
                        }`}
                      >
                        {aiAnalysis.consensusState === 'human_consensus' && '✓ Verificado por Humanos'}
                        {aiAnalysis.consensusState === 'conflicted' && '⚠ Opiniones Divididas'}
                        {aiAnalysis.consensusState === 'ai_only' && '🤖 Análisis AI'}
                      </Badge>
                    )}
                  </div>
                  {reportDateTime && (
                    <p className="text-xs text-muted-foreground">
                      {reportDateTime}
                    </p>
                  )}
                  {reportedBy && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-normal font-bold">Reportado por: {reportedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título y contenido de la noticia si corresponde */}
              {newsTitle && newsContent && (
                <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
                  {/* Captura de la noticia con etiquetas superpuestas - Formato horizontal compacto */}
                  {newsScreenshot && (
                    <div>
                      <Label>Captura de la noticia:</Label>
                      <div className="mt-2 rounded-lg overflow-hidden border-2 border-secondary/40 relative max-h-48">
                        <img 
                          src={newsScreenshot} 
                          alt="Captura de la noticia" 
                          className="w-full h-48 object-cover object-top"
                        />
                        
                        {/* Overlay con etiquetas detectadas */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center p-4">
                          <TooltipProvider>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {aiAnalysis.markersDetected?.slice(0, 3).map((marker: any, index: number) => {
                              const getMarkerColor = (type: string) => {
                                const colorMap: { [key: string]: string } = {
                                  'Verdadero': 'bg-emerald-500 hover:bg-emerald-600',
                                  'Falso': 'bg-red-500 hover:bg-red-600',
                                  'Engañoso': 'bg-orange-500 hover:bg-orange-600',
                                  'Satírico': 'bg-blue-500 hover:bg-blue-600',
                                  'Manipulado': 'bg-purple-500 hover:bg-purple-600',
                                  'Discurso de odio': 'bg-red-700 hover:bg-red-800',
                                  'Discurso de odio (Xenofobia)': 'bg-red-700 hover:bg-red-800',
                                  'Racismo/Xenofobia': 'bg-red-700 hover:bg-red-800',
                                  'Sexismo/LGBTQ+fobia': 'bg-red-700 hover:bg-red-800',
                                  'Clasismo/Aporofobia': 'bg-red-600 hover:bg-red-700',
                                  'Ableismo': 'bg-red-600 hover:bg-red-700',
                                  'Propaganda': 'bg-indigo-600 hover:bg-indigo-700',
                                  'Spam': 'bg-gray-500 hover:bg-gray-600',
                                  'Conspiración': 'bg-violet-600 hover:bg-violet-700',
                                  'Teoría conspirativa': 'bg-violet-600 hover:bg-violet-700',
                                  'Sesgo Político': 'bg-yellow-600 hover:bg-yellow-700',
                                  'Estafa': 'bg-purple-700 hover:bg-purple-800',
                                  'Sensacionalista': 'bg-orange-400 hover:bg-orange-500',
                                  'Incitación a la violencia': 'bg-red-900 hover:bg-red-950',
                                  'Descontextualizado': 'bg-amber-500 hover:bg-amber-600',
                                  'Sin contexto': 'bg-amber-500 hover:bg-amber-600',
                                  'Parcialmente Cierto': 'bg-orange-500 hover:bg-orange-600',
                                  'Contenido Patrocinado': 'bg-indigo-600 hover:bg-indigo-700',
                                  'Opinión': 'bg-gray-500 hover:bg-gray-600',
                                  'Rumor': 'bg-gray-500 hover:bg-gray-600',
                                  'No verificable': 'bg-gray-500 hover:bg-gray-600',
                                  'Deepfake': 'bg-purple-500 hover:bg-purple-600',
                                  'Sin Verificar': 'bg-gray-500 hover:bg-gray-600',
                                  'Bot/Coordinado': 'bg-indigo-600 hover:bg-indigo-700',
                                  'Suplantación de identidad': 'bg-purple-700 hover:bg-purple-800',
                                  'Acoso/Ciberbullying': 'bg-orange-700 hover:bg-orange-800',
                                  'Contenido prejuicioso': 'bg-yellow-600 hover:bg-yellow-700',
                                  'En revisión': 'bg-gray-400 hover:bg-gray-500',
                                  'Satírico/Humorístico': 'bg-blue-500 hover:bg-blue-600'
                                };
                                return colorMap[type] || 'bg-gray-500 hover:bg-gray-600';
                              };

                              const getMarkerIcon = (type: string) => {
                                const iconMap: { [key: string]: React.ReactNode } = {
                                  'Falso': <XCircle className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
                                  'Discurso de odio (Xenofobia)': <Skull className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
                                  'Incitación a la violencia': <Ban className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
                                  'Sensacionalista': <Flame className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
                                };
                                return iconMap[type] || <Target className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />;
                              };

                              return (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      className={`${getMarkerColor(marker.type)} text-white shadow-lg cursor-help ${
                                        index === 0
                                          ? 'px-4 py-2 text-base scale-105'
                                          : 'px-3 py-1.5 text-sm'
                                      }`}
                                    >
                                      {getMarkerIcon(marker.type)}
                                      <span className="ml-1.5">{marker.type}</span>
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{marker.explanation}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {newsSource && (
                    <div className="flex flex-wrap items-center gap-4 pb-2">
                      {/* Fuente de la noticia */}
                      <div className="flex items-center space-x-2">
                        <Newspaper className="h-4 w-4 text-primary" />
                        <Label className="text-sm">Fuente:</Label>
                        <a 
                          href={newsSource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground rounded-md transition-colors text-xs no-hover-effect"
                        >
                          <span>{newsSource.name}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      {/* Tema del contenido */}
                      {contentTheme && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <Label className="text-sm">Tema:</Label>
                          <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                            {contentTheme}
                          </Badge>
                        </div>
                      )}

                      {/* Región del contenido */}
                      {aiAnalysis.region && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <Label className="text-sm">Región:</Label>
                          <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                            {aiAnalysis.region}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label>Titular de la noticia:</Label>
                    <div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                      <p className="font-medium">{newsTitle}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Contenido analizado:</Label>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{newsContent}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[20px]">Evaluación epidemiológica:</h4>
                <p className="text-sm text-muted-foreground mt-1">{aiAnalysis.finalVerdict}</p>
              </div>

              <div>
                <Label className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <span>Vectores de transmisión identificados:</span>
                </Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {aiAnalysis.sources.map((source: string, index: number) => {
                    const getPlatformIcon = (platform: string) => {
                      const lowerPlatform = platform.toLowerCase();
                      if (lowerPlatform.includes('whatsapp')) return <MessageCircle className="h-4 w-4" />;
                      if (lowerPlatform.includes('facebook')) return <Facebook className="h-4 w-4" />;
                      if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x')) return <Twitter className="h-4 w-4" />;
                      if (lowerPlatform.includes('instagram')) return <Instagram className="h-4 w-4" />;
                      if (lowerPlatform.includes('tiktok')) return <Music className="h-4 w-4" />;
                      if (lowerPlatform.includes('youtube')) return <Youtube className="h-4 w-4" />;
                      if (lowerPlatform.includes('telegram')) return <Send className="h-4 w-4" />;
                      if (lowerPlatform.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
                      if (lowerPlatform.includes('email') || lowerPlatform.includes('correo')) return <Mail className="h-4 w-4" />;
                      return <Share2 className="h-4 w-4" />;
                    };

                    const getPlatformColor = (platform: string) => {
                      // Colores de marca de cada vector de transmisión
                      const lowerPlatform = platform.toLowerCase();
                      if (lowerPlatform.includes('whatsapp')) return 'bg-[#25D366] text-white border border-[#1da851]';
                      if (lowerPlatform.includes('facebook')) return 'bg-[#1877F2] text-white border border-[#0c63d4]';
                      if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x')) return 'bg-black text-white border border-gray-800';
                      if (lowerPlatform.includes('instagram')) return 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white border border-[#C13584]';
                      if (lowerPlatform.includes('tiktok')) return 'bg-black text-white border border-[#00f2ea]';
                      if (lowerPlatform.includes('youtube')) return 'bg-[#FF0000] text-white border border-[#cc0000]';
                      if (lowerPlatform.includes('telegram')) return 'bg-[#0088cc] text-white border border-[#006ba1]';
                      if (lowerPlatform.includes('linkedin')) return 'bg-[#0A66C2] text-white border border-[#004182]';
                      if (lowerPlatform.includes('email') || lowerPlatform.includes('correo')) return 'bg-[#5f6368] text-white border border-[#4a4d50]';
                      return 'bg-gray-600 text-white border border-gray-700';
                    };

                    return (
                      <Badge 
                        key={index}
                        className={`${getPlatformColor(source)} px-3 py-2 flex items-center space-x-2 shadow-sm`}
                      >
                        {getPlatformIcon(source)}
                        <span>{source}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Compartir en redes sociales y descargar */}
              <div className="pt-6 border-t space-y-4">
                <div>
                  <Label className="flex items-center space-x-2 mb-3">
                    <Share2 className="h-4 w-4 text-primary" />
                    <span>¡Vamos a inmunizar a todo el país! Comparte este diagnóstico en tus redes sociales.</span>
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={shareOnTwitter}
                      size="icon"
                      title="Compartir en Twitter/X"
                      className="h-9 w-9 rounded-full bg-black hover:bg-gray-800 text-white no-hover-effect"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={shareOnFacebook}
                      size="icon"
                      title="Compartir en Facebook"
                      className="h-9 w-9 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white no-hover-effect"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={shareOnWhatsApp}
                      size="icon"
                      title="Compartir en WhatsApp"
                      className="h-9 w-9 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white no-hover-effect"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={shareOnLinkedIn}
                      size="icon"
                      title="Compartir en LinkedIn"
                      className="h-9 w-9 rounded-full bg-[#0A66C2] hover:bg-[#095bad] text-white no-hover-effect"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-border mx-1"></div>
                    <Button
                      onClick={handleDownloadImage}
                      size="sm"
                      title="Descargar imagen resumen"
                      className="rounded-[6px] bg-secondary hover:bg-primary text-primary-foreground px-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="text-sm">Descargar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Canvas oculto para generar imagen */}
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          <div className="flex">
            <Button onClick={resetForm} className="bg-secondary hover:bg-primary text-primary-foreground transition-all duration-300">
              Quiero reportar otro contenido!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
