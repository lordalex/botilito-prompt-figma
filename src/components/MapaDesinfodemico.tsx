import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { generateMapa } from '../utils/mapaDesinfodemico/api';
import { transformMapaData } from '../utils/mapaDesinfodemico/transformer';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, Shield,
  MapPin, Users, Bot, Gauge, Zap, Clock, Target, Flame,
  Radio, Share2, Eye, BarChart3, PieChart, LineChart,
  AlertCircle, CheckCircle, XCircle, Wind, Thermometer, 
  ArrowUp, ArrowDown, Minus, Calendar, Filter, Download, 
  RefreshCw, Map, Layers, Hash, Percent, Timer, Globe, 
  Mountain, Waves, Trees, Sun, Cloud, Sparkles, FileText,
  TrendingDownIcon, Crosshair, Network, Database, FileCheck,
  UserCheck, BarChart4, CircleDot, Trophy, Syringe, Tag
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Treemap
} from 'recharts';

// Datos de ejemplo para el mapa desinfodémico
const regionesColombia = [
  { 
    id: 'caribe', 
    nombre: 'Caribe', 
    icon: Waves,
    color: '#00B4D8',
    departamentos: ['Atlántico', 'Bolívar', 'Cesar', 'Córdoba', 'La Guajira', 'Magdalena', 'Sucre'],
    poblacion: 10654876
  },
  { 
    id: 'pacifica', 
    nombre: 'Pacífica', 
    icon: Waves,
    color: '#0077B6',
    departamentos: ['Chocó', 'Valle del Cauca', 'Cauca', 'Nariño'],
    poblacion: 9773228
  },
  { 
    id: 'andina', 
    nombre: 'Andina', 
    icon: Mountain,
    color: '#7209B7',
    departamentos: ['Antioquia', 'Boyacá', 'Caldas', 'Cundinamarca', 'Huila', 'Norte de Santander', 'Quindío', 'Risaralda', 'Santander', 'Tolima'],
    poblacion: 34140778
  },
  { 
    id: 'orinoquia', 
    nombre: 'Orinoquía', 
    icon: Sun,
    color: '#F72585',
    departamentos: ['Arauca', 'Casanare', 'Meta', 'Vichada'],
    poblacion: 1664489
  },
  { 
    id: 'amazonia', 
    nombre: 'Amazonía', 
    icon: Trees,
    color: '#06FFA5',
    departamentos: ['Amazonas', 'Caquetá', 'Guainía', 'Guaviare', 'Putumayo', 'Vaupés'],
    poblacion: 1206080
  },
  { 
    id: 'insular', 
    nombre: 'Insular', 
    icon: Cloud,
    color: '#FFD60A',
    departamentos: ['San Andrés y Providencia'],
    poblacion: 77701
  }
];

// Colores para gráficos
const COLORS = ['#00B4D8', '#0077B6', '#7209B7', '#F72585', '#06FFA5', '#FFD60A'];

export function MapaDesinfodemico() {
  // State for filters and UI
  const [regionSeleccionada, setRegionSeleccionada] = useState('andina');
  const [periodoTiempo, setPeriodoTiempo] = useState('semanal');
  const [dimensionActiva, setDimensionActiva] = useState('magnitud');
  const [filtroMarcador, setFiltroMarcador] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [filtroVector, setFiltroVector] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTema, setFiltroTema] = useState('todos');

  // State for API data
  const [mapaData, setMapaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');

  const region = regionesColombia.find(r => r.id === regionSeleccionada);

  // Load mapa data on mount
  useEffect(() => {
    loadMapaData().catch((err) => {
      console.error('Uncaught error in loadMapaData:', err);
      setError(err.message || 'Error inesperado al cargar el mapa');
      setLoading(false);
    });
  }, []);

  async function loadMapaData() {
    setLoading(true);
    setError(null);

    try {
      const result = await generateMapa((status) => {
        setJobStatus(status);
      });

      if (result.result) {
        const transformed = transformMapaData(result.result);
        setMapaData(transformed);
      }
    } catch (err: any) {
      console.error('Error loading mapa:', err);
      setError(err.message || 'Error al cargar el mapa desinfodémico');
    } finally {
      setLoading(false);
    }
  }

  // DATOS DE INDICADORES POR DIMENSIÓN
  // Use API data if available, otherwise fall back to mock data

  // 1. DIMENSIÓN: MAGNITUD
  const datosMagnitud = mapaData?.datosMagnitud || {
    noticiasReportadas: 1567,
    noticiasReportadasSemana: 234,
    noticiasReportadasMes: 892,
    deteccionesPorIA: 1234,
    deteccionesPorHumanos: 1189,
    tiempoDeteccionIA: 2.3,
    tiempoDeteccionHumanos: 4.8,
    fuentesGeneradoras: [
      { fuente: '@noticiasfalsas_col', casos: 456, tipo: 'Cuenta Twitter' },
      { fuente: 'GrupoWhatsApp "Noticias Urgentes"', casos: 389, tipo: 'WhatsApp' },
      { fuente: 'Portal "InfoVeraz.co"', casos: 312, tipo: 'Sitio Web' },
      { fuente: '@viral_colombia', casos: 267, tipo: 'Instagram' },
      { fuente: 'Canal Telegram "La Verdad Oculta"', casos: 189, tipo: 'Telegram' }
    ]
  };

  // 2. DIMENSIÓN: TEMPORALIDAD
  const datosTemporalidad = mapaData?.datosTemporalidad || {
    velocidadDeteccion: 3.8,
    tiempoViralizacionPromedio: 6.2,
    evolucionSemanal: [
      { semana: 'Sem 1', detectadas: 234, viralizadas: 189, tiempo: 5.8 },
      { semana: 'Sem 2', detectadas: 267, viralizadas: 212, tiempo: 6.1 },
      { semana: 'Sem 3', detectadas: 289, viralizadas: 245, tiempo: 6.4 },
      { semana: 'Sem 4', detectadas: 312, viralizadas: 278, tiempo: 6.2 }
    ],
    comparativaVerdaderasVsFalsas: [
      { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
      { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
    ]
  };

  // 3. DIMENSIÓN: ALCANCE O VIRULENCIA
  const datosAlcance = mapaData?.datosAlcance || {
    indiceViralidad: 2.7,
    rangoViralizacion: { min: 100, max: 125000, promedio: 8450 },
    nivelEngagement: 78,
    efectividadAlcance: {
      verdaderas: 3250,
      falsas: 8975,
      ratio: 0.36
    },
    distribucionViralidad: [
      { rango: '0-1K', casos: 456, porcentaje: 29 },
      { rango: '1K-10K', casos: 589, porcentaje: 38 },
      { rango: '10K-50K', casos: 378, porcentaje: 24 },
      { rango: '50K+', casos: 144, porcentaje: 9 }
    ],
    casosCriticos: 0,
    vectoresPrincipales: []
  };

  // 4. DIMENSIÓN: GEOGRÁFICOS
  const datosGeograficos = mapaData?.datosGeograficos || {
    casosPorRegion: regionesColombia.map(r => ({
      region: r.nombre,
      casos: Math.floor(Math.random() * 1000) + 100,
      densidad: (Math.random() * 50 + 10).toFixed(1),
      color: r.color
    })),
    regionMasAfectada: 'Andina',
    fuentesInternacionalesVsNacionales: {
      internacionales: 423,
      nacionales: 1144,
      porcentajeInternacional: 27
    },
    mapaCalor: [
      { departamento: 'Antioquia', casos: 456, lat: 6.2, lon: -75.5 },
      { departamento: 'Bogotá D.C.', casos: 892, lat: 4.6, lon: -74.0 },
      { departamento: 'Valle del Cauca', casos: 378, lat: 3.4, lon: -76.5 },
      { departamento: 'Atlántico', casos: 312, lat: 10.9, lon: -74.8 },
      { departamento: 'Santander', casos: 234, lat: 7.1, lon: -73.1 }
    ]
  };

  // 5. DIMENSIÓN: DESCRIPTIVOS
  const datosDescriptivos = mapaData?.datosDescriptivos || {
    porSector: [
      { sector: 'Política', casos: 567, porcentaje: 36 },
      { sector: 'Salud', casos: 423, porcentaje: 27 },
      { sector: 'Economía', casos: 312, porcentaje: 20 },
      { sector: 'Seguridad', casos: 178, porcentaje: 11 },
      { sector: 'Otros', casos: 87, porcentaje: 6 }
    ],
    plataformasPropagacion: [
      { plataforma: 'WhatsApp', casos: 2345, porcentaje: 38 },
      { plataforma: 'Facebook', casos: 1987, porcentaje: 32 },
      { plataforma: 'Twitter/X', casos: 1234, porcentaje: 20 },
      { plataforma: 'Instagram', casos: 456, porcentaje: 7 },
      { plataforma: 'TikTok', casos: 189, porcentaje: 3 }
    ],
    personalidadesAtacadas: [
      { nombre: 'Presidente de la República', ataques: 234 },
      { nombre: 'Alcalde de Bogotá', ataques: 189 },
      { nombre: 'Ministro de Salud', ataques: 156 },
      { nombre: 'Candidato Opositor', ataques: 134 },
      { nombre: 'Líder Social Regional', ataques: 98 }
    ],
    sectorMasEficiente: {
      sector: 'Salud',
      alcancePromedio: 12500,
      viralidad: 85
    }
  };

  // 6. DIMENSIÓN: MITIGACIÓN
  const datosMitigacion = mapaData?.datosMitigacion || {
    consensoValidacionHumana: 84,
    consensoHumanoVsIA: {
      acuerdo: 81,
      desacuerdo: 19
    },
    casosEnDesacuerdo: 190,
    distribucionDesacuerdo: [
      { categoria: 'IA dice Falso, Humanos Verdadero', casos: 67, porcentaje: 35 },
      { categoria: 'IA dice Verdadero, Humanos Falso', casos: 45, porcentaje: 24 },
      { categoria: 'Desacuerdo en clasificación', casos: 78, porcentaje: 41 }
    ],
    noticiasMasReportadas: [
      { titulo: 'Vacuna causa efectos secundarios graves', reportes: 456 },
      { titulo: 'Alcalde involucrado en corrupción', reportes: 389 },
      { titulo: 'Nueva cepa de virus detectada en Colombia', reportes: 312 },
      { titulo: 'Subsidio del gobierno es un fraude', reportes: 267 },
      { titulo: 'Celebridad apoya candidato político', reportes: 234 }
    ],
    recomendaciones: [],
    // Nuevos indicadores basados en otras interfaces
    casosPorPrioridad: [
      { prioridad: 'Alta', casos: 234, porcentaje: 15 },
      { prioridad: 'Media', casos: 589, porcentaje: 38 },
      { prioridad: 'Baja', casos: 744, porcentaje: 47 }
    ],
    redEpidemiologos: {
      totalActivos: 47,
      casosProcesados: 1189,
      tiempoPromedioVerificacion: 4.8,
      consensoPromedio: 84
    },
    redInmunizadores: {
      totalActivos: 32,
      estrategiasDesarrolladas: 156,
      estrategiasActivas: 134,
      alcanceTotal: 1250000
    },
    marcadoresDiagnostico: [
      { tipo: 'Falso', casos: 567, porcentaje: 36, color: '#ef4444' },
      { tipo: 'Engañoso', casos: 423, porcentaje: 27, color: '#f97316' },
      { tipo: 'Sensacionalista', casos: 312, porcentaje: 20, color: '#fb923c' },
      { tipo: 'Sin contexto', casos: 178, porcentaje: 11, color: '#f59e0b' },
      { tipo: 'Otros', casos: 87, porcentaje: 6, color: '#6b7280' }
    ],
    vectoresContagio: [
      { tipo: 'Texto (T)', casos: 734, porcentaje: 47, codigo: 'T' },
      { tipo: 'Imagen (I)', casos: 423, porcentaje: 27, codigo: 'I' },
      { tipo: 'Video (V)', casos: 267, porcentaje: 17, codigo: 'V' },
      { tipo: 'Audio (A)', casos: 143, porcentaje: 9, codigo: 'A' }
    ],
    casosPorEstado: [
      { estado: 'Verificados', casos: 1189, porcentaje: 76, color: '#10b981' },
      { estado: 'Solo IA', casos: 378, porcentaje: 24, color: '#3b82f6' }
    ],
    sistemaCodificacion: {
      totalCasos: 1567,
      casosHoy: 34,
      casosSemana: 234,
      formatoEjemplo: 'T-WB-20241015-156'
    }
  };

  // Función para obtener ícono de tendencia
  const getTendenciaIcon = (tendencia: string) => {
    if (tendencia === 'up') return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (tendencia === 'down') return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  // Función para obtener color de riesgo
  const getRiesgoColor = (valor: number, max: number = 100) => {
    const porcentaje = (valor / max) * 100;
    if (porcentaje >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (porcentaje >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="flex justify-center">
          <img
            src={botilitoImage}
            alt="Botilito generando mapa"
            className="w-48 h-48 object-contain animate-bounce"
          />
        </div>
        <Card className="w-full max-w-3xl shadow-lg border-2">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Generando mapa desinfodémico...
            </h2>
            <div className="space-y-2">
              <Progress value={jobStatus === 'completed' ? 100 : jobStatus === 'processing' ? 60 : 30} className="w-full h-3" />
              <p className="text-sm text-center text-muted-foreground">
                Estado: {jobStatus === 'pending' ? 'Iniciando análisis...' :
                        jobStatus === 'processing' ? 'Procesando datos...' :
                        'Finalizando...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el mapa</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={loadMapaData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

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
              ¡Bienvenido al epicentro del análisis desinfodémico! 🗺️🔬
            </p>
            <p className="text-sm mt-1 opacity-80">
              Explora las 6 dimensiones de virulencia y descubre cómo se comporta la desinformación. ¡Pura epidemiología digital! 📊💉
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary rounded-lg">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl">Mapa Desinfodémico de Colombia</h1>
              <p className="text-muted-foreground">
                Análisis epidemiológico en tiempo real por dimensiones de virulencia
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros Globales */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filtrar:</span>
        </div>
        
        <Select value={periodoTiempo} onValueChange={setPeriodoTiempo}>
          <SelectTrigger className="w-[140px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Últimas 24h</SelectItem>
            <SelectItem value="semanal">Última semana</SelectItem>
            <SelectItem value="mensual">Último mes</SelectItem>
            <SelectItem value="trimestral">Trimestre</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroMarcador} onValueChange={setFiltroMarcador}>
          <SelectTrigger className="w-[145px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="falso">Falso</SelectItem>
            <SelectItem value="enganoso">Engañoso</SelectItem>
            <SelectItem value="sensacionalista">Sensacionalista</SelectItem>
            <SelectItem value="sin-contexto">Sin contexto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
          <SelectTrigger className="w-[130px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroVector} onValueChange={setFiltroVector}>
          <SelectTrigger className="w-[125px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="texto">Texto (T)</SelectItem>
            <SelectItem value="imagen">Imagen (I)</SelectItem>
            <SelectItem value="video">Video (V)</SelectItem>
            <SelectItem value="audio">Audio (A)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[135px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="verificado">Verificados</SelectItem>
            <SelectItem value="solo-ia">Solo IA</SelectItem>
            <SelectItem value="revision">En revisión</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTema} onValueChange={setFiltroTema}>
          <SelectTrigger className="w-[135px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="politica">Política</SelectItem>
            <SelectItem value="salud">Salud</SelectItem>
            <SelectItem value="economia">Economía</SelectItem>
            <SelectItem value="seguridad">Seguridad</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionSeleccionada} onValueChange={setRegionSeleccionada}>
          <SelectTrigger className="w-[145px] border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regionesColombia.map(region => {
              const IconComponent = region.icon;
              return (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4" style={{ color: region.color }} />
                    <span>{region.nombre}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs de Dimensiones de Virulencia */}
      <Tabs value={dimensionActiva} onValueChange={setDimensionActiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="magnitud" className="flex flex-col items-center py-3 px-2">
            <Database className="h-5 w-5 mb-1" />
            <span className="text-xs">Magnitud</span>
          </TabsTrigger>
          <TabsTrigger value="temporalidad" className="flex flex-col items-center py-3 px-2">
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs">Temporalidad</span>
          </TabsTrigger>
          <TabsTrigger value="alcance" className="flex flex-col items-center py-3 px-2">
            <Flame className="h-5 w-5 mb-1" />
            <span className="text-xs">Virulencia</span>
          </TabsTrigger>
          <TabsTrigger value="geograficos" className="flex flex-col items-center py-3 px-2">
            <MapPin className="h-5 w-5 mb-1" />
            <span className="text-xs">Geográficos</span>
          </TabsTrigger>
          <TabsTrigger value="descriptivos" className="flex flex-col items-center py-3 px-2">
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Descriptivos</span>
          </TabsTrigger>
          <TabsTrigger value="mitigacion" className="flex flex-col items-center py-3 px-2">
            <Shield className="h-5 w-5 mb-1" />
            <span className="text-xs">Mitigación</span>
          </TabsTrigger>
        </TabsList>

        {/* DIMENSIÓN 1: MAGNITUD */}
        <TabsContent value="magnitud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-primary" />
                <span>Dimensión de Magnitud</span>
              </CardTitle>
              <CardDescription>
                Cuantifica el volumen total de contenidos reportados, detectados como falsos por IA y validados por humanos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Indicadores Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-blue-700">Noticias Reportadas</CardDescription>
                    <CardTitle className="text-3xl text-blue-900">{datosMagnitud.noticiasReportadas.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-blue-700">
                      <span>Esta semana: +{datosMagnitud.noticiasReportadasSemana}</span>
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-red-700">Detectadas por IA</CardDescription>
                    <CardTitle className="text-3xl text-red-900">{datosMagnitud.deteccionesPorIA.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-red-700">
                      <span>Tiempo promedio: {datosMagnitud.tiempoDeteccionIA}h</span>
                      <Bot className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-green-700">Validadas por Humanos</CardDescription>
                    <CardTitle className="text-3xl text-green-900">{datosMagnitud.deteccionesPorHumanos.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-green-700">
                      <span>Tiempo promedio: {datosMagnitud.tiempoDeteccionHumanos}h</span>
                      <Users className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de evolución de reportes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolución de Noticias Reportadas</CardTitle>
                  <CardDescription>Tendencia de reportes por unidad de tiempo y mecanismo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { mes: 'Ene', reportadas: 890, iaDetectadas: 745, humanasValidadas: 712 },
                      { mes: 'Feb', reportadas: 1120, iaDetectadas: 934, humanasValidadas: 889 },
                      { mes: 'Mar', reportadas: 1456, iaDetectadas: 1189, humanasValidadas: 1134 },
                      { mes: 'Abr', reportadas: 1567, iaDetectadas: 1234, humanasValidadas: 1189 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="reportadas" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Reportadas" />
                      <Area type="monotone" dataKey="iaDetectadas" stackId="2" stroke="#ef4444" fill="#ef4444" name="IA Detectadas" />
                      <Area type="monotone" dataKey="humanasValidadas" stackId="3" stroke="#10b981" fill="#10b981" name="Validadas Humanos" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ranking de Fuentes Generadoras */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ranking de Fuentes Generadoras de Desinformación</CardTitle>
                  <CardDescription>Identifica los actores clave que generan contenido falso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {datosMagnitud.fuentesGeneradoras.map((fuente, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-600 text-white">#{idx + 1}</Badge>
                            <div>
                              <p className="font-medium">{fuente.fuente}</p>
                              <p className="text-xs text-muted-foreground">{fuente.tipo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl text-red-700">{fuente.casos}</p>
                            <p className="text-xs text-muted-foreground">casos detectados</p>
                          </div>
                        </div>
                        <Progress value={(fuente.casos / datosMagnitud.fuentesGeneradoras[0].casos) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIMENSIÓN 2: TEMPORALIDAD */}
        <TabsContent value="temporalidad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <span>Dimensión de Temporalidad</span>
              </CardTitle>
              <CardDescription>
                Tiempo de ocurrencia y velocidad de detección y viralización de noticias falsas versus verdaderas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Indicadores Temporales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-purple-700">Velocidad de Detección</CardDescription>
                    <CardTitle className="text-3xl text-purple-900">{datosTemporalidad.velocidadDeteccion}h</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-purple-700">
                      <Zap className="h-3 w-3" />
                      <span>Tiempo promedio de detección</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-orange-700">Tiempo de Viralización *</CardDescription>
                    <CardTitle className="text-3xl text-orange-900">{datosTemporalidad.tiempoViralizacionPromedio}h *</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-orange-700">
                      <Radio className="h-3 w-3" />
                      <span>Ventana crítica de intervención</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Evolución Temporal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolución Temporal de Detección vs Viralización</CardTitle>
                  <CardDescription>Comparativa de casos detectados versus viralizados por semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={datosTemporalidad.evolucionSemanal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="detectadas" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Detectadas" />
                      <Area type="monotone" dataKey="viralizadas" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Viralizadas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Comparativa Verdaderas vs Falsas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiempo de Viralización: Noticias Verdaderas vs Falsas *</CardTitle>
                  <CardDescription>Comparación de peligrosidad por velocidad de propagación *</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={datosTemporalidad.comparativaVerdaderasVsFalsas} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="tipo" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="interacciones" fill="#3b82f6" name="Interacciones" />
                      <Bar dataKey="tiempo" fill="#f59e0b" name="Tiempo (horas)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Alert className="mt-4 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Las noticias falsas se viralizan <strong>2.6x más rápido *</strong> que las verdaderas, con un tiempo promedio de {datosTemporalidad.comparativaVerdaderasVsFalsas[1].tiempo}h vs {datosTemporalidad.comparativaVerdaderasVsFalsas[0].tiempo}h *
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIMENSIÓN 3: ALCANCE O VIRULENCIA */}
        <TabsContent value="alcance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-primary" />
                <span>Dimensión de Alcance o Virulencia</span>
              </CardTitle>
              <CardDescription>
                Evalúa el índice de viralidad, porcentaje de mayor viralización y nivel de engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Métricas de Virulencia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-red-700">Índice de Viralidad</CardDescription>
                    <CardTitle className="text-3xl text-red-900">{datosAlcance.indiceViralidad}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-red-700">
                      <Flame className="h-3 w-3" />
                      <span>Potencial de contagio</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-yellow-700">Nivel de Engagement *</CardDescription>
                    <CardTitle className="text-3xl text-yellow-900">{datosAlcance.nivelEngagement}% *</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-yellow-700">
                      <Target className="h-3 w-3" />
                      <span>Impacto emocional promedio</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-purple-700">Alcance Promedio *</CardDescription>
                    <CardTitle className="text-2xl text-purple-900">{datosAlcance.rangoViralizacion.promedio.toLocaleString()} *</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-purple-700">
                      <span>Min: {datosAlcance.rangoViralizacion.min} *</span>
                      <span>Max: {(datosAlcance.rangoViralizacion.max / 1000).toFixed(0)}K *</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribución de Viralidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Viralización por Rango *</CardTitle>
                  <CardDescription>Porcentaje y rango de mayor viralización de noticias falsas *</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosAlcance.distribucionViralidad} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="rango" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="casos" fill="#f59e0b" name="Casos" />
                      <Bar dataKey="porcentaje" fill="#ef4444" name="Porcentaje %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Efectividad de Alcance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Efectividad de Alcance: Verdaderas vs Falsas *</CardTitle>
                  <CardDescription>Evalúa competencia comunicacional entre información verificada y desinformación *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <p className="text-sm text-green-700 mb-1">Noticias Verdaderas *</p>
                      <p className="text-3xl text-green-900">{datosAlcance.efectividadAlcance.verdaderas.toLocaleString()} *</p>
                      <p className="text-xs text-green-600 mt-1">interacciones promedio</p>
                    </div>
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                      <p className="text-sm text-red-700 mb-1">Noticias Falsas *</p>
                      <p className="text-3xl text-red-900">{datosAlcance.efectividadAlcance.falsas.toLocaleString()} *</p>
                      <p className="text-xs text-red-600 mt-1">interacciones promedio</p>
                    </div>
                  </div>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Brecha de efectividad *:</strong> Las noticias falsas tienen {(datosAlcance.efectividadAlcance.falsas / datosAlcance.efectividadAlcance.verdaderas).toFixed(1)}x más alcance que las verdaderas. Ratio de competencia: {(datosAlcance.efectividadAlcance.ratio * 100).toFixed(0)}% *
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIMENSIÓN 4: GEOGRÁFICOS */}
        <TabsContent value="geograficos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-primary" />
                <span>Dimensión Geográfica</span>
              </CardTitle>
              <CardDescription>
                Alcance espacial de noticias falsas, agrupación en clústeres y patrones espaciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Casos por Región */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cantidad de Noticias Falsas por Región</CardTitle>
                  <CardDescription>Detecta patrones territoriales de desinformación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {datosGeograficos.casosPorRegion.map((region, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: region.color }}></div>
                            <span className="font-medium">{region.region}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{region.casos} casos</Badge>
                            <Badge variant="outline" className="text-xs">
                              {region.densidad} por 100k hab
                            </Badge>
                          </div>
                        </div>
                        <Progress value={(region.casos / 1000) * 100} className="h-2" style={{ backgroundColor: `${region.color}30` }} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mapa de Calor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mapa de Calor Geográfico de Desinformación</CardTitle>
                  <CardDescription>Visualiza densidades por ubicación geográfica (Top 5 departamentos)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosGeograficos.mapaCalor}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="departamento" angle={-15} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="casos" fill="#ef4444" name="Casos detectados" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm text-red-900 mb-2">🔥 Zona de Mayor Concentración</h4>
                    <p className="text-xs text-red-700">
                      <strong>{datosGeograficos.mapaCalor?.[1]?.departamento || 'Bogotá D.C.'}</strong> presenta la mayor densidad con {datosGeograficos.mapaCalor?.[1]?.casos || 892} casos detectados,
                      representando una zona crítica que requiere atención prioritaria.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fuentes Internacionales vs Nacionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fuentes Internacionales vs Nacionales *</CardTitle>
                  <CardDescription>Analiza el origen de los emisores de desinformación *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                      <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-3xl text-blue-900 mb-1">{datosGeograficos.fuentesInternacionalesVsNacionales.internacionales} *</p>
                      <p className="text-sm text-blue-700">Fuentes Internacionales</p>
                      <Badge className="bg-blue-600 text-white mt-2">
                        {datosGeograficos.fuentesInternacionalesVsNacionales.porcentajeInternacional}% *
                      </Badge>
                    </div>
                    <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-3xl text-green-900 mb-1">{datosGeograficos.fuentesInternacionalesVsNacionales.nacionales} *</p>
                      <p className="text-sm text-green-700">Fuentes Nacionales</p>
                      <Badge className="bg-green-600 text-white mt-2">
                        {100 - datosGeograficos.fuentesInternacionalesVsNacionales.porcentajeInternacional}% *
                      </Badge>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Internacionales', value: datosGeograficos.fuentesInternacionalesVsNacionales.internacionales },
                          { name: 'Nacionales', value: datosGeograficos.fuentesInternacionalesVsNacionales.nacionales }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIMENSIÓN 5: DESCRIPTIVOS */}
        <TabsContent value="descriptivos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span>Dimensión Descriptiva</span>
              </CardTitle>
              <CardDescription>
                Caracteriza los principales componentes de una posible situación de virulencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Noticias Falsas por Sector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Porcentaje de Noticias Falsas por Sector</CardTitle>
                  <CardDescription>Clasifica por temática (salud, política, economía, etc.)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={datosDescriptivos.porSector}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ sector, porcentaje }) => `${sector}: ${porcentaje}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="casos"
                        >
                          {datosDescriptivos.porSector.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {datosDescriptivos.porSector.map((sector, idx) => (
                        <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                              <span className="font-medium">{sector.sector}</span>
                            </div>
                            <Badge>{sector.porcentaje}%</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{sector.casos} casos</span>
                            <Progress value={sector.porcentaje} className="w-20 h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plataformas con Mayor Propagación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plataformas con Mayor Propagación</CardTitle>
                  <CardDescription>Identifica las redes sociales más activas en la difusión</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosDescriptivos.plataformasPropagacion} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="plataforma" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="casos" fill="#7209B7" name="Casos detectados" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Alert className="mt-4 border-purple-200 bg-purple-50">
                    <Share2 className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>Plataforma líder:</strong> WhatsApp concentra el {datosDescriptivos.plataformasPropagacion[0].porcentaje}% 
                      de la propagación con {datosDescriptivos.plataformasPropagacion[0].casos.toLocaleString()} casos detectados
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Ranking de Personalidades Atacadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ranking de Personalidades Más Atacadas *</CardTitle>
                  <CardDescription>Lista de figuras públicas difamadas o mencionadas en desinformación *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {datosDescriptivos.personalidadesAtacadas.map((persona, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-orange-600 text-white text-lg w-10 h-10 flex items-center justify-center">
                            #{idx + 1}
                          </Badge>
                          <span className="font-medium">{persona.nombre}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-orange-700">{persona.ataques}</p>
                          <p className="text-xs text-muted-foreground">ataques detectados</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sector Más Eficiente */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Sector Más Eficiente en Alcance *</CardTitle>
                  <CardDescription>Compara viralización por área temática *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl mb-2">{datosDescriptivos.sectorMasEficiente.sector} *</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Alcance Promedio *</p>
                        <p className="text-xl text-blue-700">{datosDescriptivos.sectorMasEficiente.alcancePromedio.toLocaleString()} *</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Nivel de Viralidad *</p>
                        <p className="text-xl text-purple-700">{datosDescriptivos.sectorMasEficiente.viralidad}% *</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIMENSIÓN 6: MITIGACIÓN */}
        <TabsContent value="mitigacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Dimensión de Mitigación</span>
              </CardTitle>
              <CardDescription>
                Sistema de aprendizaje activo donde la fricción entre IA y humanos mejora la confiabilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consenso de Validación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-green-700">Consenso Validación Humana</CardDescription>
                    <CardTitle className="text-3xl text-green-900">{datosMitigacion.consensoValidacionHumana}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-green-700">
                      <UserCheck className="h-3 w-3" />
                      <span>Acuerdo entre validadores</span>
                    </div>
                    <Progress value={datosMitigacion.consensoValidacionHumana} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-blue-700">Consenso Humano + IA</CardDescription>
                    <CardTitle className="text-3xl text-blue-900">{datosMitigacion.consensoHumanoVsIA.acuerdo}%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-xs text-blue-700">
                      <Bot className="h-3 w-3" />
                      <span>Concordancia IA-Humanos</span>
                    </div>
                    <Progress value={datosMitigacion.consensoHumanoVsIA.acuerdo} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Consenso vs Desacuerdo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consenso Humano vs IA</CardTitle>
                  <CardDescription>Evalúa concordancia y señala límites de automatización</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Consenso', value: datosMitigacion.consensoHumanoVsIA.acuerdo, fill: '#10b981' },
                          { name: 'Desacuerdo', value: datosMitigacion.consensoHumanoVsIA.desacuerdo, fill: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        innerRadius={40}
                      >
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribución de Desacuerdos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Porcentaje de Desacuerdo Humano vs IA *</CardTitle>
                  <CardDescription>Señala límites de automatización y áreas de mejora para la IA *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {datosMitigacion.distribucionDesacuerdo.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.categoria}</span>
                          <Badge variant="outline">{item.porcentaje}%</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.porcentaje} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">{item.casos} casos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      El {datosMitigacion.consensoHumanoVsIA.desacuerdo}% de desacuerdo representa oportunidades de aprendizaje 
                      para mejorar los algoritmos de IA y refinar los criterios de validación humana
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Ranking de Noticias Más Reportadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ranking de Noticias Más Reportadas *</CardTitle>
                  <CardDescription>Detecta alertas ciudadanas y temas de mayor preocupación *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {datosMitigacion.noticiasMasReportadas.map((noticia, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 flex-1">
                          <Badge className="bg-blue-600 text-white text-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                            #{idx + 1}
                          </Badge>
                          <p className="font-medium text-sm">{noticia.titulo}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl text-blue-700">{noticia.reportes}</p>
                          <p className="text-xs text-muted-foreground">reportes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Detección ciudadana:</strong> Los temas relacionados con salud y política concentran 
                      el {((datosMitigacion.noticiasMasReportadas[0].reportes + datosMitigacion.noticiasMasReportadas[1].reportes) / 
                      datosMitigacion.noticiasMasReportadas.reduce((sum, n) => sum + n.reportes, 0) * 100).toFixed(0)}% 
                      de los reportes ciudadanos
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Nuevos Indicadores: Red de Epidemiólogos e Inmunizadores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-emerald-700" />
                      <span>Red de Epidemiólogos</span>
                    </CardTitle>
                    <CardDescription>Especialistas en diagnóstico desinfodémico</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Epidemiólogos activos *</span>
                      <Badge className="bg-emerald-600 text-white text-lg px-3 py-1">
                        {datosMitigacion.redEpidemiologos.totalActivos} *
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Casos procesados</span>
                        <span className="font-medium">{datosMitigacion.redEpidemiologos.casosProcesados.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tiempo promedio</span>
                        <span className="font-medium">{datosMitigacion.redEpidemiologos.tiempoPromedioVerificacion}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Consenso promedio</span>
                        <span className="font-medium">{datosMitigacion.redEpidemiologos.consensoPromedio}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-purple-700" />
                      <span>Red de Inmunizadores *</span>
                    </CardTitle>
                    <CardDescription>Especialistas en estrategias de inmunización *</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Inmunizadores activos *</span>
                      <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                        {datosMitigacion.redInmunizadores.totalActivos} *
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estrategias desarrolladas *</span>
                        <span className="font-medium">{datosMitigacion.redInmunizadores.estrategiasDesarrolladas} *</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estrategias activas *</span>
                        <span className="font-medium">{datosMitigacion.redInmunizadores.estrategiasActivas} *</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Alcance total *</span>
                        <span className="font-medium">{(datosMitigacion.redInmunizadores.alcanceTotal / 1000000).toFixed(1)}M *</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Marcadores de Diagnóstico */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Marcadores de Diagnóstico</CardTitle>
                  <CardDescription>Tipos de desinformación más detectados por el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={datosMitigacion.marcadoresDiagnostico}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ tipo, porcentaje }) => `${tipo}: ${porcentaje}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="casos"
                        >
                          {datosMitigacion.marcadoresDiagnostico.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {datosMitigacion.marcadoresDiagnostico.map((marcador, idx) => (
                        <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: marcador.color }}></div>
                              <span className="font-medium">{marcador.tipo}</span>
                            </div>
                            <Badge>{marcador.porcentaje}%</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{marcador.casos} casos</span>
                            <Progress value={marcador.porcentaje} className="w-20 h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vectores de Contagio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vectores de Contagio (Tipo de Contenido) *</CardTitle>
                  <CardDescription>Distribución por formato del contenido desinfodémico *</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosMitigacion.vectoresContagio}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="casos" fill="#7209B7" name="Casos" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {datosMitigacion.vectoresContagio.map((vector, idx) => (
                      <div key={idx} className="p-4 border rounded-lg text-center bg-gradient-to-br from-purple-50 to-blue-50">
                        <Badge className="bg-purple-600 text-white mb-2">{vector.codigo}</Badge>
                        <p className="text-2xl font-bold text-purple-900">{vector.casos}</p>
                        <p className="text-xs text-muted-foreground mt-1">{vector.porcentaje}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Casos por Prioridad y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Casos por Nivel de Prioridad *</CardTitle>
                    <CardDescription>Clasificación según urgencia de intervención *</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {datosMitigacion.casosPorPrioridad.map((prioridad, idx) => {
                        const colors = {
                          'Alta': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-600' },
                          'Media': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-600' },
                          'Baja': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' }
                        };
                        const color = colors[prioridad.prioridad as keyof typeof colors];
                        return (
                          <div key={idx} className={`p-4 border-2 rounded-lg ${color.bg} ${color.border}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-medium ${color.text}`}>{prioridad.prioridad}</span>
                              <Badge className={`${color.badge} text-white`}>{prioridad.porcentaje}%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold">{prioridad.casos}</span>
                              <Progress value={prioridad.porcentaje} className="w-24 h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado de Verificación</CardTitle>
                    <CardDescription>Casos verificados vs solo análisis IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={datosMitigacion.casosPorEstado}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ estado, porcentaje }) => `${estado}: ${porcentaje}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="casos"
                        >
                          {datosMitigacion.casosPorEstado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {datosMitigacion.casosPorEstado.map((estado, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: estado.color }}></div>
                            <span className="font-medium">{estado.estado}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{estado.casos}</p>
                            <p className="text-xs text-muted-foreground">{estado.porcentaje}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Codificación */}
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5 text-yellow-700" />
                    <span>Sistema de Codificación de Casos</span>
                  </CardTitle>
                  <CardDescription>Formato estándar: TIPO-VECTOR-FECHA-SECUENCIA *</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border-2 border-yellow-300 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total de casos</p>
                      <p className="text-3xl font-bold text-yellow-900">{datosMitigacion.sistemaCodificacion.totalCasos}</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-yellow-300 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Casos hoy *</p>
                      <p className="text-3xl font-bold text-yellow-900">{datosMitigacion.sistemaCodificacion.casosHoy} *</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-yellow-300 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Esta semana</p>
                      <p className="text-3xl font-bold text-yellow-900">{datosMitigacion.sistemaCodificacion.casosSemana}</p>
                    </div>
                    <div className="p-4 bg-white border-2 border-yellow-300 rounded-lg text-center flex flex-col items-center justify-center">
                      <p className="text-sm text-muted-foreground mb-1">Formato *</p>
                      <Badge className="bg-yellow-600 text-white font-mono text-xs px-2 py-1">
                        {datosMitigacion.sistemaCodificacion.formatoEjemplo} *
                      </Badge>
                    </div>
                  </div>
                  <Alert className="mt-4 border-yellow-300 bg-yellow-50">
                    <Hash className="h-4 w-4 text-yellow-700" />
                    <AlertDescription className="text-yellow-900">
                      <strong>Sistema unificado:</strong> Cada caso tiene un código único que identifica tipo de contenido, 
                      vector de propagación, fecha y número secuencial. Esto permite trazabilidad epidemiológica completa.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas y Recomendaciones Globales */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-900">
            <AlertTriangle className="h-6 w-6" />
            <span>Recomendaciones de Intervención Epidemiológica</span>
          </CardTitle>
          <CardDescription>Alertas y acciones sugeridas según las dimensiones de virulencia analizadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm text-red-900">Alta Magnitud de Casos Detectada</h4>
              <p className="text-xs text-red-700 mt-1">
                Se han reportado {datosMagnitud.noticiasReportadas.toLocaleString()} casos totales. 
                Se requiere aumentar la capacidad de verificación humana para mantener tiempos de respuesta óptimos.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm text-orange-900">Ventana Crítica de {datosTemporalidad.tiempoViralizacionPromedio}h *</h4>
              <p className="text-xs text-orange-700 mt-1">
                Las noticias falsas se viralizan en promedio en {datosTemporalidad.tiempoViralizacionPromedio} horas *.
                Priorizar detección temprana y respuesta rápida dentro de esta ventana crítica.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Flame className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm text-yellow-900">Índice de Viralidad en {datosAlcance.indiceViralidad}</h4>
              <p className="text-xs text-yellow-700 mt-1">
                El potencial de contagio es significativo con engagement del {datosAlcance.nivelEngagement}% *.
                Implementar estrategias de inmunización en sectores de mayor riesgo.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm text-green-900">Consenso Humano-IA: {datosMitigacion.consensoHumanoVsIA.acuerdo}%</h4>
              <p className="text-xs text-green-700 mt-1">
                La confiabilidad del sistema es alta con {datosMitigacion.consensoHumanoVsIA.acuerdo}% de consenso. 
                Continuar el proceso de aprendizaje activo con los {datosMitigacion.consensoHumanoVsIA.desacuerdo}% de casos en desacuerdo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de Datos Mock */}
      <Alert className="border-blue-200 bg-blue-50/50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>* = Datos de prueba:</strong> Los valores marcados con asterisco (*) son datos de ejemplo o estimaciones.
          Una vez la API esté completamente estable, estos serán reemplazados con datos reales del sistema.
        </AlertDescription>
      </Alert>
    </div>
  );
}
