import React, { useRef } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Share2, Download, Twitter, Facebook, MessageCircle, Linkedin, Bot, User,
  Newspaper, ExternalLink, Tag, XCircle, Skull, Ban, Flame, Target,
  Music, Send, Youtube, Mail, Smartphone, Instagram
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ContentUploadResultProps {
  result: any;
  onReset: () => void;
}

export function ContentUploadResult({ result, onReset }: ContentUploadResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    title,
    summaryBotilito,
    theme,
    region,
    caseNumber,
    consensusState,
    markersDetected,
    vectores,
    finalVerdict,
    fullResult
  } = result;

  const createdAt = fullResult?.created_at;
  const reportedBy = fullResult?.metadata?.reported_by || null;
  const newsSource = fullResult?.metadata?.source || fullResult?.source || null;
  const transmissionSources = vectores && vectores.length > 0 ? vectores : ['Web'];

  // Generate screenshot URL
  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
  const SCREENSHOT_API_KEY = import.meta.env.VITE_SCREENSHOT_API_KEY;

  const generateScreenshotUrl = () => {
    // Check if there's already a screenshot in the response
    const existingScreenshot = fullResult?.metadata?.screenshot || fullResult?.screenshot;
    if (existingScreenshot) return existingScreenshot;

    // Check if this is a URL submission
    const submittedUrl = fullResult?.url;
    const isTextSubmission = fullResult?.metadata?.isTextSubmission;

    if (submittedUrl && !isTextSubmission && SCREENSHOT_API_KEY) {
      // Generate screenshot using screenshotmachine.com
      return `https://api.screenshotmachine.com/?key=${SCREENSHOT_API_KEY}&url=${encodeURIComponent(submittedUrl)}&dimension=1200x800&format=jpg&cacheLimit=0`;
    }

    // Default to placeholder for text submissions
    return PLACEHOLDER_IMAGE;
  };

  const newsScreenshot = generateScreenshotUrl();

  // Helper function for rounded rectangles in canvas
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

  // Generate summary image for social sharing
  const generateSummaryImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configure larger dimensions for better quality
    canvas.width = 1200;
    canvas.height = 1400;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yellow header with border
    ctx.fillStyle = '#ffe97a';
    ctx.fillRect(20, 20, canvas.width - 40, 140);
    ctx.strokeStyle = '#ffda00';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, 140);

    // Logo/Title "BOTILITO"
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 42px Lexend, sans-serif';
    ctx.fillText('BOTILITO', 40, 70);

    // Subtitle
    ctx.font = '22px Lexend, sans-serif';
    ctx.fillText('Diagnóstico Desinfodémico', 40, 105);

    // Case number
    ctx.font = 'bold 20px Lexend, sans-serif';
    ctx.fillText(`Caso: ${caseNumber}`, 40, 140);

    let yPosition = 200;

    // News title with background
    if (title) {
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(40, yPosition, canvas.width - 80, 120);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, yPosition, canvas.width - 80, 120);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 26px Lexend, sans-serif';
      const maxWidth = canvas.width - 120;
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

    // Theme
    if (theme) {
      yPosition += 10;
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('TEMA:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(theme, 110, yPosition);
      yPosition += 35;
    }

    // Source
    if (newsSource) {
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 18px Lexend, sans-serif';
      ctx.fillText('FUENTE:', 40, yPosition);
      ctx.fillStyle = '#000000';
      ctx.font = '18px Lexend, sans-serif';
      ctx.fillText(newsSource.name || newsSource, 130, yPosition);
      yPosition += 45;
    }

    // Screenshot indicator
    if (newsScreenshot) {
      const imgWidth = canvas.width - 80;
      const imgHeight = 300;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(40, yPosition, imgWidth, imgHeight);

      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, yPosition, imgWidth, imgHeight);

      ctx.fillStyle = '#999999';
      ctx.font = '20px Lexend, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Captura de pantalla incluida', canvas.width / 2, yPosition + imgHeight / 2);
      ctx.textAlign = 'left';

      yPosition += 320;
    } else {
      yPosition += 20;
    }

    // Diagnostic markers
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Lexend, sans-serif';
    ctx.fillText('Marcadores de Diagnóstico:', 40, yPosition);
    yPosition += 20;

    const topMarkers = markersDetected?.slice(0, 5) || [];

    topMarkers.forEach((marker: any, index: number) => {
      const markerColors: { [key: string]: string } = {
        'Verdadero': '#10b981',
        'Falso': '#ef4444',
        'Engañoso': '#f97316',
        'Satírico': '#3b82f6',
        'Manipulado': '#a855f7',
        'Discurso de odio': '#991b1b',
        'Propaganda': '#6366f1',
        'Spam': '#6b7280',
        'Conspiración': '#8b5cf6',
        'Sesgo Político': '#ec4899',
        'Estafa': '#ef4444',
        'Sensacionalista': '#fb923c',
        'Incitación a la violencia': '#7f1d1d',
        'Descontextualizado': '#f59e0b',
        'Parcialmente Cierto': '#06b6d4',
        'Sin Verificar': '#6b7280'
      };

      const color = markerColors[marker.type] || '#6b7280';

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

      if (marker.confidence) {
        const confidence = (marker.confidence * 100).toFixed(0);
        ctx.font = `${index === 0 ? '24' : '20'}px Lexend, sans-serif`;
        ctx.fillText(`Confianza: ${confidence}%`, 60, yPosition + 58);
      }

      yPosition += 70;
    });

    // Footer
    yPosition += 30;
    ctx.fillStyle = '#666666';
    ctx.font = '16px Lexend, sans-serif';
    if (createdAt) {
      ctx.fillText(new Date(createdAt).toLocaleString('es-CO'), 40, yPosition);
    }

    yPosition += 30;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Lexend, sans-serif';
    ctx.fillText('Verificado por Botilito - Análisis desinfodémico con IA', 40, yPosition);
  };

  // Download image
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

  // Social sharing functions
  const shareOnTwitter = () => {
    const topMarker = markersDetected?.[0];
    const markerText = topMarker ? `${topMarker.type}` : 'contenido analizado';
    const text = `🔍 Botilito detectó: ${markerText}\n${title ? `\n"${title}"\n` : ''}\nCaso: ${caseNumber}\n#Botilito #VerificaciónDeHechos #Desinformación`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const topMarker = markersDetected?.[0];
    const markerText = topMarker ? `${topMarker.type}` : 'contenido analizado';
    const text = `🔍 *Botilito* detectó: *${markerText}*\n${title ? `\n"${title}"\n` : ''}\nCaso: ${caseNumber}\n\nVerificación completa de desinformación con IA`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  // Get marker icon
  const getMarkerIcon = (type: string, index: number) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Falso': <XCircle className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
      'Discurso de odio': <Skull className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
      'Incitación a la violencia': <Ban className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
      'Sensacionalista': <Flame className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />,
    };
    return iconMap[type] || <Target className={index === 0 ? "h-6 w-6" : "h-5 w-5"} />;
  };

  // Get marker color
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

  // Get platform icon
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

  // Get platform color
  const getPlatformColor = (platform: string) => {
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
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:pt-5 space-y-6">
      {/* Botilito completion banner */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left">
          <img
            src={botilitoImage}
            alt="Botilito"
            className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 md:mb-[-18px] md:mr-[16px]"
          />
          <div className="flex-1">
            <p className="text-lg md:text-xl font-semibold">
              ¡Mis circuitos ya escanearon esto de arriba a abajo! 🔍⚡
            </p>
            <p className="text-sm mt-1 opacity-80">
              Ya le pasé este caso a mis parceros de carne y hueso de <span className="font-medium">Digital-IA</span> para que hagan su diagnóstico humano! 🤝
            </p>
          </div>
        </div>
      </div>

      {/* Main results card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-bold">Diagnóstico Desinfodémico de Botilito</span>
            </CardTitle>
            <div className="flex flex-col items-start md:items-end space-y-1 w-full md:w-auto">
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                <Badge variant="outline" className="text-sm bg-[#ffe97a]">
                  Caso: {caseNumber}
                </Badge>
                {consensusState && (
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      consensusState === 'human_consensus'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                        : consensusState === 'conflicted'
                        ? 'bg-orange-100 border-orange-500 text-orange-700'
                        : 'bg-blue-100 border-blue-500 text-blue-700'
                    }`}
                  >
                    {consensusState === 'human_consensus' && '✓ Verificado por Humanos'}
                    {consensusState === 'conflicted' && '⚠ Opiniones Divididas'}
                    {consensusState === 'ai_only' && '🤖 Análisis AI'}
                  </Badge>
                )}
              </div>
              {createdAt && (
                <p className="text-xs text-muted-foreground">
                  {new Date(createdAt).toLocaleString('es-CO')}
                </p>
              )}
              {reportedBy && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="font-bold">Reportado por: {reportedBy}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content section */}
          {(title || summaryBotilito?.summary) && (
            <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
              {/* Screenshot with overlay markers */}
              {newsScreenshot && (
                <div>
                  <Label>Captura de la noticia:</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border-2 border-secondary/40 relative max-h-40 md:max-h-48">
                    <img
                      src={newsScreenshot}
                      alt="Captura de la noticia"
                      className="w-full h-40 md:h-48 object-cover object-top"
                    />

                    {/* Overlay with detected markers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center p-4">
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {markersDetected?.slice(0, 3).map((marker: any, index: number) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <Badge
                                  className={`${getMarkerColor(marker.type)} text-white shadow-lg cursor-help ${
                                    index === 0
                                      ? 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base scale-105'
                                      : 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm'
                                  }`}
                                >
                                  {getMarkerIcon(marker.type, index)}
                                  <span className="ml-1.5">{marker.type}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">{marker.explanation}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              )}

              {/* Source, theme, region metadata */}
              {(newsSource || theme || region) && (
                <div className="flex flex-wrap items-center gap-4 pb-2">
                  {newsSource && (
                    <div className="flex items-center space-x-2">
                      <Newspaper className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Fuente:</Label>
                      <a
                        href={newsSource.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground rounded-md transition-colors text-xs no-hover-effect"
                      >
                        <span>{newsSource.name || newsSource}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {theme && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Tema:</Label>
                      <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                        {theme}
                      </Badge>
                    </div>
                  )}

                  {region && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Región:</Label>
                      <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                        {region}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {title && (
                <div>
                  <Label>Titular de la noticia:</Label>
                  <div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                    <p className="font-medium">{title}</p>
                  </div>
                </div>
              )}

              {summaryBotilito?.summary && (
                <div>
                  <Label>Contenido analizado:</Label>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
                    {summaryBotilito.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Classification Markers - Always show if available */}
          {markersDetected && markersDetected.length > 0 && (
            <div className="p-4 bg-secondary/20 border border-secondary/40 rounded-lg">
              <Label className="mb-3 block">Marcadores de clasificación detectados:</Label>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {markersDetected.map((marker: any, index: number) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`${getMarkerColor(marker.type)} text-white shadow-md cursor-help ${
                            index === 0
                              ? 'px-4 py-2 text-base scale-105'
                              : 'px-3 py-1.5 text-sm'
                          }`}
                        >
                          {getMarkerIcon(marker.type, index)}
                          <span className="ml-1.5">{marker.type}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{marker.explanation}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          )}

          {/* Epidemiological evaluation */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold">Evaluación epidemiológica:</h4>
            <p className="text-sm text-muted-foreground mt-1">{finalVerdict}</p>
          </div>

          {/* Transmission vectors */}
          <div>
            <Label className="flex items-center space-x-2">
              <Share2 className="h-4 w-4 text-primary" />
              <span>Vectores de transmisión identificados:</span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {transmissionSources.map((source: string, index: number) => (
                <Badge
                  key={index}
                  className={`${getPlatformColor(source)} px-3 py-2 flex items-center space-x-2 shadow-sm`}
                >
                  {getPlatformIcon(source)}
                  <span>{source}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Social sharing and download */}
          <div className="pt-6 border-t space-y-4">
            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <Share2 className="h-4 w-4 text-primary" />
                <span>¡Vamos a inmunizar a todo el país! Comparte este diagnóstico.</span>
              </Label>
              <div className="flex flex-wrap items-center gap-3">
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

          {/* Hidden canvas for image generation */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Reset button */}
      <div className="flex">
        <Button onClick={onReset} className="bg-secondary hover:bg-primary text-primary-foreground transition-all duration-300">
          Quiero reportar otro contenido!
        </Button>
      </div>
    </div>
  );
}
