import React, { useState } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { Separator } from './ui/separator';
import { 
  Users, CheckCircle, XCircle, AlertTriangle, Bot, 
  FileText, Image, Video, Volume2, ThumbsUp, ThumbsDown, 
  MessageSquare, Award, Clock, Send, Smile, Heart, Shield,
  Target, Flame, Vote, DollarSign, Zap, Eye, Ban, Skull,
  Microscope, AlertCircle, HelpCircle,
  Megaphone, Calendar, 
  Filter, Search, Layers, Hash,
  User, Gauge, Timer, Link, ExternalLink, ArrowLeft, Link2,
  Newspaper, Tag, Trophy, Star, Sparkles, TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

// Definición de las 19 categorías de marcadores de diagnóstico con enfoque epidemiológico
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
  { id: 'discurso_odio_clasismo', label: 'Clasismo/Aporofobia', icon: DollarSign, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación basada en clase social o condición económica' },
  { id: 'discurso_odio_ableismo', label: 'Ableismo', icon: Shield, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación contra personas con discapacidades' },
  { id: 'incitacion_violencia', label: 'Incitación a la violencia', icon: Flame, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-400', virulencia: 98, descripcion: 'Contenido que promueve o incita actos violentos' },
  { id: 'acoso_ciberbullying', label: 'Acoso/Ciberbullying', icon: Target, color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', virulencia: 85, descripcion: 'Ataques sistemáticos contra individuos específicos en línea' },
  { id: 'contenido_prejuicioso', label: 'Contenido prejuicioso', icon: AlertTriangle, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', virulencia: 70, descripcion: 'Presenta sesgos evidentes sin considerar otras perspectivas' },
  { id: 'bot_coordinado', label: 'Bot/Coordinado', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', virulencia: 65, descripcion: 'Contenido generado o amplificado por cuentas automatizadas' },
  { id: 'suplantacion_identidad', label: 'Suplantación de identidad', icon: User, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', virulencia: 88, descripcion: 'Se hace pasar por otra persona, organización o medio legítimo' },
  { id: 'sensacionalista', label: 'Sensacionalista', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 55, descripcion: 'Exagera o dramatiza para generar clics o emociones fuertes' },
  { id: 'en_revision', label: 'En revisión', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 40, descripcion: 'Contenido pendiente de verificación adicional' }
];

export function HumanVerification() {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationResult, setVerificationResult] = useState<string>('');
  const [marcadoresDiagnostico, setMarcadoresDiagnostico] = useState<string[]>([]);
  const [marcadoresJustificaciones, setMarcadoresJustificaciones] = useState<{ [key: string]: string }>({});
  const [marcadoresEnlaces, setMarcadoresEnlaces] = useState<{ [key: string]: string }>({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;
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

  const pendingContents = [
    {
      id: 'T-WB-20241014-001',
      type: 'text',
      title: 'Artículo sobre tratamiento alternativo para diabetes',
      content: 'Un nuevo estudio revela que beber agua con limón en ayunas puede curar la diabetes tipo 2 en solo 30 días. Médicos de Harvard confirman la efectividad del tratamiento...',
      headline: 'Descubren cura milagrosa para diabetes: solo agua con limón en ayunas',
      url: 'https://noticiasfalsas.com/cura-diabetes-limon',
      screenshot: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
      source: { name: 'Noticias Falsas', url: 'https://noticiasfalsas.com' },
      theme: 'Salud y Medicina',
      aiAnalysis: {
        veracity: 'Posible Desinformación',
        confidence: 0.89,
        detectedMarkers: ['enganoso', 'sensacionalista', 'no_verificable'],
        issues: ['No se encontraron estudios de Harvard sobre este tema', 'Afirmaciones médicas sin respaldo científico', 'Promete "cura" para enfermedad crónica'],
        summary: 'El contenido presenta patrones epidemiológicos consistentes con desinformación médica. Alto riesgo de propagación exponencial debido a apelación emocional y falsa autoridad científica.',
        sources: ['WhatsApp', 'Facebook', 'Twitter'],
        markersDetected: [
          { type: 'Engañoso', confidence: 0.89 },
          { type: 'Sensacionalista', confidence: 0.85 },
          { type: 'No verificable', confidence: 0.78 }
        ]
      },
      consensusMarkers: [],
      submittedBy: 'usuario_123',
      submittedAt: '2024-01-15T10:30:00Z',
      priority: 'high',
      votesCount: 0,
    },
    {
      id: 'I-FB-20241014-002',
      type: 'image',
      title: 'Foto de manifestación en plaza principal',
      url: 'https://redessociales.com/manifestacion-falsa',
      headline: 'Miles protestan contra el gobierno en la plaza central',
      content: 'manifestacion_plaza_central.jpg',
      description: 'Imagen que muestra una gran manifestación en la plaza central con miles de personas',
      screenshot: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
      source: { name: 'Redes Sociales', url: 'https://redessociales.com' },
      theme: 'Política y Sociedad',
      aiAnalysis: {
        veracity: 'Fuera de Contexto',
        confidence: 0.76,
        detectedMarkers: ['sin_contexto', 'manipulado'],
        issues: ['La imagen parece ser de otro evento', 'La fecha no coincide con eventos recientes', 'Metadatos sugieren manipulación'],
        summary: 'La imagen corresponde a un evento diferente realizado en 2019. Uso fuera de contexto para generar percepción de crisis actual.',
        sources: ['Facebook', 'Instagram', 'Telegram'],
        markersDetected: [
          { type: 'Sin contexto', confidence: 0.76 },
          { type: 'Manipulado', confidence: 0.68 },
          { type: 'Engañoso', confidence: 0.72 }
        ]
      },
      consensusMarkers: ['sin_contexto', 'enganoso'],
      submittedBy: 'usuario_456',
      submittedAt: '2024-01-15T09:15:00Z',
      priority: 'medium',
      votesCount: 2,
    },
    {
      id: 'V-TK-20241014-003',
      type: 'video',
      title: 'Video de declaraciones del ministro de economía',
      url: 'https://videosvirales.com/ministro-economia',
      headline: 'Ministro anuncia sorprendentes medidas económicas',
      content: 'declaraciones_ministro_economia.mp4',
      description: 'Video donde el ministro supuestamente anuncia nuevas medidas económicas',
      screenshot: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800',
      source: { name: 'Videos Virales', url: 'https://videosvirales.com' },
      theme: 'Economía y Política',
      aiAnalysis: {
        veracity: 'Requiere Verificación',
        confidence: 0.62,
        detectedMarkers: ['manipulado', 'no_verificable'],
        issues: ['Calidad de audio inconsistente', 'Movimientos faciales sospechosos', 'No hay registro oficial de esta declaración'],
        summary: 'Video presenta inconsistencias en sincronización labial y calidad de audio. Posible manipulación mediante deepfake. No existe comunicado oficial que respalde estas declaraciones.',
        sources: ['TikTok', 'YouTube', 'WhatsApp', 'Twitter'],
        markersDetected: [
          { type: 'Manipulado', confidence: 0.82 },
          { type: 'No verificable', confidence: 0.62 },
          { type: 'Sensacionalista', confidence: 0.71 }
        ]
      },
      consensusMarkers: ['manipulado'],
      submittedBy: 'usuario_789',
      submittedAt: '2024-01-15T08:45:00Z',
      priority: 'high',
      votesCount: 1,
    },
    {
      id: '4',
      type: 'text',
      title: 'Supuesto mensaje del alcalde sobre toque de queda',
      url: null,
      headline: 'URGENTE: Toque de queda total desde mañana',
      content: 'El alcalde anuncia toque de queda total desde mañana por tres semanas. Compartir urgente con todos sus contactos. La policía patrullará las calles y multará a quien salga.',
      aiAnalysis: {
        veracity: 'Falso',
        confidence: 0.94,
        detectedMarkers: ['falso', 'sensacionalista'],
        issues: ['No hay comunicado oficial de la alcaldía', 'Lenguaje alarmista típico de cadenas falsas', 'No coincide con protocolos municipales']
      },
      consensusMarkers: ['falso', 'sensacionalista', 'suplantacion_identidad'],
      submittedBy: 'usuario_234',
      submittedAt: '2024-01-15T08:20:00Z',
      priority: 'high',
      votesCount: 5,
    },
    {
      id: '5',
      type: 'image',
      title: 'Captura de pantalla de chat WhatsApp',
      url: null,
      headline: null,
      content: 'chat_supuesta_amenaza.jpg',
      description: 'Conversación donde supuestamente se planea un ataque en zona comercial',
      aiAnalysis: {
        veracity: 'Posible Desinformación',
        confidence: 0.81,
        detectedMarkers: ['no_verificable', 'sensacionalista'],
        issues: ['No es posible verificar autenticidad del chat', 'Contenido alarmista', 'No hay reportes oficiales relacionados']
      },
      consensusMarkers: ['no_verificable', 'enganoso', 'sensacionalista'],
      submittedBy: 'usuario_567',
      submittedAt: '2024-01-15T07:55:00Z',
      priority: 'high',
      votesCount: 3,
    },
    {
      id: '6',
      type: 'video',
      title: 'Influencer promocionando inversión cripto "garantizada"',
      url: null,
      headline: null,
      content: 'video_cripto_inversion.mp4',
      description: 'Persona conocida promete ganancias del 300% en criptomonedas',
      aiAnalysis: {
        veracity: 'Engañoso',
        confidence: 0.88,
        detectedMarkers: ['enganoso', 'sensacionalista'],
        issues: ['Promesas de retorno irreales', 'Presión para inversión inmediata', 'Características de esquema Ponzi']
      },
      consensusMarkers: ['enganoso', 'falso', 'sensacionalista'],
      submittedBy: 'usuario_890',
      submittedAt: '2024-01-15T07:30:00Z',
      priority: 'medium',
      votesCount: 7,
    },
    {
      id: '7',
      type: 'text',
      title: 'Noticia sobre subsidio del gobierno',
      url: 'https://subsidios-gov-colombia.online/registro-500mil',
      headline: 'Gobierno Nacional anuncia subsidio de $500.000 para todos los ciudadanos',
      content: 'El gobierno anuncia nuevo subsidio de $500.000 para todos los ciudadanos mayores de edad. Regístrese en este link antes del viernes para reclamar su dinero. Se necesita cédula, RUT y datos bancarios para el pago inmediato.',
      aiAnalysis: {
        veracity: 'Posible Phishing',
        confidence: 0.92,
        detectedMarkers: ['suplantacion_identidad', 'falso', 'enganoso'],
        issues: ['Link no corresponde a dominio gubernamental', 'No hay anuncio oficial', 'Solicita datos personales sensibles']
      },
      consensusMarkers: ['suplantacion_identidad', 'falso', 'enganoso', 'sensacionalista'],
      submittedBy: 'usuario_345',
      submittedAt: '2024-01-15T07:10:00Z',
      priority: 'high',
      votesCount: 9,
    },
    {
      id: '8',
      type: 'audio',
      title: 'Audio de supuesto secuestro en el barrio',
      url: null,
      headline: null,
      content: 'audio_alerta_secuestro.mp3',
      description: 'Mensaje de voz advirtiendo sobre secuestros en la zona',
      aiAnalysis: {
        veracity: 'Fuera de Contexto',
        confidence: 0.73,
        detectedMarkers: ['sin_contexto', 'sensacionalista'],
        issues: ['El audio es de hace 2 años en otra ciudad', 'No hay reportes recientes de secuestros', 'Metadatos de archivo antiguo']
      },
      consensusMarkers: ['sin_contexto', 'enganoso', 'sensacionalista'],
      submittedBy: 'usuario_678',
      submittedAt: '2024-01-15T06:45:00Z',
      priority: 'medium',
      votesCount: 4,
    },
    {
      id: '9',
      type: 'text',
      title: 'Publicación sobre vacunas y autismo',
      url: 'https://medicinanatural.info/vacunas-autismo-verdad-oculta',
      headline: 'Estudio científico comprueba relación directa entre vacunas infantiles y autismo',
      content: 'Un estudio reciente comprueba la relación entre vacunas infantiles y autismo que los médicos y las farmacéuticas están ocultando. Miles de padres reportan que sus hijos desarrollaron autismo después de la vacunación. La verdad que no quieren que sepas.',
      aiAnalysis: {
        veracity: 'Falso',
        confidence: 0.97,
        detectedMarkers: ['falso', 'teoria_conspirativa', 'enganoso'],
        issues: ['Múltiples estudios científicos desmienten esta teoría', 'Información puede causar daño a la salud pública', 'No cita fuentes verificables']
      },
      consensusMarkers: ['falso', 'teoria_conspirativa', 'enganoso', 'sensacionalista'],
      submittedBy: 'usuario_901',
      submittedAt: '2024-01-15T06:20:00Z',
      priority: 'high',
      votesCount: 12,
    },
    {
      id: '10',
      type: 'image',
      title: 'Foto de celebridad con político controversial',
      url: null,
      headline: null,
      content: 'foto_celebridad_politico.jpg',
      description: 'Imagen sugiere apoyo de celebridad a candidato político',
      aiAnalysis: {
        veracity: 'Manipulado',
        confidence: 0.85,
        detectedMarkers: ['manipulado', 'enganoso'],
        issues: ['Análisis forense muestra inconsistencias en iluminación', 'La celebridad desmintió la foto públicamente', 'Bordes borrosos alrededor de las figuras']
      },
      consensusMarkers: ['manipulado', 'falso', 'enganoso'],
      submittedBy: 'usuario_112',
      submittedAt: '2024-01-15T05:50:00Z',
      priority: 'medium',
      votesCount: 6,
    },
    {
      id: '11',
      type: 'video',
      title: 'Tutorial de "remedio casero" para COVID-19',
      url: null,
      headline: null,
      content: 'video_remedio_covid.mp4',
      description: 'Persona explica cómo curar COVID con productos naturales',
      aiAnalysis: {
        veracity: 'Desinformación Peligrosa',
        confidence: 0.96,
        detectedMarkers: ['falso', 'enganoso', 'sensacionalista'],
        issues: ['Contradice recomendaciones de OMS', 'No hay evidencia científica de efectividad', 'Puede causar que personas eviten tratamiento médico real']
      },
      consensusMarkers: ['falso', 'enganoso', 'sensacionalista', 'contenido_prejuicioso'],
      submittedBy: 'usuario_223',
      submittedAt: '2024-01-15T05:15:00Z',
      priority: 'high',
      votesCount: 15,
    }
  ];

  // Usar las mismas categorías del banco de marcadores de diagnóstico
  const verificationOptions = ETIQUETAS_CATEGORIAS;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Volume2;
      default: return FileText;
    }
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

  const handleVerificationSubmit = () => {
    if (!selectedContent || marcadoresDiagnostico.length === 0) return;
    
    // Simulate verification submission
    console.log('Verificación enviada:', {
      contenido: selectedContent,
      marcadores: marcadoresDiagnostico,
      justificaciones: marcadoresJustificaciones,
      enlaces: marcadoresEnlaces,
      notas: verificationNotes
    });
    
    // Calcular puntos basados en criterios detallados
    const basePoints = 20; // XP base por realizar un diagnóstico
    const markerBonus = marcadoresDiagnostico.length * 5; // 5 XP por cada marcador aplicado
    const justificationBonus = Object.keys(marcadoresJustificaciones).filter(k => marcadoresJustificaciones[k].length > 20).length * 10; // 10 XP por justificación detallada
    const linkBonus = Object.keys(marcadoresEnlaces).filter(k => marcadoresEnlaces[k]).length * 15; // 15 XP por cada enlace de fuente
    const totalPoints = basePoints + markerBonus + justificationBonus + linkBonus;
    
    // Sistema de niveles epidemiológicos (mismo que UserProfile)
    const levels = [
      { 
        level: 1, 
        title: 'VIGILANTE CENTINELA', 
        subtitle: 'Primera Línea de Defensa',
        minXP: 0, 
        maxXP: 500, 
        badge: '👁️'
      },
      { 
        level: 2, 
        title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', 
        subtitle: 'Analista de Contagio',
        minXP: 500, 
        maxXP: 2000, 
        badge: '🔬'
      },
      { 
        level: 3, 
        title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', 
        subtitle: 'Educomunicador Estratégico',
        minXP: 2000, 
        maxXP: 999999, 
        badge: '💉'
      }
    ];
    
    // Simular XP actual del usuario (850 = Nivel 2)
    const currentXP = 850 + totalPoints;
    const getCurrentLevel = (xp: number) => {
      return levels.find(level => xp >= level.minXP && xp < level.maxXP) || levels[levels.length - 1];
    };
    
    const currentLevel = getCurrentLevel(currentXP);
    const nextLevel = levels.find(level => level.level === currentLevel.level + 1);
    const progressToNext = nextLevel ? 
      Math.round(((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
      : 100;
    
    // Simular total de diagnósticos completados
    const totalDiagnoses = 28 + 1; // María tiene 28, ahora 29
    
    // Racha diaria
    const streak = 12; // Misma racha que en el perfil
    
    // Insignias desbloqueables (alineadas con UserProfile)
    const availableBadges = [
      { id: 'analista-contagio', name: 'Analista de Contagio', icon: '🔬', description: 'Nivel 2 desbloqueado', threshold: 500 },
      { id: 'detector-25', name: 'Detector Activo', icon: '👁️', description: '25 diagnósticos completados', threshold: 25 },
      { id: 'racha-7', name: 'Constancia Inicial', icon: '🔥', description: '7 días consecutivos', threshold: 7 },
      { id: 'precision', name: 'Precisión Destacada', icon: '🎯', description: '90%+ de precisión', threshold: 90 }
    ];
    
    // Verificar si se desbloquea una nueva insignia
    let newBadge = null;
    if (totalDiagnoses === 25) {
      newBadge = availableBadges.find(b => b.id === 'detector-25');
    } else if (totalDiagnoses === 30) {
      newBadge = availableBadges.find(b => b.id === 'precision');
    }
    
    setGamificationData({
      pointsEarned: totalPoints,
      currentLevel: currentLevel.title,
      currentLevelBadge: currentLevel.badge,
      currentLevelSubtitle: currentLevel.subtitle,
      totalDiagnoses,
      streak,
      newBadge: newBadge ? newBadge.name : null,
      newBadgeIcon: newBadge ? newBadge.icon : null,
      newBadgeDescription: newBadge ? newBadge.description : null,
      currentXP,
      nextLevelXP: nextLevel ? nextLevel.minXP : currentLevel.maxXP,
      progressToNext
    });
    
    // Mostrar diálogo de éxito
    setShowSuccessDialog(true);
  };

  const handleCloseSuccessDialog = () => {
    // Cerrar el diálogo
    setShowSuccessDialog(false);
    
    // Limpiar formulario y regresar a la cola
    setTimeout(() => {
      setSelectedContent(null);
      setVerificationNotes('');
      setVerificationResult('');
      setMarcadoresDiagnostico([]);
      setMarcadoresJustificaciones({});
      setMarcadoresEnlaces({});
    }, 300);
  };

  const toggleMarcadorDiagnostico = (marcadorId: string) => {
    setMarcadoresDiagnostico(prev => {
      if (prev.includes(marcadorId)) {
        // Si se está quitando, también eliminar su justificación y enlace
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
    setMarcadoresJustificaciones(prev => ({
      ...prev,
      [marcadorId]: justificacion
    }));
  };

  const updateMarcadorEnlace = (marcadorId: string, enlace: string) => {
    setMarcadoresEnlaces(prev => ({
      ...prev,
      [marcadorId]: enlace
    }));
  };

  const getMarcador = (marcadorId: string) => {
    return ETIQUETAS_CATEGORIAS.find(c => c.id === marcadorId);
  };

  const getMarcadorBadgeColor = (marcadorId: string) => {
    const marcador = getMarcador(marcadorId);
    if (!marcador) return 'bg-gray-100 text-gray-700 border-gray-300';
    
    const colorMap: { [key: string]: string } = {
      'verdadero': 'bg-green-100 text-green-700 border-green-300',
      'falso': 'bg-red-100 text-red-700 border-red-300',
      'enganoso': 'bg-orange-100 text-orange-700 border-orange-300',
      'satirico': 'bg-blue-100 text-blue-700 border-blue-300',
      'manipulado': 'bg-purple-100 text-purple-700 border-purple-300',
      'sin_contexto': 'bg-amber-100 text-amber-700 border-amber-300',
      'no_verificable': 'bg-gray-100 text-gray-700 border-gray-300',
      'teoria_conspirativa': 'bg-violet-100 text-violet-700 border-violet-300',
      'discurso_odio_racismo': 'bg-red-200 text-red-900 border-red-400',
      'discurso_odio_sexismo': 'bg-red-200 text-red-900 border-red-400',
      'discurso_odio_clasismo': 'bg-red-200 text-red-900 border-red-400',
      'discurso_odio_ableismo': 'bg-red-200 text-red-900 border-red-400',
      'incitacion_violencia': 'bg-red-300 text-red-950 border-red-500',
      'acoso_ciberbullying': 'bg-orange-200 text-orange-900 border-orange-400',
      'contenido_prejuicioso': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'bot_coordinado': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'suplantacion_identidad': 'bg-purple-200 text-purple-900 border-purple-400',
      'sensacionalista': 'bg-orange-100 text-orange-600 border-orange-300',
      'en_revision': 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colorMap[marcadorId] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getMarcadorColor = (marcadorId: string) => {
    const colorMap: { [key: string]: string } = {
      'verdadero': 'bg-emerald-500 hover:bg-emerald-600',
      'falso': 'bg-red-500 hover:bg-red-600',
      'enganoso': 'bg-orange-500 hover:bg-orange-600',
      'satirico': 'bg-blue-500 hover:bg-blue-600',
      'manipulado': 'bg-purple-500 hover:bg-purple-600',
      'sin_contexto': 'bg-amber-500 hover:bg-amber-600',
      'no_verificable': 'bg-gray-500 hover:bg-gray-600',
      'teoria_conspirativa': 'bg-violet-600 hover:bg-violet-700',
      'discurso_odio_racismo': 'bg-red-700 hover:bg-red-800',
      'discurso_odio_sexismo': 'bg-red-700 hover:bg-red-800',
      'discurso_odio_clasismo': 'bg-red-600 hover:bg-red-700',
      'discurso_odio_ableismo': 'bg-red-600 hover:bg-red-700',
      'incitacion_violencia': 'bg-red-900 hover:bg-red-950',
      'acoso_ciberbullying': 'bg-orange-700 hover:bg-orange-800',
      'contenido_prejuicioso': 'bg-yellow-600 hover:bg-yellow-700',
      'bot_coordinado': 'bg-indigo-600 hover:bg-indigo-700',
      'suplantacion_identidad': 'bg-purple-700 hover:bg-purple-800',
      'sensacionalista': 'bg-orange-400 hover:bg-orange-500',
      'en_revision': 'bg-gray-400 hover:bg-gray-500'
    };
    return colorMap[marcadorId] || 'bg-gray-500 hover:bg-gray-600';
  };

  const selectedContentData = pendingContents.find(c => c.id === selectedContent);

  // Componente de diálogo de éxito gamificado (alineado con sistema de UserProfile)
  const renderSuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={(open) => {
      // Solo permitir cerrar mediante el botón, no con ESC o clic fuera
      if (!open) return;
    }}>
      <DialogContent 
        className="max-w-md border-4 border-primary shadow-2xl [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Confetti effect background */}
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
              {/* Botilito celebrando */}
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
            {/* Puntos ganados - diseño destacado */}
            <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">¡Ganaste XP!</p>
              </div>
              <p className="text-5xl font-bold text-primary mb-1">+{gamificationData.pointsEarned}</p>
              <p className="text-sm text-muted-foreground">puntos de experiencia</p>
            </div>

            {/* Nivel actual - badge epidemiológico */}
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
              
              {/* Barra de progreso al siguiente nivel */}
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

            {/* Estadísticas clave */}
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

            {/* Insignia desbloqueada */}
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

            {/* Mensaje motivacional con tono colombiano */}
            <div className="bg-muted/30 rounded-lg p-4 text-center border border-muted">
              <p className="text-sm italic">
                "Cada diagnóstico que haces ayuda a proteger a miles de colombianos de la desinformación. ¡Sigue así, crack!" 💪🇨🇴
              </p>
            </div>

            {/* Botón para continuar */}
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

  // FLUJO NUEVO: Si no hay contenido seleccionado, mostrar solo la cola
  if (!selectedContentData) {
    return (
      <div className="space-y-6">
        {/* Franja superior de Botilito */}
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img 
              src={botilitoImage} 
              alt="Botilito" 
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Ey parcero! Acá están los casos que necesitan ojo humano 🔍👀
              </p>
              <p className="text-sm mt-1 opacity-80">
                Ya hice mi tarea con la IA, pero ahora necesito que vos y tus colegas hagan el diagnóstico fino. ¡Entre todos le paramos bolas a la desinformación! 💪
              </p>
            </div>
          </div>
        </div>

        {/* Solo la cola de casos pendientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-[24px]">
                  <Layers className="h-5 w-5 text-primary" />
                  <span>Listado de Casos</span>
                </CardTitle>
                <CardDescription>
                  Casos bajo análisis epidemiológico que requieren diagnóstico especializado
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Hash className="h-3 w-3 mr-1" />
                {pendingContents.length} casos activos
              </Badge>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex space-x-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar casos por título o contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-gray-300"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">Todos los casos</option>
                  <option value="high">Alta prioridad</option>
                  <option value="medium">Prioridad media</option>
                  <option value="text">Solo texto</option>
                  <option value="image">Solo imágenes</option>
                  <option value="video">Solo videos</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de casos con altura fija y scroll */}
            <div className="space-y-4 max-h-[600px] min-h-[500px] overflow-y-auto custom-scrollbar">
              {(() => {
                // Calcular índices para la paginación
                const indexOfLastCase = currentPage * casesPerPage;
                const indexOfFirstCase = indexOfLastCase - casesPerPage;
                const currentCases = pendingContents.slice(indexOfFirstCase, indexOfLastCase);
                
                return currentCases.map((content) => {
                  const TypeIcon = getTypeIcon(content.type);
              
              return (
                <div
                  key={content.id}
                  className="p-4 border rounded-lg cursor-pointer transition-all duration-200 bg-gray-50/50 hover:bg-accent hover:shadow-md hover:border-primary/50"
                  onClick={() => setSelectedContent(content.id)}
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
                              {content.id}
                            </Badge>
                            {content.title && <h4 className="font-medium text-sm">{content.title}</h4>}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(content.priority)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Fecha y hora de reporte + Usuario */}
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(content.submittedAt).toLocaleDateString('es-CO', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                <span className="ml-1">
                                  (hace {Math.floor((Date.now() - new Date(content.submittedAt).getTime()) / (1000 * 60 * 60))}h)
                                </span>
                              </span>
                            </div>
                            
                            <Separator orientation="vertical" className="h-3" />
                            
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Reportado por: <span className="font-medium">{content.submittedBy}</span></span>
                            </div>
                          </div>
                          
                          {/* Cantidad de diagnósticos previos */}
                          {content.votesCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{content.votesCount} diagnósticos humanos</span>
                            </div>
                          )}
                          
                          {/* Consenso Humano + IA: Porcentaje de coincidencia */}
                          <div className="flex items-center space-x-1 text-xs">
                            <Gauge className="h-3 w-3 text-purple-600" />
                            <span className="text-muted-foreground">Consenso Humano + IA:</span>
                            {(() => {
                              const humanMarkers = content.consensusMarkers || [];
                              const aiMarkers = content.aiAnalysis?.detectedMarkers || [];
                              
                              // Si no hay consenso humano todavía
                              if (humanMarkers.length === 0) {
                                return (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-300">
                                    Sin datos
                                  </Badge>
                                );
                              }
                              
                              // Calcular coincidencia
                              const commonMarkers = humanMarkers.filter(marker => aiMarkers.includes(marker));
                              const totalUniqueMarkers = new Set([...humanMarkers, ...aiMarkers]).size;
                              const coincidencePercentage = totalUniqueMarkers > 0 
                                ? Math.round((commonMarkers.length / totalUniqueMarkers) * 100) 
                                : 0;
                              
                              // Determinar color basado en el porcentaje
                              const coincidenceColor = coincidencePercentage >= 70
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : coincidencePercentage >= 40
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : 'bg-red-100 text-red-700 border-red-300';
                              
                              return (
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${coincidenceColor}`}>
                                  {coincidencePercentage}% coincidencia
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Diagnóstico desinfodémico unificado */}
                          {(() => {
                            // Priorizar diagnóstico consensuado si existe, sino mostrar el de Botilito
                            const marcadores = content.consensusMarkers && content.consensusMarkers.length > 0 
                              ? content.consensusMarkers 
                              : content.aiAnalysis.detectedMarkers || [];
                            const isConsensus = content.consensusMarkers && content.consensusMarkers.length > 0;
                            const IconComponent = isConsensus ? Users : Bot;
                            
                            if (marcadores.length === 0) return null;
                            
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <IconComponent className="h-3 w-3" />
                                  <span>Diagnóstico desinfodémico:</span>
                                  {!isConsensus && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1 bg-blue-50 text-blue-700 border-blue-200">
                                      analizado solo por Botilito
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  {marcadores.map((marcadorId, index) => {
                                    const marcador = getMarcador(marcadorId);
                                    if (!marcador) return null;
                                    return (
                                      <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className={`text-xs px-2 py-0.5 ${getMarcadorBadgeColor(marcadorId)}`}
                                      >
                                        {marcador.label}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* URL a la noticia original si existe */}
                          {content.url && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <Link className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{content.url}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
              })()}
            </div>
            
            {/* Controles de paginación */}
            {pendingContents.length > casesPerPage && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * casesPerPage) + 1} - {Math.min(currentPage * casesPerPage, pendingContents.length)} de {pendingContents.length} casos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(pendingContents.length / casesPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-primary text-primary-foreground" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(pendingContents.length / casesPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(pendingContents.length / casesPerPage)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // FLUJO NUEVO: Si hay contenido seleccionado, mostrar el laboratorio completo
  return (
    <div className="space-y-6">
      {/* Franja de Botilito para el detalle del caso */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img 
            src={botilitoImage} 
            alt="Botilito" 
            className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
          />
          <div className="flex-1">
            <p className="text-xl">
              ¡Ey parcero! Acá tienes el detalle completo de este caso 🔬👀
            </p>
            <p className="text-sm mt-1 opacity-80">
              Ya hice mi análisis, pero ahora vos y tu experiencia pueden afinar el diagnóstico. ¿Cómo lo ves? Dale duro al análisis! 💪
            </p>
          </div>
        </div>
      </div>

      {/* Botón para volver a la lista */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => setSelectedContent(null)}
          className="border-2 border-gray-300 hover:border-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista de casos
        </Button>
      </div>

      {/* Laboratorio de diagnóstico completo */}
      <Card>
        <CardHeader>
          {/* Franja unificada con toda la info del caso */}
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-6 py-4 rounded-lg border-2 border-primary/30 mb-4">
            {/* Código del caso */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Código del Caso</p>
                <p className="font-mono font-medium">{selectedContentData.id}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-12" />

            {/* Prioridad */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prioridad</p>
              {getPriorityBadge(selectedContentData.priority)}
            </div>

            <Separator orientation="vertical" className="h-12" />

            {/* Reportado por */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reportado por</p>
                <p className="text-sm font-medium">{selectedContentData.submittedBy}</p>
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
                  {new Date(selectedContentData.submittedAt).toLocaleDateString('es-CO', {
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

          {/* Título de la sección */}
          <CardTitle className="flex items-center space-x-2">
            <Microscope className="h-5 w-5 text-primary" />
            <span>Análisis Especializado del Caso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Details */}
          <div>
            <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
              {/* Captura de la noticia con etiquetas superpuestas */}
              {selectedContentData.screenshot && (
                <div>
                  <Label>Captura de la noticia:</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border-2 border-secondary/40 relative max-h-48">
                    <img 
                      src={selectedContentData.screenshot} 
                      alt="Captura de la noticia" 
                      className="w-full h-48 object-cover object-top"
                    />
                  </div>
                </div>
              )}
              
              {/* Fuente y tema */}
              {(selectedContentData.source || selectedContentData.theme) && (
                <div className="flex flex-wrap items-center gap-4 pb-2">
                  {/* Fuente de la noticia */}
                  {selectedContentData.source && (
                    <div className="flex items-center space-x-2">
                      <Newspaper className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Fuente:</Label>
                      <a 
                        href={selectedContentData.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-secondary/60 hover:bg-secondary text-secondary-foreground rounded-md transition-colors text-xs no-hover-effect"
                      >
                        <span>{selectedContentData.source.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {/* Tema del contenido */}
                  {selectedContentData.theme && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <Label className="text-sm">Tema:</Label>
                      <Badge variant="outline" className="text-xs border-primary/40 bg-primary/10">
                        {selectedContentData.theme}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {/* Titular de la noticia */}
              {selectedContentData.headline && (
                <div>
                  <Label>Titular de la noticia:</Label>
                  <div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg">
                    <p className="font-medium">{selectedContentData.headline}</p>
                  </div>
                </div>
              )}
              
              {/* Contenido analizado */}
              <div>
                <Label>Contenido analizado:</Label>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {selectedContentData.type === 'text' ? 
                    selectedContentData.content : 
                    selectedContentData.description || selectedContentData.content
                  }
                </p>
              </div>
            </div>

            {/* Evaluación epidemiológica */}
            {selectedContentData.aiAnalysis.summary && (
              <div className="mt-6">
                <Label>Evaluación epidemiológica:</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedContentData.aiAnalysis.summary}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Comparativa de Diagnósticos: Botilito vs Verificadores Humanos */}
          <div>
            <Label className="mb-4 flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-primary" />
              <span>Comparativa de Diagnósticos</span>
            </Label>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Columna 1: Diagnóstico de Botilito (IA) */}
              <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Diagnóstico de Botilito</h3>
                    <p className="text-xs text-muted-foreground">Análisis inicial de IA</p>
                  </div>
                </div>
                
                {/* Etiquetas de Botilito - SIN porcentajes */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Marcadores detectados:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedContentData.aiAnalysis.detectedMarkers?.map((marcadorId) => {
                      const marcador = getMarcador(marcadorId);
                      if (!marcador) return null;
                      const Icon = marcador.icon;
                      
                      return (
                        <Badge 
                          key={marcadorId}
                          variant="outline"
                          className="bg-white border-gray-300"
                        >
                          <Icon className={`h-4 w-4 mr-1.5 ${marcador.color}`} />
                          {marcador.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                {/* Comentario de Botilito */}
                {selectedContentData.aiAnalysis.summary && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>Análisis:</span>
                    </Label>
                    <p className="text-sm mt-1">{selectedContentData.aiAnalysis.summary}</p>
                  </div>
                )}
              </div>

              {/* Columna 2: Diagnóstico de Verificadores Humanos */}
              <div className="space-y-4 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Diagnóstico de Verificadores</h3>
                      <p className="text-xs text-muted-foreground">Consenso humano</p>
                    </div>
                  </div>
                  {/* Número de verificadores */}
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-300">
                    <Users className="h-3 w-3 mr-1" />
                    12 verificadores
                  </Badge>
                </div>
                
                {/* Etiquetas de Verificadores - CON porcentajes */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Marcadores por consenso:</Label>
                  <div className="space-y-2">
                    {/* Simulamos datos de consenso basados en los marcadores de IA */}
                    {selectedContentData.aiAnalysis.detectedMarkers?.map((marcadorId, index) => {
                      const marcador = getMarcador(marcadorId);
                      if (!marcador) return null;
                      const Icon = marcador.icon;
                      
                      // Porcentajes simulados de consenso (en producción vendrían de la BD)
                      const consensusPercentages = [92, 83, 75];
                      const percentage = consensusPercentages[index] || 70;
                      
                      return (
                        <div key={marcadorId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${marcador.color}`} />
                            <span className="text-sm">{marcador.label}</span>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Marcadores de Diagnóstico Desinfodémico */}
          <div>
            <Label className="mb-3 flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Marcadores de Diagnóstico Desinfodémico</span>
            </Label>
            <p className="text-xs text-muted-foreground mb-4">
              Selecciona los marcadores que apliquen. Al seleccionar cada uno, puedes justificar tu elección y agregar enlaces de soporte.
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {ETIQUETAS_CATEGORIAS.map((marcador) => {
                const Icon = marcador.icon;
                const isSelected = marcadoresDiagnostico.includes(marcador.id);
                
                return (
                  <div 
                    key={marcador.id}
                    className={`border-2 rounded-lg transition-all ${
                      isSelected 
                        ? `${marcador.border} ${marcador.bg} shadow-sm col-span-3` 
                        : 'border-gray-200 hover:border-primary/30 hover:bg-accent/30'
                    }`}
                  >
                    {/* Header del marcador - siempre visible */}
                    <div 
                      className="flex items-start space-x-3 p-4 cursor-pointer"
                      onClick={() => toggleMarcadorDiagnostico(marcador.id)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleMarcadorDiagnostico(marcador.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className={`h-5 w-5 ${marcador.color}`} />
                          <Label className="cursor-pointer font-medium">
                            {marcador.label}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {marcador.descripcion}
                        </p>
                      </div>
                    </div>
                    
                    {/* Área expandida con justificación y enlace - solo cuando está seleccionado */}
                    {isSelected && (
                      <div className="px-4 pb-4 space-y-3 border-t pt-3 mt-2">
                        {/* Campo de justificación */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>Justificación:</span>
                          </Label>
                          <Textarea
                            placeholder={`Explica por qué este contenido presenta características de "${marcador.label}"...`}
                            value={marcadoresJustificaciones[marcador.id] || ''}
                            onChange={(e) => updateMarcadorJustificacion(marcador.id, e.target.value)}
                            className="text-sm resize-none"
                            rows={3}
                          />
                        </div>
                        
                        {/* Campo de enlace de soporte */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1">
                            <Link2 className="h-3 w-3" />
                            <span>Enlace de soporte (opcional):</span>
                          </Label>
                          <Input
                            type="url"
                            placeholder="https://ejemplo.com/fuente-verificacion"
                            value={marcadoresEnlaces[marcador.id] || ''}
                            onChange={(e) => updateMarcadorEnlace(marcador.id, e.target.value)}
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Agrega un enlace a fuentes, artículos o evidencia que respalde tu diagnóstico
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Verification Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Notas de diagnóstico</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Agrega observaciones, fuentes consultadas, o cualquier información relevante sobre tu diagnóstico..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={4}
              className="resize-none border border-gray-300"
            />
          </div>

          <Separator />

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {marcadoresDiagnostico.length > 0 && (
                <p className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{marcadoresDiagnostico.length} marcador(es) seleccionado(s)</span>
                </p>
              )}
            </div>
            <Button 
              onClick={handleVerificationSubmit}
              disabled={marcadoresDiagnostico.length === 0}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar diagnóstico humano
            </Button>
          </div>

          {marcadoresDiagnostico.length === 0 && (
            <Alert className="bg-[rgb(255,140,140)]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-[rgb(0,0,0)]">
                Debes seleccionar al menos un marcador de diagnóstico
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Sección de Verificaciones de Otros y Debate - Grid 2 columnas */}
          <div className="grid grid-cols-2 gap-6">
            {/* Columna 1: Verificaciones de Otros Verificadores */}
            <div className="space-y-4 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Verificaciones de Otros Colegas</h3>
              </div>

              {/* Lista de verificaciones de otros verificadores */}
              <div className="space-y-4">
                {/* Verificador 1 */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Carlos Ramírez</p>
                        <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>

                  {/* Marcadores seleccionados */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Marcadores:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {['enganoso', 'sensacionalista'].map((marcadorId) => {
                        const marcador = getMarcador(marcadorId);
                        if (!marcador) return null;
                        const Icon = marcador.icon;
                        return (
                          <Badge 
                            key={marcadorId}
                            variant="outline"
                            className="bg-white border-gray-300 text-xs"
                          >
                            <Icon className={`h-3 w-3 mr-1 ${marcador.color}`} />
                            {marcador.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notas del verificador */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Notas de diagnóstico:</Label>
                    <p className="text-sm p-2 bg-accent/20 rounded-md">
                      El titular usa lenguaje sensacionalista sin evidencia científica respaldada. No encontré estudios de Harvard que confirmen esto.
                    </p>
                  </div>
                </div>

                {/* Verificador 2 */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ana Martínez</p>
                        <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>

                  {/* Marcadores seleccionados */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Marcadores:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {['enganoso', 'no_verificable'].map((marcadorId) => {
                        const marcador = getMarcador(marcadorId);
                        if (!marcador) return null;
                        const Icon = marcador.icon;
                        return (
                          <Badge 
                            key={marcadorId}
                            variant="outline"
                            className="bg-white border-gray-300 text-xs"
                          >
                            <Icon className={`h-3 w-3 mr-1 ${marcador.color}`} />
                            {marcador.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notas del verificador */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Notas de diagnóstico:</Label>
                    <p className="text-sm p-2 bg-accent/20 rounded-md">
                      Coincido con Carlos. Además, la fuente "Noticias Falsas" no tiene credibilidad verificada. No hay manera de validar la información presentada.
                    </p>
                  </div>
                </div>

                {/* Verificador 3 */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Diego Torres</p>
                        <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>

                  {/* Marcadores seleccionados */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Marcadores:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {['enganoso', 'sensacionalista', 'no_verificable'].map((marcadorId) => {
                        const marcador = getMarcador(marcadorId);
                        if (!marcador) return null;
                        const Icon = marcador.icon;
                        return (
                          <Badge 
                            key={marcadorId}
                            variant="outline"
                            className="bg-white border-gray-300 text-xs"
                          >
                            <Icon className={`h-3 w-3 mr-1 ${marcador.color}`} />
                            {marcador.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notas del verificador */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Notas de diagnóstico:</Label>
                    <p className="text-sm p-2 bg-accent/20 rounded-md">
                      Busqué en PubMed y Google Scholar. No hay estudios recientes de Harvard sobre limón y diabetes. Claramente engañoso y peligroso para personas diabéticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Comentarios y Debate Libre */}
            <div className="space-y-4 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Comentarios y Debate</h3>
              </div>

              {/* Lista de comentarios */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {/* Comentario 1 */}
                <div className="border-l-2 border-primary/30 pl-3 py-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">Carlos Ramírez</p>
                        <span className="text-xs text-muted-foreground">Hace 2 horas</span>
                      </div>
                      <p className="text-sm">
                        Parceros, revisé la base de datos de Harvard Medical School y no hay nada publicado sobre esto. Es claramente fake news.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario 2 */}
                <div className="border-l-2 border-primary/30 pl-3 py-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">Ana Martínez</p>
                        <span className="text-xs text-muted-foreground">Hace 3 horas</span>
                      </div>
                      <p className="text-sm">
                        Totalmente de acuerdo. Además, vi que esta misma noticia circuló el año pasado con otro titular. Están reciclando desinformación.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario 3 */}
                <div className="border-l-2 border-primary/30 pl-3 py-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">Diego Torres</p>
                        <span className="text-xs text-muted-foreground">Hace 5 horas</span>
                      </div>
                      <p className="text-sm">
                        ¿Alguien logró contactar al medio "Noticias Falsas"? Deberíamos verificar si existe realmente o es una web fantasma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario 4 */}
                <div className="border-l-2 border-primary/30 pl-3 py-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">Laura Gómez</p>
                        <span className="text-xs text-muted-foreground">Hace 6 horas</span>
                      </div>
                      <p className="text-sm">
                        Chequeé el dominio y fue registrado hace solo 2 meses. Definitivamente no es una fuente confiable. Marquemos esto como alta prioridad.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario 5 */}
                <div className="border-l-2 border-primary/30 pl-3 py-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium">Sofía Vargas</p>
                        <span className="text-xs text-muted-foreground">Hace 8 horas</span>
                      </div>
                      <p className="text-sm">
                        Este tipo de contenido es peligroso porque la gente diabética podría abandonar su tratamiento. Debemos ser contundentes con el marcador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campo para agregar nuevo comentario */}
              <div className="border-t pt-4 mt-4">
                <Label className="text-xs text-muted-foreground mb-2">Agregar comentario:</Label>
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Comparte tus observaciones con los demás verificadores..."
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <Button size="sm" className="bg-primary hover:bg-primary/90 self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de éxito gamificado */}
      {renderSuccessDialog()}
    </div>
  );
}
