import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, Shield, 
  Zap, Clock, MapPin, Users, Globe, Bug, Stethoscope, 
  Target, Thermometer, ShieldCheck, Eye, Microscope,
  FileText, Image, Video, Volume2, CheckCircle, BarChart3,
  Timer, Gauge, Award, Trophy, Star, Flame
} from 'lucide-react';
import { WhatsAppIcon, FacebookIcon, TwitterIcon, TelegramIcon, TikTokIcon, WebIcon } from './PlatformIcons';
import { RealTimeStats } from './RealTimeStats';
import { motion } from 'motion/react';

export function CompleteDashboard() {
  const [selectedRegion, setSelectedRegion] = useState('colombia');
  const [timeRange, setTimeRange] = useState('24h');

  // Datos en tiempo real
  const [realTimeData, setRealTimeData] = useState({
    casosActivos: 2847,
    tasaInfeccion: 3.2,
    inmunidadDigital: 67,
    tiempoDeteccion: 4.2
  });

  // Simular actualización en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        casosActivos: prev.casosActivos + Math.floor(Math.random() * 10 - 5),
        tasaInfeccion: Math.max(0, prev.tasaInfeccion + (Math.random() - 0.5) * 0.1),
        inmunidadDigital: Math.min(100, Math.max(0, prev.inmunidadDigital + (Math.random() - 0.5) * 2)),
        tiempoDeteccion: Math.max(1, prev.tiempoDeteccion + (Math.random() - 0.5) * 0.2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Datos del Dashboard original
  const dashboardStats = [
    { title: 'Total Contenidos', value: '1,247', icon: FileText, change: '+12%' },
    { title: 'Analizados por IA', value: '1,089', icon: CheckCircle, change: '+8%' },
    { title: 'Verificados Humanos', value: '456', icon: Users, change: '+15%' },
    { title: 'En Proceso', value: '158', icon: Clock, change: '-3%' },
  ];

  // Datos epidemiológicos del Mapa Desinfodémico con comparaciones temporales detalladas
  const epidemicStats = [
    { 
      title: 'Casos Activos', 
      value: realTimeData.casosActivos.toLocaleString(), 
      icon: Bug, 
      change: '+15.3%', 
      period: 'vs. ayer',
      previousValue: '1,847',
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      trend: 'up',
      critical: true
    },
    { 
      title: 'Tasa de Infección', 
      value: `R₀ ${realTimeData.tasaInfeccion.toFixed(1)}`, 
      icon: Activity, 
      change: '+8.7%', 
      period: 'vs. semana anterior',
      previousValue: 'R₀ 2.1',
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      trend: 'up',
      critical: realTimeData.tasaInfeccion > 3.0
    },
    { 
      title: 'Inmunidad Digital', 
      value: `${Math.round(realTimeData.inmunidadDigital)}%`, 
      icon: Shield, 
      change: '+2.4%', 
      period: 'vs. mes anterior',
      previousValue: '81.2%',
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      trend: 'up',
      critical: false
    },
    { 
      title: 'Tiempo Detección', 
      value: `${realTimeData.tiempoDeteccion.toFixed(1)}h`, 
      icon: Clock, 
      change: '-12.8%', 
      period: 'vs. semana anterior',
      previousValue: '5.1h',
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      trend: 'down',
      critical: false
    },
  ];

  const verificationData = [
    { month: 'Ene', contenidos: 85, verificados: 72 },
    { month: 'Feb', contenidos: 120, verificados: 98 },
    { month: 'Mar', contenidos: 150, verificados: 145 },
    { month: 'Abr', contenidos: 180, verificados: 165 },
    { month: 'May', contenidos: 210, verificados: 189 },
    { month: 'Jun', contenidos: 185, verificados: 176 },
  ];

  // Datos de Verificación Humana
  const verificationTrends = [
    { name: 'Lun', verificaciones: 45, precision: 92 },
    { name: 'Mar', verificaciones: 52, precision: 89 },
    { name: 'Mié', verificaciones: 38, precision: 95 },
    { name: 'Jue', verificaciones: 67, precision: 88 },
    { name: 'Vie', verificaciones: 72, precision: 91 },
    { name: 'Sáb', verificaciones: 28, precision: 93 },
    { name: 'Dom', verificaciones: 31, precision: 90 }
  ];

  const caseTypesData = [
    { name: 'Casos Veraces', value: 342, color: '#22c55e' },
    { name: 'Casos Falsos', value: 156, color: '#ef4444' },
    { name: 'Casos Engañosos', value: 89, color: '#f59e0b' },
    { name: 'Sin Verificar', value: 67, color: '#6b7280' }
  ];

  const verifierRanking = [
    { name: 'Dr. Ana Rodríguez', verificaciones: 347, precision: 96, especialidad: 'Salud Pública' },
    { name: 'Lic. Carlos Mendez', verificaciones: 289, precision: 94, especialidad: 'Política' },
    { name: 'Dra. Sofia López', verificaciones: 256, precision: 95, especialidad: 'Ciencia' },
    { name: 'Prof. Miguel Torres', verificaciones: 234, precision: 93, especialidad: 'Economía' },
    { name: 'Ing. Laura Gómez', verificaciones: 198, precision: 92, especialidad: 'Tecnología' }
  ];

  const infectivityData = [
    { time: '00:00', casos: 120, nuevos: 23, resueltos: 15 },
    { time: '04:00', casos: 145, nuevos: 31, resueltos: 18 },
    { time: '08:00', casos: 189, nuevos: 67, resueltos: 24 },
    { time: '12:00', casos: 234, nuevos: 89, resueltos: 35 },
    { time: '16:00', casos: 298, nuevos: 112, resueltos: 48 },
    { time: '20:00', casos: 267, nuevos: 78, resueltos: 109 },
    { time: '24:00', casos: 189, nuevos: 45, resueltos: 123 },
  ];

  const pieData = [
    { name: 'Veraz', value: 65, color: '#00E676' },
    { name: 'Desinformación', value: 20, color: '#F72585' },
    { name: 'Satírico', value: 10, color: '#FF6B35' },
    { name: 'Fuera de Contexto', value: 5, color: '#7209B7' },
  ];

  const contentTypes = [
    { name: 'Texto', value: 45, icon: FileText },
    { name: 'Imagen', value: 30, icon: Image },
    { name: 'Video', value: 20, icon: Video },
    { name: 'Audio', value: 5, icon: Volume2 },
  ];

  const transmissionVectors = [
    { platform: 'WhatsApp', cases: 856, percentage: 28, color: '#25D366' },
    { platform: 'Facebook', cases: 723, percentage: 24, color: '#1877F2' },
    { platform: 'Twitter/X', cases: 534, percentage: 18, color: '#000000' },
    { platform: 'Telegram', cases: 298, percentage: 10, color: '#0088CC' },
    { platform: 'TikTok', cases: 267, percentage: 9, color: '#FF0050' },
    { platform: 'Web', cases: 334, percentage: 11, color: '#4285F4' },
  ];

  const geographicSpread = [
    { region: 'Región Andina', casos: 1456, tasa: 5.2, estado: 'Brote Activo' },
    { region: 'Región Caribe', casos: 934, tasa: 4.1, estado: 'En Aumento' },
    { region: 'Región Pacífico', casos: 687, tasa: 3.8, estado: 'Controlado' },
    { region: 'Región Orinoquía', casos: 234, tasa: 2.3, estado: 'Estable' },
    { region: 'Región Amazonia', casos: 156, tasa: 1.9, estado: 'Bajo Control' },
    { region: 'Región Insular', casos: 43, tasa: 0.8, estado: 'Bajo Control' },
  ];

  // Datos para la curva epidemiológica
  const epidemiologicalCurve = [
    { fecha: '18 Oct', casosNuevos: 45, casosNeutralizados: 32, tasaR0: 1.2 },
    { fecha: '19 Oct', casosNuevos: 67, casosNeutralizados: 41, tasaR0: 1.4 },
    { fecha: '20 Oct', casosNuevos: 89, casosNeutralizados: 56, tasaR0: 1.6 },
    { fecha: '21 Oct', casosNuevos: 134, casosNeutralizados: 78, tasaR0: 1.8 },
    { fecha: '22 Oct', casosNuevos: 198, casosNeutralizados: 112, tasaR0: 2.1 },
    { fecha: '23 Oct', casosNuevos: 267, casosNeutralizados: 145, tasaR0: 2.3 },
    { fecha: '24 Oct', casosNuevos: 342, casosNeutralizados: 189, tasaR0: 2.5 },
    { fecha: '25 Oct', casosNuevos: 298, casosNeutralizados: 234, tasaR0: 2.2 },
    { fecha: '26 Oct', casosNuevos: 234, casosNeutralizados: 267, tasaR0: 1.9 },
    { fecha: '27 Oct', casosNuevos: 189, casosNeutralizados: 198, tasaR0: 1.7 },
  ];



  const getRegionStatus = (estado: string) => {
    switch (estado) {
      case 'Brote Crítico':
        return <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">🔴 {estado}</Badge>;
      case 'Brote Activo':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">🟡 {estado}</Badge>;
      case 'En Aumento':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">📈 {estado}</Badge>;
      case 'Controlado':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">🔵 {estado}</Badge>;
      case 'Estable':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">⚪ {estado}</Badge>;
      case 'Bajo Control':
        return <Badge className="bg-green-100 text-green-800 border-green-300">🟢 {estado}</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'WhatsApp': return WhatsAppIcon;
      case 'Facebook': return FacebookIcon;
      case 'Twitter/X': return TwitterIcon;
      case 'Telegram': return TelegramIcon;
      case 'TikTok': return TikTokIcon;
      case 'Web': return WebIcon;
      default: return Globe;
    }
  };



  return (
    <div className="space-y-8">
      {/* Header dinámico */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span>Centro de Control Desinfodémico</span>
          </h1>
          <p className="text-muted-foreground">
            Análisis integral de verificación y monitoreo epidemiológico de desinformación
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colombia">Colombia</SelectItem>
              <SelectItem value="andina">Región Andina</SelectItem>
              <SelectItem value="caribe">Región Caribe</SelectItem>
              <SelectItem value="pacifico">Región Pacífico</SelectItem>
              <SelectItem value="orinoquia">Región Orinoquía</SelectItem>
              <SelectItem value="amazonia">Región Amazonia</SelectItem>
              <SelectItem value="insular">Región Insular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SECCIÓN 1: MÉTRICAS EPIDEMIOLÓGICAS PRINCIPALES */}
      <div>
        <div className="mb-6">
          <h2 className="flex items-center space-x-2 mb-2">
            <Activity className="h-6 w-6 text-primary" />
            <span>Métricas Epidemiológicas Principales</span>
          </h2>
          <p className="text-muted-foreground text-sm">Indicadores clave de propagación y control de desinformación</p>
        </div>

        {/* Métricas Epidemiológicas Principales - Destacadas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {epidemicStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.critical ? 'border-2 border-primary shadow-lg' : ''} hover:shadow-xl transition-all`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl mb-2 ${stat.critical ? 'animate-pulse' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{stat.period}</span>
                    <span className={`flex items-center space-x-1 ${
                      stat.trend === 'up' && stat.critical ? 'text-red-600' :
                      stat.trend === 'up' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{stat.change}</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Anterior: {stat.previousValue}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: CURVA EPIDEMIOLÓGICA Y VECTORES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Curva Epidemiológica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Curva Epidemiológica</span>
            </CardTitle>
            <CardDescription>Evolución de casos nuevos vs. neutralizados (últimos 10 días)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={epidemiologicalCurve}>
                <defs>
                  <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F72585" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F72585" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorNeutralizados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="casosNuevos" 
                  stroke="#F72585" 
                  fillOpacity={1}
                  fill="url(#colorNuevos)" 
                  name="Casos Nuevos"
                />
                <Area 
                  type="monotone" 
                  dataKey="casosNeutralizados" 
                  stroke="#00E676" 
                  fillOpacity={1}
                  fill="url(#colorNeutralizados)" 
                  name="Casos Neutralizados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vectores de Transmisión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Vectores de Transmisión</span>
            </CardTitle>
            <CardDescription>Plataformas de mayor propagación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transmissionVectors.map((platform) => {
                const PlatformIcon = getPlatformIcon(platform.platform);
                return (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${platform.color}15` }}
                        >
                          <PlatformIcon 
                            className="w-5 h-5" 
                            style={{ color: platform.color }}
                          />
                        </div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{platform.cases} casos</div>
                        <div className="text-sm text-muted-foreground">{platform.percentage}%</div>
                      </div>
                    </div>
                    <Progress value={platform.percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 3: PROPAGACIÓN GEOGRÁFICA Y PANEL DE CONTROL */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Propagación Geográfica - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Propagación Geográfica</span>
              </CardTitle>
              <CardDescription>Estado epidemiológico por región de Colombia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {geographicSpread.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer border border-secondary/20"
                  >
                    <div>
                      <div className="font-medium">{item.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.casos.toLocaleString()} casos • Tasa: {item.tasa}/h
                      </div>
                    </div>
                    <div className="text-right">
                      {getRegionStatus(item.estado)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Control Epidemiológico - 1 columna */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-primary" />
                <span>Temperatura Desinfodémica</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl mb-2">🌡️ 7.8°C</div>
                <div className="text-sm text-muted-foreground mb-3">Estado: Fiebre Alta</div>
                <Progress value={78} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>Efectividad Vacunas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Verificación:</span>
                  <span className="text-green-600">89%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Educación:</span>
                  <span className="text-green-600">76%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Fact-Checking:</span>
                  <span className="text-green-600">84%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>Vigilancia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Sensores:</span>
                  <span className="text-primary">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cobertura:</span>
                  <span className="text-primary">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Detección:</span>
                  <span className="text-primary">4.2 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECCIÓN 4: ESTADÍSTICAS DE VERIFICACIÓN */}
      <div>
        <div className="mb-6">
          <h2 className="flex items-center space-x-2 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Estadísticas de Verificación</span>
          </h2>
          <p className="text-muted-foreground text-sm">Métricas de contenido analizado y verificado</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {dashboardStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`${stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  {' '}desde el mes pasado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Análisis por Mes */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis Mensual</CardTitle>
              <CardDescription>Contenidos analizados vs verificados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={verificationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="contenidos" fill="var(--color-primary)" name="Analizados" />
                  <Bar dataKey="verificados" fill="var(--color-chart-2)" name="Verificados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resultados de Verificación */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>Distribución por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipos de Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Contenido</CardTitle>
              <CardDescription>Distribución por formato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-muted-foreground" />
                      <span>{type.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 min-w-0 flex-1 ml-[35px]">
                      <Progress value={type.value} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{type.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECCIÓN 5: ANÁLISIS AVANZADO */}
      <div>
        <div className="mb-6">
          <h2 className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Análisis Avanzado</span>
          </h2>
          <p className="text-muted-foreground text-sm">Métricas especializadas y patrones de comportamiento</p>
        </div>

        {/* Métricas avanzadas en cards compactos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">Velocidad Contagio</span>
            </div>
            <div className="text-2xl text-red-800">1.7x</div>
            <div className="text-xs text-red-600">casos/hora</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Inmunización</span>
            </div>
            <div className="text-2xl text-green-800">73%</div>
            <div className="text-xs text-green-600">verificaciones exitosas</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">Incubación</span>
            </div>
            <div className="text-2xl text-yellow-800">2.3h</div>
            <div className="text-xs text-yellow-600">tiempo propagación</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">Índice Epidémico</span>
            </div>
            <div className="text-2xl text-blue-800">Alto</div>
            <div className="text-xs text-blue-600">fase exponencial</div>
          </div>
        </div>

        {/* Infectividad por hora */}
        <Card>
          <CardHeader>
            <CardTitle>Infectividad por Hora del Día</CardTitle>
            <CardDescription>Distribución de casos nuevos vs resueltos en 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={infectivityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="nuevos" 
                  stackId="1" 
                  stroke="#FF4444" 
                  fill="#FF4444" 
                  fillOpacity={0.6}
                  name="Casos Nuevos"
                />
                <Area 
                  type="monotone" 
                  dataKey="resueltos" 
                  stackId="2" 
                  stroke="#00E676" 
                  fill="#00E676" 
                  fillOpacity={0.6}
                  name="Casos Resueltos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 6: VERIFICACIÓN HUMANA */}
      <div>
        <div className="mb-6">
          <h2 className="flex items-center space-x-2 mb-2">
            <Microscope className="h-6 w-6 text-primary" />
            <span>Laboratorio de Verificación Epidemiológica</span>
          </h2>
          <p className="text-muted-foreground text-sm">Red colaborativa de especialistas para diagnóstico y verificación de casos</p>
        </div>

        {/* Estadísticas de Verificación Humana */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-green-700">47</p>
                    <p className="text-sm text-green-600">Especialistas Activos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">+12% vs ayer</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">↑ 5 nuevos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Timer className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-amber-700">234</p>
                    <p className="text-sm text-amber-600">Casos Pendientes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-600">Prioridad Alta: 67</p>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500">T.M.R: 2.3h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-blue-700">1,247</p>
                    <p className="text-sm text-blue-600">Casos Diagnosticados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">Últimas 24h</p>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-500">Ritmo: 52/h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gauge className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-purple-700">96.2%</p>
                    <p className="text-sm text-purple-600">Precisión Diagnóstica</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-600">Consenso Inter-obs.</p>
                  <div className="flex items-center space-x-1">
                    <Award className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-500">κ = 0.94</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Complementarias */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl text-red-700">R₀ = 1.15</p>
                  <p className="text-sm text-red-600">Tasa de Reproducción</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl text-orange-700">58.3%</p>
                  <p className="text-sm text-orange-600">Virulencia Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl text-indigo-700">2.3h</p>
                  <p className="text-sm text-indigo-600">Tiempo Medio Propagación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Verificación */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Tendencias de Verificación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Tendencias de Verificación Semanal</span>
              </CardTitle>
              <CardDescription>Actividad diaria y precisión diagnóstica del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={verificationTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="verificaciones" 
                    stroke="#ffda00" 
                    fill="rgba(255, 218, 0, 0.2)" 
                    strokeWidth={3}
                    name="Verificaciones"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="precision" 
                    stroke="#22c55e" 
                    fill="rgba(34, 197, 94, 0.1)" 
                    strokeWidth={2}
                    name="Precisión %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de Tipos de Casos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Distribución de Tipos de Casos</span>
              </CardTitle>
              <CardDescription>Clasificación epidemiológica de casos diagnosticados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseTypesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {caseTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de Especialistas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Ranking de Especialistas</span>
            </CardTitle>
            <CardDescription>Clasificación de verificadores por rendimiento y precisión diagnóstica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verifierRanking.map((verifier, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{verifier.name}</h4>
                      <p className="text-sm text-muted-foreground">{verifier.especialidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{verifier.verificaciones}</p>
                        <p className="text-xs text-muted-foreground">Verificaciones</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">{verifier.precision}%</p>
                        <p className="text-xs text-muted-foreground">Precisión</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{(verifier.precision / 20).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN FINAL: ACTIVIDAD RECIENTE */}
      <div>
        <div className="mb-6">
          <h2 className="flex items-center space-x-2 mb-2">
            <Clock className="h-6 w-6 text-primary" />
            <span>Actividad Reciente</span>
          </h2>
          <p className="text-muted-foreground text-sm">Últimas verificaciones y análisis epidemiológicos del sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Actividad</CardTitle>
            <CardDescription>Historial detallado de casos verificados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { 
                  id: 'BTL-2024-001458',
                  type: 'Imagen', 
                  status: 'Veraz', 
                  user: 'Ana García', 
                  time: 'Hace 5 min',
                  confidence: 94,
                  region: 'Cundinamarca',
                  platform: 'WhatsApp',
                  analysisTime: '2.3 seg',
                  reach: '~15K usuarios',
                  markers: ['Verificación cruzada', 'Fuente oficial']
                },
                { 
                  id: 'BTL-2024-001457',
                  type: 'Video', 
                  status: 'Desinformación', 
                  user: 'Carlos López', 
                  time: 'Hace 12 min',
                  confidence: 87,
                  region: 'Antioquia',
                  platform: 'Facebook',
                  analysisTime: '45.7 seg',
                  reach: '~89K usuarios',
                  markers: ['Manipulación detectada', 'Contenido fabricado']
                },
                { 
                  id: 'BTL-2024-001456',
                  type: 'Texto', 
                  status: 'Satírico', 
                  user: 'María Torres', 
                  time: 'Hace 23 min',
                  confidence: 76,
                  region: 'Valle del Cauca',
                  platform: 'Twitter',
                  analysisTime: '1.1 seg',
                  reach: '~3.2K usuarios',
                  markers: ['Humor detectado', 'Sin intención maliciosa']
                },
                { 
                  id: 'BTL-2024-001455',
                  type: 'Audio', 
                  status: 'Fuera de Contexto', 
                  user: 'Luis Martín', 
                  time: 'Hace 1h',
                  confidence: 82,
                  region: 'Atlántico',
                  platform: 'Telegram',
                  analysisTime: '67.2 seg',
                  reach: '~25K usuarios',
                  markers: ['Contenido auténtico', 'Contexto alterado']
                },
              ].map((activity, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-secondary/5">
                  {/* Header del caso */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {activity.type === 'Imagen' && <Image className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'Video' && <Video className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'Texto' && <FileText className="h-4 w-4 text-green-500" />}
                        {activity.type === 'Audio' && <Volume2 className="h-4 w-4 text-orange-500" />}
                        <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                      </div>
                      <Badge 
                        variant={
                          activity.status === 'Veraz' ? 'default' :
                          activity.status === 'Desinformación' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{activity.confidence}% confianza</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Caso {activity.id}
                    </div>
                  </div>

                  {/* Detalles del análisis */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Región:</span>
                      <span>{activity.region}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Plataforma:</span>
                      <span>{activity.platform}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Análisis:</span>
                      <span>{activity.analysisTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Alcance:</span>
                      <span>{activity.reach}</span>
                    </div>
                  </div>

                  {/* Marcadores de diagnóstico */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Microscope className="h-3 w-3" />
                      <span>Marcadores de diagnóstico:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {activity.markers.map((marker, markerIndex) => (
                        <Badge key={markerIndex} variant="secondary" className="text-xs px-2 py-1">
                          {marker}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      <span>Verificado por {activity.user}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}