import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, Shield, 
  Zap, Clock, MapPin, Users, Globe, Bug, Stethoscope, 
  Target, Thermometer, ShieldCheck, AlertOctagon, Eye, Microscope,
  FileText, Image, Video, Volume2, CheckCircle, BarChart3, Map,
  Layers, Filter, Maximize2, Minimize2
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { WhatsAppIcon, FacebookIcon, TwitterIcon, TelegramIcon, TikTokIcon, WebIcon } from './PlatformIcons';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { FloatingNotifications } from './FloatingNotifications';
import { RealTimeStats } from './RealTimeStats';
import { motion, AnimatePresence } from 'motion/react';

export function DashboardSummaryView() {
  const [viewMode, setViewMode] = useState('overview'); // overview, map, analytics
  const [selectedRegion, setSelectedRegion] = useState('colombia');
  const [timeRange, setTimeRange] = useState('24h');
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Datos epidemiológicos en tiempo real
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

  // Datos del dashboard
  const epidemicStats = [
    { 
      title: 'Casos Activos', 
      value: realTimeData.casosActivos.toLocaleString(), 
      icon: Bug, 
      change: '+15%', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      trend: 'up'
    },
    { 
      title: 'Tasa de Infección', 
      value: `${realTimeData.tasaInfeccion.toFixed(1)}/h`, 
      icon: Activity, 
      change: '+8%', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      trend: 'up'
    },
    { 
      title: 'Inmunidad Digital', 
      value: `${Math.round(realTimeData.inmunidadDigital)}%`, 
      icon: Shield, 
      change: '+2%', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    { 
      title: 'Tiempo Detección', 
      value: `${realTimeData.tiempoDeteccion.toFixed(1)}h`, 
      icon: Clock, 
      change: '-12%', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      trend: 'down'
    },
  ];

  const geographicSpread = [
    { region: 'Región Andina', casos: 1456, tasa: 5.2, estado: 'Brote Activo', lat: 4.5709, lng: -74.2973 },
    { region: 'Región Caribe', casos: 934, tasa: 4.1, estado: 'En Aumento', lat: 10.4806, lng: -75.5138 },
    { region: 'Región Pacífico', casos: 687, tasa: 3.8, estado: 'Controlado', lat: 2.9273, lng: -75.2819 },
    { region: 'Región Orinoquía', casos: 234, tasa: 2.3, estado: 'Estable', lat: 6.1701, lng: -67.4977 },
    { region: 'Región Amazonia', casos: 156, tasa: 1.9, estado: 'Bajo Control', lat: -1.2136, lng: -69.8062 },
    { region: 'Región Insular', casos: 43, tasa: 0.8, estado: 'Bajo Control', lat: 12.5564, lng: -81.7152 },
  ];

  const alertsData = [
    {
      id: 1,
      type: 'critical',
      title: 'Brote detectado en Región Andina',
      message: 'Incremento del 45% en casos en las últimas 6 horas',
      timestamp: 'hace 12 min',
      region: 'Andina'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Patrón anómalo en redes sociales',
      message: 'Detección de campaña coordinada en WhatsApp',
      timestamp: 'hace 25 min',
      region: 'Caribe'
    },
    {
      id: 3,
      type: 'info',
      title: 'Neutralización exitosa',
      message: '234 casos verificados y marcados como falsos',
      timestamp: 'hace 1h',
      region: 'Nacional'
    }
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertOctagon className="h-4 w-4 text-orange-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderInteractiveMap = () => (
    <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden">
      {/* Mapa SVG de Colombia */}
      <svg
        viewBox="0 0 400 500"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <linearGradient id="andinaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#E55A2E" />
          </linearGradient>
          <linearGradient id="caribeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD60A" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>
          <linearGradient id="pacificoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#0096C7" />
          </linearGradient>
          <linearGradient id="orinoquiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C757D" />
            <stop offset="100%" stopColor="#495057" />
          </linearGradient>
          <linearGradient id="amazoniaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#00C853" />
          </linearGradient>
        </defs>
        
        {/* Región Andina - Brote Activo */}
        <motion.path
          d="M120 100 L280 110 L290 170 L275 270 L190 310 L140 280 L110 250 L120 180 Z"
          fill="url(#andinaGradient)"
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedRegion('andina')}
        />
        
        {/* Región Caribe - En Aumento */}
        <motion.path
          d="M70 40 L330 40 L330 100 L280 110 L220 125 L170 115 L120 100 L70 85 Z"
          fill="url(#caribeGradient)"
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedRegion('caribe')}
        />
        
        {/* Región Pacífico - Controlado */}
        <motion.path
          d="M40 90 L120 100 L110 250 L90 350 L70 400 L50 380 L35 320 L25 250 L30 180 Z"
          fill="url(#pacificoGradient)"
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedRegion('pacifico')}
        />
        
        {/* Región Orinoquía - Estable */}
        <motion.path
          d="M280 110 L370 130 L365 260 L320 285 L290 270 L275 220 L290 170 Z"
          fill="url(#orinoquiaGradient)"
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedRegion('orinoquia')}
        />
        
        {/* Región Amazonía - Bajo Control */}
        <motion.path
          d="M110 250 L275 270 L320 285 L340 360 L300 430 L200 440 L140 410 L90 350 Z"
          fill="url(#amazoniaGradient)"
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedRegion('amazonia')}
        />
        
        {/* Pulsos en regiones críticas */}
        <motion.circle 
          cx="200" 
          cy="200" 
          r="6" 
          fill="#FF6B35" 
          opacity="0.8"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.3, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setMapExpanded(!mapExpanded)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {mapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Información de región seleccionada */}
      {selectedRegion !== 'colombia' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        >
          <h4 className="font-medium mb-2">Región {selectedRegion}</h4>
          <div className="text-sm text-muted-foreground">
            <div>Casos activos: 1,456</div>
            <div>Tasa: 5.2/hora</div>
            <div>Estado: Brote Activo</div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      <FloatingNotifications />
      <div className="space-y-6">
        {/* Header dinámico */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Centro de Control Desinfodémico</h1>
          <p className="text-muted-foreground">
            Monitoreo epidemiológico en tiempo real de la desinformación en Colombia
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
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Vista General</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center space-x-1">
                <Map className="h-4 w-4" />
                <span>Mapa</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>Análisis</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Panel de alertas expandible */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />
              <CardTitle className="text-orange-800">Alertas Epidemiológicas</CardTitle>
              <Badge variant="destructive" className="animate-pulse">3 ACTIVAS</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlertsExpanded(!alertsExpanded)}
            >
              {alertsExpanded ? 'Contraer' : 'Expandir'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {alertsExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3"
              >
                {alertsData.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.region} • {alert.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-orange-700"
              >
                {alertsData.length} alertas requieren atención inmediata
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Métricas principales animadas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {epidemicStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${stat.bgColor} border-0 overflow-hidden relative`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <motion.p 
                        className={`text-2xl font-semibold ${stat.color}`}
                        key={stat.value}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {stat.value}
                      </motion.p>
                      <Badge 
                        variant={stat.trend === 'up' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`${stat.color} opacity-20`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                
                {/* Indicador de pulso para datos críticos */}
                {stat.title === 'Casos Activos' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contenido principal dinámico */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {viewMode === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AdvancedAnalytics />
              </motion.div>
            ) : viewMode === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Mapa Epidemiológico Interactivo</span>
                    </CardTitle>
                    <CardDescription>
                      Haz clic en las regiones para ver detalles específicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderInteractiveMap()}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Propagación Geográfica</span>
                    </CardTitle>
                    <CardDescription>
                      Estado epidemiológico por región
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {geographicSpread.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedRegion(item.region.toLowerCase().replace('región ', ''));
                            setViewMode('map');
                          }}
                        >
                          <div>
                            <div className="font-medium">{item.region}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.casos.toLocaleString()} casos • Tasa: {item.tasa}/hora
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel lateral con métricas adicionales */}
        <div className="space-y-6">
          <RealTimeStats />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Acciones Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Crear Alerta Manual
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Análisis Detallado
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Verificación Masiva
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}