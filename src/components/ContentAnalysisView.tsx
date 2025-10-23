import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  AlertTriangle, 
  XCircle, 
  Hash,
  FileText,
  Flame,
  Ban,
  Skull,
  Target,
  Stethoscope,
  Bot,
  ArrowRight,
  UserCheck,
  Crosshair,
  ExternalLink,
  Activity,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Calendar,
  Link,
  FileType
} from 'lucide-react';

interface ContentAnalysisViewProps {
  contentId?: string;
}

export function ContentAnalysisView({ contentId = "CAS-2024-001" }: ContentAnalysisViewProps) {

  // TODO: Replace mock data with real API call
  // When integrating real API:
  // 1. Call getJobStatus(jobId) from utils/aiAnalysis.ts
  // 2. Extract Botilito summary using: extractBotilitoSummary(jobStatus)
  // 3. Botilito summary is at: result.metadata.resultBotilito.summary

  // Datos simulados del contenido analizado por Botilito
  const analysisResult = {
    id: contentId,
    timestamp: '2024-01-15T14:52:30Z',
    type: 'url',
    title: 'Artículo de noticia falsa con contenido xenofóbico',
    url: 'https://noticiasfalsas24.com/migrantes-venezolanos-crisis-colombia-2024',
    originalText: 'EXCLUSIVA: Investigación revela que el 89% de los delitos en Bogotá son cometidos por inmigrantes venezolanos, según "datos oficiales" que las autoridades ocultaron. Los ciudadanos colombianos ya perdieron más de 2 millones de empleos por esta invasión.',
    headline: 'EXCLUSIVA: Datos oficiales revelan que inmigrantes venezolanos cometen 89% de delitos en Bogotá',
    source: 'Noticias Falsas 24',
    submittedBy: 'carlos.martinez@email.com',
    submittedAt: '2024-01-15T14:45:00Z',
    summary: 'BREAKING: Supuesto hallazgo revolucionario en medicina promete curar todas las enfermedades\n\nBOGOTÁ, Colombia - Un grupo de científicos colombianos afirma haber desarrollado una revolucionaria "cura universal" que supuestamente puede tratar desde el cáncer hasta el resfriado común en cuestión de horas. El anuncio, realizado a través de redes sociales sin revisión científica, ha generado controversia en la comunidad médica internacional.',
    metadata: {
      resultBotilito: {
        tone: 'casual',
        summary: '¡Kiubo! Botilito aquí con el diagnóstico: Este contenido es DESINFORMACIÓN TÓXICA pura. El artículo afirma que el 89% de los delitos en Bogotá son cometidos por inmigrantes venezolanos, usando supuestos "datos oficiales" que las autoridades habrían ocultado. FALSO TOTAL parce.\n\nLo que Botilito encontró:\n- Las estadísticas no coinciden con datos reales de la Policía Nacional de Colombia\n- Usa lenguaje xenofóbico como "invasión" para generar odio\n- La fuente "Noticias Falsas 24" no es verificable ni confiable\n- Promueve discriminación y puede incitar violencia contra población migrante\n\nRiesgo epidemiológico: CRÍTICO (R0: 4.7) - Este contenido se propaga rapidísimo por WhatsApp y Facebook. ¡Cuidado!',
        sentiment: 'alarma',
        coreMessage: 'Desinformación xenofóbica con estadísticas falsas',
        awarenessMessage: 'Este tipo de contenido promueve discriminación y puede incitar violencia'
      }
    },
    botilloAnalysis: {
      primaryDiagnosis: 'Desinformación Tóxica',
      confidence: 0.96,
      riskLevel: 'Crítico',
      markersDetected: [
        { 
          type: 'Falso', 
          confidence: 0.94, 
          virulence: 85,
          justification: 'Estadística del "89% de delitos" no coincide con datos oficiales. Fuente citada carece de verificación institucional.' 
        },
        { 
          type: 'Discurso de odio (Xenofobia)', 
          confidence: 0.92, 
          virulence: 95,
          justification: 'Uso de término "invasión" y generalización negativa hacia población migrante venezolana promueve discriminación.' 
        },
        { 
          type: 'Incitación a la violencia', 
          confidence: 0.87, 
          virulence: 90,
          justification: 'Narrativa de "amenaza" y "pérdida de empleos" genera clima hostil que puede escalar a confrontación social.' 
        },
        { 
          type: 'Sensacionalista', 
          confidence: 0.78, 
          virulence: 55,
          justification: 'Titular con "EXCLUSIVA" y datos alarmistas busca generar reacciones emocionales antes que informar.' 
        }
      ],
      epidemiologicMetrics: {
        r0: 4.7,
        infectivity: 0.94,
        virulence: 0.89,
        transmissionSpeed: 0.96,
        incubationTime: 2.3
      },
      transmissionVectors: [
        { platform: 'Facebook', propagationRisk: 89, active: true },
        { platform: 'WhatsApp', propagationRisk: 82, active: true },
        { platform: 'Twitter', propagationRisk: 75, active: true },
        { platform: 'Telegram', propagationRisk: 68, active: false }
      ],
      geographicSpread: [
        { region: 'Región Andina', riskLevel: 'Crítico', percentage: 89 },
        { region: 'Región Caribe', riskLevel: 'Alto', percentage: 72 },
        { region: 'Región Pacífico', riskLevel: 'Medio', percentage: 45 },
        { region: 'Región Orinoquía', riskLevel: 'Bajo', percentage: 23 }
      ]
    },
    autoActions: {
      humanVerificationQueued: true,
      platformsNotified: ['Facebook', 'WhatsApp', 'Twitter'],
      expertAssigned: 'Especialista en Contenido Tóxico',
      priority: 'Crítica',
      estimatedProcessingTime: '24-48 horas'
    }
  };

  // 🔍 DEBUG: Log data structure
  console.log('🔍 DEBUG - Analysis Result:', {
    hasSummary: !!analysisResult.summary,
    hasMetadata: !!analysisResult.metadata,
    hasResultBotilito: !!analysisResult.metadata?.resultBotilito,
    botilitoSummary: analysisResult.metadata?.resultBotilito?.summary?.substring(0, 50) + '...',
    regularSummary: analysisResult.summary?.substring(0, 50) + '...'
  });

  const getMarkerIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Falso': <XCircle className="h-4 w-4" />,
      'Discurso de odio (Xenofobia)': <Skull className="h-4 w-4" />,
      'Incitación a la violencia': <Ban className="h-4 w-4" />,
      'Sensacionalista': <Flame className="h-4 w-4" />,
    };
    return iconMap[type] || <Target className="h-4 w-4" />;
  };

  const getMarkerColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'Verdadero': 'bg-emerald-500 hover:bg-emerald-600',
      'Falso': 'bg-red-500 hover:bg-red-600',
      'Engañoso': 'bg-orange-500 hover:bg-orange-600',
      'Satírico': 'bg-blue-500 hover:bg-blue-600',
      'Satírico/Humorístico': 'bg-blue-500 hover:bg-blue-600',
      'Manipulado': 'bg-purple-500 hover:bg-purple-600',
      'Discurso de odio': 'bg-red-700 hover:bg-red-800',
      'Discurso de odio (Xenofobia)': 'bg-red-700 hover:bg-red-800',
      'Racismo/Xenofobia': 'bg-red-700 hover:bg-red-800',
      'Sexismo/LGBTQ+fobia': 'bg-red-700 hover:bg-red-800',
      'Clasismo/Aporofobia': 'bg-red-600 hover:bg-red-700',
      'Ableismo': 'bg-red-600 hover:bg-red-700',
      'Incitación a la violencia': 'bg-red-900 hover:bg-red-950',
      'Sensacionalista': 'bg-orange-400 hover:bg-orange-500',
      'Sin contexto': 'bg-amber-500 hover:bg-amber-600',
      'Descontextualizado': 'bg-amber-500 hover:bg-amber-600',
      'No verificable': 'bg-gray-500 hover:bg-gray-600',
      'Teoría conspirativa': 'bg-violet-600 hover:bg-violet-700',
      'Conspiración': 'bg-violet-600 hover:bg-violet-700',
      'Bot/Coordinado': 'bg-indigo-600 hover:bg-indigo-700',
      'Propaganda': 'bg-indigo-600 hover:bg-indigo-700',
      'Suplantación de identidad': 'bg-purple-700 hover:bg-purple-800',
      'Acoso/Ciberbullying': 'bg-orange-700 hover:bg-orange-800',
      'Contenido prejuicioso': 'bg-yellow-600 hover:bg-yellow-700',
      'En revisión': 'bg-gray-400 hover:bg-gray-500'
    };
    return colorMap[type] || 'bg-gray-500 hover:bg-gray-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Crítico': return 'border-red-500 bg-red-50';
      case 'Alto': return 'border-orange-500 bg-orange-50';
      case 'Medio': return 'border-yellow-500 bg-yellow-50';
      case 'Bajo': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const handleShare = (platform: string) => {
    const text = `Diagnóstico Desinfodémico - Caso ${analysisResult.id}: ${analysisResult.botilloAnalysis.primaryDiagnosis} detectado por Botilito`;
    const url = window.location.href;
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center space-x-3">
          <Bot className="h-8 w-8 text-primary" />
          <span>Análisis IA</span>
        </h1>
        <p className="text-muted-foreground">
          Diagnóstico de Botilito completado
        </p>
      </div>

      {/* Diagnóstico Desinfodémico Completo */}
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span>Diagnóstico Desinfodémico de Botilito</span>
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              <Bot className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Información del Caso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Hash className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Número de Caso</div>
                <div className="font-mono">Caso: {analysisResult.id}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Fecha de Análisis</div>
                <div>{new Date(analysisResult.timestamp).toLocaleDateString('es-CO', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileType className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Tipo de Contenido</div>
                <div className="capitalize">{analysisResult.type === 'url' ? 'Enlace Web' : analysisResult.type}</div>
              </div>
            </div>
          </div>

          {/* Título del Contenido */}
          <div>
            <Label className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Título del Contenido</span>
            </Label>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="italic">{analysisResult.headline}</p>
            </div>
          </div>

          {/* Diagnóstico Principal */}
          <div className={`p-6 rounded-lg border-2 ${getRiskColor(analysisResult.botilloAnalysis.riskLevel)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Diagnóstico Principal</span>
                </div>
                <h3 className="text-red-600">
                  {analysisResult.botilloAnalysis.primaryDiagnosis}
                </h3>
              </div>
              <div className="text-right space-y-1">
                <Badge className="bg-red-500 text-white">
                  RIESGO {analysisResult.botilloAnalysis.riskLevel.toUpperCase()}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {(analysisResult.botilloAnalysis.confidence * 100).toFixed(1)}% certeza
                </div>
              </div>
            </div>
            <Progress 
              value={analysisResult.botilloAnalysis.confidence * 100} 
              className="h-3"
            />
          </div>

          {/* Marcadores Detectados - Resumen */}
          <div>
            <Label className="flex items-center space-x-2 mb-3">
              <Crosshair className="h-4 w-4 text-primary" />
              <span>Marcadores de Diagnóstico Detectados</span>
              <Badge variant="secondary">{analysisResult.botilloAnalysis.markersDetected.length}</Badge>
            </Label>
            <div className="flex flex-wrap gap-2">
              {analysisResult.botilloAnalysis.markersDetected.map((marker, index) => (
                <Badge 
                  key={index}
                  className={`${getMarkerColor(marker.type)} text-white px-3 py-1`}
                >
                  {getMarkerIcon(marker.type)}
                  <span className="ml-1">{marker.type}</span>
                  <span className="ml-2 text-xs opacity-80">
                    {(marker.confidence * 100).toFixed(0)}%
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Botones de Compartir */}
          <div className="pt-4 border-t">
            <Label className="flex items-center space-x-2 mb-3">
              <Share2 className="h-4 w-4 text-primary" />
              <span>Compartir Diagnóstico</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Fuente y Submisión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Link className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Fuente</div>
                <div className="text-sm">{analysisResult.source}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Enviado por</div>
                <div className="text-sm">{analysisResult.submittedBy}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status de Derivación Automática */}
      <Alert className="border-blue-200 bg-blue-50">
        <ArrowRight className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>🤖 Botilito:</strong> Este caso ha sido enviado a verificación humana para análisis adicional
        </AlertDescription>
      </Alert>

      {/* Diagnóstico y Análisis Unificado */}
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Panel Principal de Diagnóstico */}
            <Card className={`border-2 ${getRiskColor(analysisResult.botilloAnalysis.riskLevel)}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="text-sm">Diagnóstico</span>
                  </div>
                  <Badge className="bg-red-500 text-white text-sm px-2 py-1">
                    <Bot className="h-3 w-3 mr-1" />
                    {analysisResult.botilloAnalysis.primaryDiagnosis}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-lg text-red-600">
                    RIESGO {analysisResult.botilloAnalysis.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(analysisResult.botilloAnalysis.confidence * 100).toFixed(1)}% certeza
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Riesgo */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm">Nivel de Riesgo</span>
                  </div>
                  <div className="text-2xl">⚠️</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-lg text-red-600">
                    {analysisResult.botilloAnalysis.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-xs text-red-700">
                    Intervención Requerida
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Contenido Original Analizado */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Contenido Analizado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Titular detectado:</Label>
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400 mt-1">
                    <p className="italic">{analysisResult.headline}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Contenido analizado:</Label>
                  <div className="bg-gray-50 p-4 rounded border mt-1">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {analysisResult.metadata?.resultBotilito?.summary || analysisResult.summary || 'No hay resumen disponible'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fuente:</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{analysisResult.source}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Enviado por:</Label>
                    <p className="text-sm mt-1">{analysisResult.submittedBy}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marcadores de Diagnóstico Detectados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crosshair className="h-5 w-5 text-primary" />
                <span>Marcadores Detectados</span>
                <Badge variant="secondary">{analysisResult.botilloAnalysis.markersDetected.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {analysisResult.botilloAnalysis.markersDetected.map((marker, index) => {
                  const getMarkerColorLight = (type: string) => {
                    const colorMap: { [key: string]: string } = {
                      'Verdadero': 'bg-green-50 border-green-200',
                      'Falso': 'bg-red-50 border-red-200',
                      'Engañoso': 'bg-orange-50 border-orange-200',
                      'Satírico': 'bg-blue-50 border-blue-200',
                      'Satírico/Humorístico': 'bg-blue-50 border-blue-200',
                      'Manipulado': 'bg-purple-50 border-purple-200',
                      'Discurso de odio': 'bg-red-100 border-red-300',
                      'Discurso de odio (Xenofobia)': 'bg-red-100 border-red-300',
                      'Racismo/Xenofobia': 'bg-red-100 border-red-300',
                      'Sexismo/LGBTQ+fobia': 'bg-red-100 border-red-300',
                      'Clasismo/Aporofobia': 'bg-red-100 border-red-300',
                      'Ableismo': 'bg-red-100 border-red-300',
                      'Propaganda': 'bg-indigo-50 border-indigo-200',
                      'Spam': 'bg-gray-50 border-gray-200',
                      'Conspiración': 'bg-violet-50 border-violet-200',
                      'Teoría conspirativa': 'bg-violet-50 border-violet-200',
                      'Sesgo Político': 'bg-yellow-50 border-yellow-200',
                      'Estafa': 'bg-purple-50 border-purple-200',
                      'Sensacionalista': 'bg-orange-50 border-orange-200',
                      'Incitación a la violencia': 'bg-red-100 border-red-400',
                      'Descontextualizado': 'bg-amber-50 border-amber-200',
                      'Sin contexto': 'bg-amber-50 border-amber-200',
                      'Parcialmente Cierto': 'bg-orange-50 border-orange-200',
                      'Contenido Patrocinado': 'bg-indigo-50 border-indigo-200',
                      'Opinión': 'bg-gray-50 border-gray-200',
                      'Rumor': 'bg-gray-50 border-gray-200',
                      'No verificable': 'bg-gray-50 border-gray-200',
                      'Deepfake': 'bg-purple-50 border-purple-200',
                      'Sin Verificar': 'bg-gray-50 border-gray-200',
                      'Bot/Coordinado': 'bg-indigo-50 border-indigo-200',
                      'Suplantación de identidad': 'bg-purple-50 border-purple-200',
                      'Acoso/Ciberbullying': 'bg-orange-100 border-orange-300',
                      'Contenido prejuicioso': 'bg-yellow-50 border-yellow-200',
                      'En revisión': 'bg-gray-50 border-gray-200'
                    };
                    return colorMap[type] || 'bg-gray-50 border-gray-200';
                  };

                  const getMarkerColorSoft = (type: string) => {
                    const colorMap: { [key: string]: string } = {
                      'Verdadero': 'bg-green-100 text-green-700 border-green-200',
                      'Falso': 'bg-red-100 text-red-700 border-red-200',
                      'Engañoso': 'bg-orange-100 text-orange-700 border-orange-200',
                      'Satírico': 'bg-blue-100 text-blue-700 border-blue-200',
                      'Satírico/Humorístico': 'bg-blue-100 text-blue-700 border-blue-200',
                      'Manipulado': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Discurso de odio': 'bg-red-100 text-red-800 border-red-300',
                      'Discurso de odio (Xenofobia)': 'bg-red-100 text-red-800 border-red-300',
                      'Racismo/Xenofobia': 'bg-red-100 text-red-800 border-red-300',
                      'Sexismo/LGBTQ+fobia': 'bg-red-100 text-red-800 border-red-300',
                      'Clasismo/Aporofobia': 'bg-red-100 text-red-800 border-red-300',
                      'Ableismo': 'bg-red-100 text-red-800 border-red-300',
                      'Propaganda': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                      'Spam': 'bg-gray-100 text-gray-700 border-gray-200',
                      'Conspiración': 'bg-violet-100 text-violet-700 border-violet-200',
                      'Teoría conspirativa': 'bg-violet-100 text-violet-700 border-violet-200',
                      'Sesgo Político': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                      'Estafa': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Sensacionalista': 'bg-orange-100 text-orange-700 border-orange-200',
                      'Incitación a la violencia': 'bg-red-100 text-red-900 border-red-400',
                      'Descontextualizado': 'bg-amber-100 text-amber-700 border-amber-200',
                      'Sin contexto': 'bg-amber-100 text-amber-700 border-amber-200',
                      'Parcialmente Cierto': 'bg-orange-100 text-orange-700 border-orange-200',
                      'Contenido Patrocinado': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                      'Opinión': 'bg-gray-100 text-gray-700 border-gray-200',
                      'Rumor': 'bg-gray-100 text-gray-700 border-gray-200',
                      'No verificable': 'bg-gray-100 text-gray-700 border-gray-200',
                      'Deepfake': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Sin Verificar': 'bg-gray-100 text-gray-700 border-gray-200',
                      'Bot/Coordinado': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                      'Suplantación de identidad': 'bg-purple-100 text-purple-700 border-purple-200',
                      'Acoso/Ciberbullying': 'bg-orange-100 text-orange-800 border-orange-300',
                      'Contenido prejuicioso': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                      'En revisión': 'bg-gray-100 text-gray-700 border-gray-200'
                    };
                    return colorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
                  };

                  return (
                    <div key={index} className={`p-4 rounded-lg border space-y-3 ${getMarkerColorLight(marker.type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getMarkerColorSoft(marker.type)}`}>
                            {getMarkerIcon(marker.type)}
                          </Badge>
                          <div>
                            <div className="font-medium">{marker.type}</div>
                            <div className="text-sm text-muted-foreground">
                              Virulencia: {marker.virulence}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            {(marker.confidence * 100).toFixed(1)}% confianza
                          </div>
                          <Progress value={marker.confidence * 100} className="w-20 h-2" />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed pl-10">
                        <strong>Justificación:</strong> {marker.justification}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vista previa del sitio web */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Captura del contenido analizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwd2Vic2l0ZSUyMHNjcmVlbnNob3R8ZW58MXx8fHwxNzU5MTgzOTcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Vista previa del sitio web analizado"
                  className="w-full h-64 object-cover rounded border"
                />
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Advertencia:</strong> Este contenido contiene desinformación de alto riesgo.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}