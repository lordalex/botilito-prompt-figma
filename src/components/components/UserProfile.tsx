import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Trophy, 
  Target, 
  Activity, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Microscope, 
  Skull, 
  Ban, 
  Flame,
  Award,
  Star,
  Lock,
  Camera,
  Edit3,
  Settings,
  Zap,
  Brain,
  Crown,
  Medal,
  Sparkles,
  Gift,
  Coffee,
  Bot,
  Globe,
  Users,
  FileText,
  BarChart3,
  TrendingDown,
  Siren,
  Crosshair,
  Stethoscope,
  HeartPulse,
  Syringe,
  Copy,
  Share2,
  UserPlus,
  Send,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  type: 'weekly' | 'special' | 'daily';
  deadline: string;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  levelRequired: number;
}

interface Level {
  level: number;
  title: string;
  subtitle: string;
  minXP: number;
  maxXP: number;
  color: string;
  badge: string;
  perks: string[];
  responsibilities: string[];
}

interface Referral {
  id: string;
  name: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'completed';
  xpEarned: number;
}

export function UserProfile() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(12);
  const [referralCode, setReferralCode] = useState('BOTILITO-MG2024');

  // Sistema de niveles epidemiológicos
  const levels: Level[] = [
    { 
      level: 1, 
      title: 'VIGILANTE CENTINELA', 
      subtitle: 'Primera Línea de Defensa',
      minXP: 0, 
      maxXP: 500, 
      color: 'bg-blue-500', 
      badge: '👁️',
      perks: [
        'Reportar contenido sospechoso (+10 XP)',
        'Acceso al dashboard básico',
        'Alertas de brotes detectados',
        'Sistema de referidos activo'
      ],
      responsibilities: [
        'Detectar contenido potencialmente peligroso',
        'Alertar sobre posibles brotes de desinformación',
        'Ser los ojos y oídos de la comunidad digital'
      ]
    },
    { 
      level: 2, 
      title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', 
      subtitle: 'Analista de Contagio',
      minXP: 500, 
      maxXP: 2000, 
      color: 'bg-purple-500', 
      badge: '🔬',
      perks: [
        'Realizar diagnósticos completos (+20 XP)',
        'Aplicar etiquetas y marcadores',
        'Evaluar virulencia del contenido',
        'Calificar análisis de otros usuarios',
        'Participar en desafíos semanales',
        'Invitar a nuevos validadores (+5 XP c/u)'
      ],
      responsibilities: [
        'Analizar muestras de desinformación',
        'Aplicar criterios epidemiológicos',
        'Documentar patrones de transmisión',
        'Contribuir al aprendizaje colectivo'
      ]
    },
    { 
      level: 3, 
      title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', 
      subtitle: 'Educomunicador Estratégico',
      minXP: 2000, 
      maxXP: 999999, 
      color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500', 
      badge: '💉',
      perks: [
        'Crear contenido de inmunización (+100 XP)',
        'Diseñar contra-narrativas efectivas',
        'Liderar misiones complejas',
        'Análisis macro de campañas coordinadas',
        'Identificar patrones de contagio global',
        'Palabra respetada en la comunidad',
        'Herramientas de prevención avanzadas'
      ],
      responsibilities: [
        'Vacunar contra la desinformación',
        'Prevenir próximos brotes epidémicos',
        'Liderar estrategias de inmunización',
        'Mantener protegido el ecosistema digital',
        'Formar a nuevos epidemiólogos'
      ]
    }
  ];

  // Datos del usuario actual
  const userData = {
    id: 'BOT-COL-2024-001',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@botilito.co',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaRodriguez&backgroundColor=ffda00',
    joinedAt: '2024-09-15',
    currentXP: 850,
    totalReports: 45,
    totalDiagnosis: 28,
    totalImmunizations: 3,
    accuracyRate: 92.5,
    currentStreak: dailyStreak,
    rank: 87,
    totalUsers: 1250,
    region: 'Región Andina',
    verificationSpeed: 3.8,
    referralsCompleted: 4
  };

  // Calcular nivel actual
  const getCurrentLevel = (xp: number): Level => {
    return levels.find(level => xp >= level.minXP && xp < level.maxXP) || levels[levels.length - 1];
  };

  const currentLevel = getCurrentLevel(userData.currentXP);
  const nextLevel = levels.find(level => level.level === currentLevel.level + 1);
  const progressToNext = nextLevel ? 
    ((userData.currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  // Insignias desbloqueables por nivel
  const badges: Badge[] = [
    {
      id: 'alerta-temprana',
      name: 'Alerta Temprana',
      description: 'Insignia de Nivel 1: Vigilante Centinela',
      icon: <Siren className="h-5 w-5" />,
      color: 'bg-blue-500',
      unlocked: userData.currentXP >= 0,
      unlockedAt: userData.joinedAt,
      levelRequired: 1
    },
    {
      id: 'analista-contagio',
      name: 'Analista de Contagio',
      description: 'Insignia de Nivel 2: Epidemiólogo Digital Voluntario',
      icon: <Microscope className="h-5 w-5" />,
      color: 'bg-purple-500',
      unlocked: userData.currentXP >= 500,
      unlockedAt: userData.currentXP >= 500 ? '2024-10-02' : undefined,
      levelRequired: 2
    },
    {
      id: 'estratega-antiviral',
      name: 'Estratega Antiviral',
      description: 'Insignia de Nivel 3: Especialista en Inmunología Informativa',
      icon: <Syringe className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      unlocked: userData.currentXP >= 2000,
      unlockedAt: undefined,
      levelRequired: 3
    },
    {
      id: 'detector-100',
      name: 'Detector Prolífico',
      description: 'Reportaste 100 casos sospechosos',
      icon: <Eye className="h-5 w-5" />,
      color: 'bg-green-500',
      unlocked: false,
      levelRequired: 1
    },
    {
      id: 'racha-fuego',
      name: 'Llama Inextinguible',
      description: 'Mantén una racha de 30 días consecutivos',
      icon: <Flame className="h-5 w-5" />,
      color: 'bg-orange-500',
      unlocked: false,
      levelRequired: 1
    },
    {
      id: 'precision-quirurgica',
      name: 'Precisión Quirúrgica',
      description: '95%+ de precisión en 50 diagnósticos',
      icon: <Crosshair className="h-5 w-5" />,
      color: 'bg-red-500',
      unlocked: false,
      levelRequired: 2
    }
  ];

  // Misiones activas
  const missions: Mission[] = [
    {
      id: 'escuadron-anti-panico',
      title: 'Misión: Escuadrón Anti-Pánico',
      description: 'Desmentir los 3 fakes más virales sobre la economía esta semana',
      xpReward: 150,
      progress: 1,
      target: 3,
      type: 'weekly',
      deadline: '2025-10-19',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-red-500',
      completed: false
    },
    {
      id: 'diagnostico-rapido',
      title: 'Desafío: Diagnóstico Rápido',
      description: 'Realiza 10 análisis esta semana',
      xpReward: 100,
      progress: 7,
      target: 10,
      type: 'weekly',
      deadline: '2025-10-19',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-yellow-500',
      completed: false
    },
    {
      id: 'centinela-diario',
      title: 'Reto Diario: Vigilancia Activa',
      description: 'Reporta al menos 3 contenidos sospechosos hoy',
      xpReward: 50,
      progress: 2,
      target: 3,
      type: 'daily',
      deadline: '2025-10-12',
      icon: <Eye className="h-5 w-5" />,
      color: 'bg-blue-500',
      completed: false
    },
    {
      id: 'inmunizador-regional',
      title: 'Misión Especial: Inmunizador Regional',
      description: 'Crea contenido educativo sobre un tema desinfodémico de tu región',
      xpReward: 200,
      progress: 0,
      target: 1,
      type: 'special',
      deadline: '2025-10-26',
      icon: <Syringe className="h-5 w-5" />,
      color: 'bg-purple-500',
      completed: false
    }
  ];

  // Referidos del usuario
  const referrals: Referral[] = [
    {
      id: 'REF-001',
      name: 'Carlos Pérez',
      joinedAt: '2024-10-05',
      status: 'completed',
      xpEarned: 5
    },
    {
      id: 'REF-002',
      name: 'Ana Martínez',
      joinedAt: '2024-10-08',
      status: 'completed',
      xpEarned: 5
    },
    {
      id: 'REF-003',
      name: 'Luis Gómez',
      joinedAt: '2024-10-10',
      status: 'active',
      xpEarned: 5
    },
    {
      id: 'REF-004',
      name: 'Diana López',
      joinedAt: '2024-10-11',
      status: 'completed',
      xpEarned: 5
    }
  ];

  const totalReferralXP = referrals.reduce((sum, ref) => sum + ref.xpEarned, 0);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  // Copiar código de referido
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    // Aquí podrías mostrar un toast de confirmación
  };

  // Simular animación de level up
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.9) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 relative"
    >
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
              ¡Qué más parce! Este es tu espacio personal 👤✨
            </p>
            <p className="text-sm mt-1 opacity-80">
              Acá está tu nivel, XP, insignias y misiones. Mientras más analices, más subes de nivel. ¡A darle con toda! 💪🏆
            </p>
          </div>
        </div>
      </div>

      {/* Notificación de Level Up - Estilo colombiano */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="border-4 border-primary bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎉🔬</div>
                <h2 className="mb-2">¡OMBE, SUBISTE DE NIVEL PARCE!</h2>
                <p className="text-lg mb-2">Ahora sos un/a:</p>
                <Badge className="bg-purple-500 text-white text-lg px-4 py-2 mb-3">
                  🔬 EPIDEMIÓLOGO DIGITAL VOLUNTARIO
                </Badge>
                <p className="text-sm text-muted-foreground mb-4">Ya puedes hacer diagnósticos completos y participar en misiones especiales</p>
                <Badge className="bg-primary text-primary-foreground">+20 XP por análisis</Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header del Perfil Epidemiológico */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
        <CardContent className="pt-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar y Nivel */}
            <div className="flex items-start space-x-6">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => setShowAvatarModal(true)}
                      title="Cambiar foto de perfil"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
                
                {/* Badge del Nivel Actual */}
                <motion.div 
                  className="absolute -top-2 -left-2"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className={`${currentLevel.color} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg border-2 border-white`}>
                    <div className="text-2xl">{currentLevel.badge}</div>
                    <div className="text-xs">Nv.{currentLevel.level}</div>
                  </div>
                </motion.div>
              </div>
              
              {/* Información Básica */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl">{userData.name}</h1>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <Badge className={`${currentLevel.color} text-white`}>
                      {currentLevel.title}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {userData.region}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">"{currentLevel.subtitle}"</p>
                </div>
                
                {/* Barra de Experiencia */}
                <div className="w-80">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Experiencia (XP)</span>
                    <span>{userData.currentXP.toLocaleString()} / {nextLevel?.minXP.toLocaleString() || 'MAX'} XP</span>
                  </div>
                  <div className="relative">
                    <Progress value={progressToNext} className="h-3" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: [-100, 300] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </div>
                  {nextLevel && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ¡Te faltan {(nextLevel.minXP - userData.currentXP).toLocaleString()} XP para ser {nextLevel.title}!
                    </p>
                  )}
                  {!nextLevel && (
                    <p className="text-xs text-green-600 mt-1">
                      🌟 ¡Nivel máximo alcanzado! Sos un verdadero Especialista en Inmunología Informativa
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas de Contribución */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-center mb-1">
                  <Eye className="h-4 w-4 text-blue-600 mr-1" />
                  <div className="text-2xl text-blue-700">{userData.totalReports}</div>
                </div>
                <div className="text-xs text-blue-600 mb-1">Reportes</div>
                <Badge className="bg-blue-500 text-white text-xs">+10 XP c/u</Badge>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-center mb-1">
                  <Microscope className="h-4 w-4 text-purple-600 mr-1" />
                  <div className="text-2xl text-purple-700">{userData.totalDiagnosis}</div>
                </div>
                <div className="text-xs text-purple-600 mb-1">Diagnósticos</div>
                <Badge className="bg-purple-500 text-white text-xs">+20 XP c/u</Badge>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-center mb-1">
                  <Syringe className="h-4 w-4 text-orange-600 mr-1" />
                  <div className="text-2xl text-orange-700">{userData.totalImmunizations}</div>
                </div>
                <div className="text-xs text-orange-600 mb-1">Inmunizaciones</div>
                <Badge className="bg-orange-500 text-white text-xs">+100 XP c/u</Badge>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-green-600 mr-1" />
                  <div className="text-2xl text-green-700">{userData.accuracyRate}%</div>
                </div>
                <div className="text-xs text-green-600 mb-1">Precisión</div>
                <Badge className="bg-green-500 text-white text-xs">Excelente</Badge>
              </motion.div>
            </div>
          </div>

          {/* Racha Diaria */}
          <div className="mt-6 pt-6 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Racha de Vigilancia</p>
                  <p className="text-sm text-muted-foreground">
                    ¡Llevás {dailyStreak} días consecutivos protegiendo la verdad!
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-orange-600">{dailyStreak}</div>
                <div className="text-xs text-orange-600">días 🔥</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Misiones y Desafíos Activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Misiones y Desafíos Activos</span>
            <Badge variant="secondary">{missions.filter(m => !m.completed).length}</Badge>
          </CardTitle>
          <CardDescription>¡Completá misiones y ganá XP adicional, parce! 🎯</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mission.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-primary/20 bg-gradient-to-br from-white to-secondary/10 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 rounded-full ${mission.color} text-white flex-shrink-0`}>
                    {mission.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{mission.title}</h4>
                      <Badge className={`text-xs ${mission.type === 'daily' ? 'bg-blue-500' : mission.type === 'weekly' ? 'bg-purple-500' : 'bg-orange-500'} text-white`}>
                        {mission.type === 'daily' ? 'Diario' : mission.type === 'weekly' ? 'Semanal' : 'Especial'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progreso</span>
                    <span className="font-medium">{mission.progress} / {mission.target}</span>
                  </div>
                  <Progress value={(mission.progress / mission.target) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      +{mission.xpReward} XP
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(mission.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Referidos */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>¡Invitá a tu Parce!</span>
            <Badge className="bg-primary text-primary-foreground">{referrals.length} referidos</Badge>
          </CardTitle>
          <CardDescription>
            Ganás 5 XP por cada persona que invites y complete su primer diagnóstico. ¡Hagamos crecer el equipo! 💪
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Código de Referido */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30">
              <p className="text-sm mb-2">Tu código de referido:</p>
              <div className="flex items-center space-x-2">
                <Input 
                  value={referralCode} 
                  readOnly 
                  className="bg-white text-lg text-center tracking-wider"
                />
                <Button 
                  onClick={copyReferralCode}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Estadísticas de Referidos */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl text-blue-600">{referrals.length}</div>
                <div className="text-xs text-blue-600">Total Invitados</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl text-green-600">{referrals.filter(r => r.status === 'completed').length}</div>
                <div className="text-xs text-green-600">Activos</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl text-yellow-600">{totalReferralXP}</div>
                <div className="text-xs text-yellow-600">XP Ganados</div>
              </div>
            </div>

            {/* Lista de Referidos */}
            {referrals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Tus referidos:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {referrals.map((referral, index) => (
                    <div 
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-secondary">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${referral.name.replace(' ', '')}&backgroundColor=${
                              index === 0 ? 'ffda00' : 
                              index === 1 ? 'ffe97a' : 
                              index === 2 ? '00b4d8' : 
                              'f72585'
                            }`} 
                            alt={referral.name}
                          />
                          <AvatarFallback className="text-xs bg-secondary">
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{referral.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Unido: {new Date(referral.joinedAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${
                          referral.status === 'completed' ? 'bg-green-500' : 
                          referral.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                        } text-white`}>
                          {referral.status === 'completed' ? '✓ Completado' : 
                           referral.status === 'active' ? 'Activo' : 'Pendiente'}
                        </Badge>
                        {referral.status === 'completed' && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            +{referral.xpEarned} XP
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insignias Desbloqueadas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insignias Activas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Insignias Desbloqueadas</span>
              <Badge variant="secondary">{unlockedBadges.length}</Badge>
            </CardTitle>
            <CardDescription>Tus medallas en la lucha por la verdad 🏆</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {unlockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-white to-secondary/10 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-full ${badge.color} text-white flex-shrink-0`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{badge.name}</h4>
                        <Badge className="bg-green-500 text-white text-xs">
                          Nivel {badge.levelRequired}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      {badge.unlockedAt && (
                        <div className="text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Desbloqueada: {new Date(badge.unlockedAt).toLocaleDateString('es-CO')}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insignias Bloqueadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <span>Próximas Insignias</span>
              <Badge variant="outline">{lockedBadges.length}</Badge>
            </CardTitle>
            <CardDescription>¡Seguí trabajando para desbloquearlas!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {lockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-all hover:bg-muted/30"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-3 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-muted-foreground">{badge.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Nivel {badge.levelRequired}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresión de Niveles Epidemiológicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span>Tu Carrera como Epidemiólogo Digital</span>
          </CardTitle>
          <CardDescription>
            Tu evolución en la lucha contra el virus de la desinformación 🦠
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {levels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border-2 transition-all ${
                  level.level === currentLevel.level
                    ? 'border-primary bg-primary/5 shadow-md'
                    : level.level < currentLevel.level
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-200 bg-gray-50/30 opacity-70'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Badge del Nivel */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl ${
                    level.level <= currentLevel.level ? level.color : 'bg-gray-400'
                  } shadow-lg flex-shrink-0`}>
                    {level.badge}
                  </div>
                  
                  {/* Información del Nivel */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold">Nivel {level.level}: {level.title}</h3>
                          {level.level === currentLevel.level && (
                            <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">
                              ⭐ NIVEL ACTUAL
                            </Badge>
                          )}
                          {level.level < currentLevel.level && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground italic">{level.subtitle}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{level.minXP.toLocaleString()} - {level.maxXP === 999999 ? '∞' : level.maxXP.toLocaleString()} XP</div>
                        {level.level === currentLevel.level && (
                          <div className="text-xs text-primary">{progressToNext.toFixed(0)}% completado</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Beneficios y Responsabilidades */}
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-600">✓ Beneficios:</h4>
                        <ul className="space-y-1">
                          {level.perks.map((perk, idx) => (
                            <li key={idx} className="text-xs flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-blue-600">🎯 Responsabilidades:</h4>
                        <ul className="space-y-1">
                          {level.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-xs flex items-start space-x-2">
                              <Target className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking y Comunidad */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ranking Global */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Ranking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <div className="text-4xl">#{userData.rank}</div>
                <div className="text-sm text-muted-foreground">de {userData.totalUsers.toLocaleString()} vigilantes</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Top {((userData.rank / userData.totalUsers) * 100).toFixed(1)}%
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span>Región:</span>
                  <span className="font-medium">{userData.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Miembro desde:</span>
                  <span className="font-medium">
                    {new Date(userData.joinedAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Velocidad de Análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Velocidad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <div className="flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                  <div className="text-4xl text-yellow-600">{userData.verificationSpeed}m</div>
                </div>
                <div className="text-sm text-muted-foreground">Tiempo promedio de análisis</div>
                <Badge className="bg-yellow-500 text-white text-xs mt-2">
                  ⚡ Verificación Rápida
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impacto Total */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              <span>Impacto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl text-red-600">
                  {userData.totalReports + userData.totalDiagnosis + userData.totalImmunizations}
                </div>
                <div className="text-sm text-muted-foreground">Casos totales</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1 text-blue-500" />
                    Reportes
                  </span>
                  <span className="font-medium">{userData.totalReports}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="flex items-center">
                    <Microscope className="h-3 w-3 mr-1 text-purple-500" />
                    Diagnósticos
                  </span>
                  <span className="font-medium">{userData.totalDiagnosis}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="flex items-center">
                    <Syringe className="h-3 w-3 mr-1 text-orange-500" />
                    Inmunizaciones
                  </span>
                  <span className="font-medium">{userData.totalImmunizations}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Cambio de Avatar */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-primary" />
                    <span>Cambiar Foto de Perfil</span>
                  </CardTitle>
                  <CardDescription>
                    Personaliza tu avatar epidemiológico
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar Actual */}
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground text-center">
                      {userData.name}
                    </p>
                  </div>

                  <Separator />

                  {/* Opciones de Cambio */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        // Simular clic en input file
                        alert('¡Próximamente! Podrás subir tu propia foto 📸');
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir nueva foto
                    </Button>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {/* Avatares digitales de ejemplo */}
                      {[
                        { style: 'avataaars', seed: 'Felix', bg: 'ffda00' },
                        { style: 'bottts', seed: 'Robot1', bg: 'ffe97a' },
                        { style: 'avataaars', seed: 'Aneka', bg: 'ff6b35' },
                        { style: 'personas', seed: 'Digital1', bg: '00b4d8' },
                        { style: 'avataaars', seed: 'Sofia', bg: 'f72585' },
                        { style: 'bottts', seed: 'Bot2024', bg: '7209b7' },
                        { style: 'personas', seed: 'Alex', bg: '06ffa5' },
                        { style: 'avataaars', seed: 'Carlos', bg: 'ffd60a' },
                      ].map((avatar, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            alert(`Avatar ${idx + 1} seleccionado. En la versión final, esto cambiará tu foto de perfil.`);
                            setShowAvatarModal(false);
                          }}
                          className="relative group"
                        >
                          <Avatar className="h-16 w-16 border-2 border-gray-200 hover:border-primary transition-all cursor-pointer hover:scale-110 shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}&backgroundColor=${avatar.bg}`} />
                            <AvatarFallback>#{idx + 1}</AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 rounded-full transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Botones de Acción */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowAvatarModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setShowAvatarModal(false);
                        alert('¡Avatar actualizado con éxito! 🎉');
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
