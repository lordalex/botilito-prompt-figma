import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  BookOpen, Activity, TrendingUp, Share2, Flame, Hash,
  Clock, Eye, Gauge, Shield, Target, Radio, Zap, Users,
  AlertCircle, Info, Code, Calculator, Database, ArrowRight,
  CheckCircle, Download, Search, Globe, BarChart3
} from 'lucide-react';

export function DocumentacionIndicadores() {
  const [selectedIndicador, setSelectedIndicador] = useState<string | null>(null);

  const indicadores = [
    {
      id: 'r0',
      nombre: 'R₀ - Tasa de Reproducción',
      icon: Radio,
      categoria: 'epidemiologica',
      color: 'purple',
      descripcion: 'Número promedio de nuevos casos que genera cada caso de desinformación',
      formula: 'R₀ = Nuevos casos (T) / Casos activos (T-1)',
      ejemplo: 'Si había 100 casos y aparecen 230 nuevos: R₀ = 230/100 = 2.3',
      interpretacion: [
        { rango: 'R₀ < 1.0', significado: 'Controlado - cada caso genera menos de 1 nuevo', color: 'green' },
        { rango: 'R₀ = 1.0', significado: 'Estable - cada caso genera 1 nuevo', color: 'yellow' },
        { rango: 'R₀ > 1.0', significado: 'Crecimiento - cada caso genera más de 1 nuevo', color: 'orange' },
        { rango: 'R₀ ≥ 2.5', significado: 'CRÍTICO - Propagación exponencial', color: 'red' }
      ],
      datosNecesarios: ['nuevosCasos (últimos 7 días)', 'casosActivos (período anterior)'],
      codigoEjemplo: `const R0 = nuevosCasos / casosActivosAntes;
// Ejemplo: 89 / 67 = 1.33
// Interpretación: Cada caso genera 1.33 nuevos casos`
    },
    {
      id: 'velocidad',
      nombre: 'Velocidad de Transmisión',
      icon: Zap,
      categoria: 'epidemiologica',
      color: 'orange',
      descripcion: 'Qué tan rápido se propaga la desinformación una vez que comienza a circular',
      formula: 'Velocidad = ((Casos 24h × 3) / Casos 72h) × 100',
      ejemplo: 'Casos últimas 24h: 15, últimas 72h: 38 → (15×3)/38 × 100 = 118% → 85% normalizado',
      interpretacion: [
        { rango: '0-30%', significado: 'Propagación lenta', color: 'green' },
        { rango: '31-60%', significado: 'Propagación moderada', color: 'yellow' },
        { rango: '61-85%', significado: 'Propagación rápida', color: 'orange' },
        { rango: '86-100%', significado: 'Propagación viral', color: 'red' }
      ],
      datosNecesarios: ['Casos últimas 24 horas', 'Casos últimas 72 horas', 'Plataforma de origen'],
      codigoEjemplo: `const velocidad = ((casosUltimas24h * 3) / casosUltimas72h) * 100;
// Factor plataforma: WhatsApp 1.5x, Twitter 1.3x, Facebook 1.2x`
    },
    {
      id: 'infectividad',
      nombre: 'Infectividad',
      icon: Share2,
      categoria: 'epidemiologica',
      color: 'red',
      descripcion: 'Probabilidad de que un usuario que ve la desinformación la comparta o crea',
      formula: 'Infectividad = (Virulencia × 0.6) + (Velocidad × 0.4)',
      ejemplo: 'Virulencia 75% + Velocidad 85% → (75×0.6)+(85×0.4) = 79%',
      interpretacion: [
        { rango: '0-30%', significado: 'Baja - poca gente lo comparte', color: 'green' },
        { rango: '31-60%', significado: 'Moderada', color: 'yellow' },
        { rango: '61-80%', significado: 'Alta infectividad', color: 'orange' },
        { rango: '81-100%', significado: 'Extremadamente contagioso', color: 'red' }
      ],
      datosNecesarios: ['Marcadores detectados', 'Virulencia de marcadores', 'Velocidad de transmisión'],
      codigoEjemplo: `const infectividad = (virulenciaPromedio * 0.6) + (velocidad * 0.4);
// Con datos reales: (75 * 0.6) + (85 * 0.4) = 79%`
    },
    {
      id: 'virulencia',
      nombre: 'Virulencia Promedio',
      icon: Flame,
      categoria: 'epidemiologica',
      color: 'yellow',
      descripcion: 'Nivel de peligrosidad o daño potencial de la desinformación',
      formula: 'Virulencia = Σ(virulencia_marcador × casos) / total_casos',
      ejemplo: 'Falso (90×456) + Engañoso (75×389) = 87,375 / 1,157 casos = 75.5%',
      interpretacion: [
        { rango: '0-30%', significado: 'Leve (mayormente satírico)', color: 'green' },
        { rango: '31-60%', significado: 'Moderada', color: 'yellow' },
        { rango: '61-80%', significado: 'Alta - contenido peligroso', color: 'orange' },
        { rango: '81-100%', significado: 'Extremadamente peligroso', color: 'red' }
      ],
      datosNecesarios: ['Marcadores detectados por caso', 'Virulencia de cada marcador', 'Cantidad casos'],
      codigoEjemplo: `const virulencias = { falso: 90, enganoso: 75, satirico: 20 };
const promedio = casos.reduce((sum, c) => 
  sum + virulencias[c.marcador], 0) / casos.length;`
    },
    {
      id: 'casosActivos',
      nombre: 'Casos Activos',
      icon: Activity,
      categoria: 'prevalencia',
      color: 'blue',
      descripcion: 'Casos de desinformación actualmente en circulación',
      formula: 'Casos con status activo o reportados en últimos 30 días',
      ejemplo: '456 casos en la región Andina actualmente en seguimiento',
      interpretacion: [
        { rango: 'Número alto', significado: 'Mucha desinformación activa', color: 'red' },
        { rango: 'Incremento rápido', significado: 'Brote desinfodémico', color: 'orange' }
      ],
      datosNecesarios: ['Lista de casos', 'Estado de cada caso', 'Fecha de reporte'],
      codigoEjemplo: `const activos = casos.filter(c => 
  c.status === 'en_verificacion' || 
  (Date.now() - new Date(c.submittedAt)) < 30_DIAS
).length;`
    },
    {
      id: 'densidad',
      nombre: 'Densidad (por 100k hab)',
      icon: Users,
      categoria: 'prevalencia',
      color: 'teal',
      descripcion: 'Casos normalizados por población, permite comparar regiones',
      formula: 'Densidad = (Casos activos / Población) × 100,000',
      ejemplo: 'Andina: 456 casos / 34,140,778 hab × 100k = 1.34 casos/100k',
      interpretacion: [
        { rango: 'Densidad alta', significado: 'Mayor exposición per cápita', color: 'orange' },
        { rango: 'Permite comparar', significado: 'Regiones de diferentes tamaños', color: 'blue' }
      ],
      datosNecesarios: ['Casos activos región', 'Población total región'],
      codigoEjemplo: `const densidad = (casosActivos / poblacionRegion) * 100000;
// Región Andina: (456 / 34140778) * 100000 = 1.34`
    },
    {
      id: 'tiempoDeteccion',
      nombre: 'Tiempo de Detección',
      icon: Clock,
      categoria: 'prevalencia',
      color: 'cyan',
      descripcion: 'Tiempo promedio desde circulación hasta reporte',
      formula: 'Promedio(fecha_reporte - fecha_publicación)',
      ejemplo: 'Región Andina: 3.8 horas promedio de detección',
      interpretacion: [
        { rango: '< 4 horas', significado: 'Detección muy rápida', color: 'green' },
        { rango: '4-8 horas', significado: 'Detección rápida', color: 'yellow' },
        { rango: '8-24 horas', significado: 'Detección moderada', color: 'orange' },
        { rango: '> 24 horas', significado: 'Detección lenta', color: 'red' }
      ],
      datosNecesarios: ['Fecha publicación original', 'Fecha reporte en Botilito'],
      codigoEjemplo: `const tiempos = casos.map(c => 
  (c.submittedAt - c.originalPublishDate) / 3600000
);
const promedio = tiempos.reduce((a,b) => a+b) / tiempos.length;`
    },
    {
      id: 'tasaReporte',
      nombre: 'Tasa de Reporte',
      icon: Eye,
      categoria: 'prevalencia',
      color: 'violet',
      descripcion: 'Porcentaje de participación ciudadana en reportar',
      formula: 'Tasa = (Usuarios que reportaron / Total usuarios) × 100',
      ejemplo: 'Región Andina: 74% de participación ciudadana',
      interpretacion: [
        { rango: '< 40%', significado: 'Baja participación', color: 'red' },
        { rango: '40-70%', significado: 'Participación moderada', color: 'yellow' },
        { rango: '> 70%', significado: 'Alta participación', color: 'green' }
      ],
      datosNecesarios: ['Usuarios únicos reportantes', 'Total usuarios registrados'],
      codigoEjemplo: `const tasaReporte = (usuariosReportaron / totalUsuarios) * 100;
// O por población: (reportes / poblacion) * 100k normalizado`
    },
    {
      id: 'consenso',
      nombre: 'Consenso Humano + IA',
      icon: Gauge,
      categoria: 'prevalencia',
      color: 'pink',
      descripcion: 'Coincidencia entre diagnósticos de IA y verificadores humanos',
      formula: 'Consenso = (Marcadores comunes / Marcadores únicos) × 100',
      ejemplo: 'Región Andina: 83% de consenso - alta confiabilidad',
      interpretacion: [
        { rango: '< 40%', significado: 'Bajo - discrepancia significativa', color: 'red' },
        { rango: '40-69%', significado: 'Moderado - necesita más verificación', color: 'yellow' },
        { rango: '70-89%', significado: 'Alto consenso - confiable', color: 'green' },
        { rango: '≥ 90%', significado: 'Excelente - muy confiable', color: 'green' }
      ],
      datosNecesarios: ['consensusMarkers (humanos)', 'aiAnalysis.detectedMarkers'],
      codigoEjemplo: `const common = humanMarkers.filter(m => aiMarkers.includes(m));
const total = new Set([...humanMarkers, ...aiMarkers]).size;
const consenso = (common.length / total) * 100;`
    },
    {
      id: 'igc',
      nombre: 'Índice de Gravedad Combinada',
      icon: Target,
      categoria: 'derivado',
      color: 'indigo',
      descripcion: 'Indicador compuesto: Virulencia × Velocidad × R₀',
      formula: 'IGC = (Virulencia × 0.4) + (Velocidad × 0.35) + (R₀ norm × 0.25)',
      ejemplo: 'Virulencia 75, Velocidad 85, R₀ 2.7 → IGC = 73.25 (Alto riesgo)',
      interpretacion: [
        { rango: '0-40', significado: 'Bajo riesgo', color: 'green' },
        { rango: '41-65', significado: 'Riesgo moderado', color: 'yellow' },
        { rango: '66-85', significado: 'Alto riesgo', color: 'orange' },
        { rango: '86-100', significado: 'Crítico - intervención inmediata', color: 'red' }
      ],
      datosNecesarios: ['Virulencia', 'Velocidad', 'R₀'],
      codigoEjemplo: `const r0Norm = Math.min((r0 / 5) * 100, 100);
const igc = (virulencia * 0.4) + (velocidad * 0.35) + (r0Norm * 0.25);
// Ejemplo: (75*0.4) + (85*0.35) + (54*0.25) = 73.25`
    },
    {
      id: 'vectorTransmision',
      nombre: 'Vector de Transmisión',
      icon: Globe,
      categoria: 'transmision',
      color: 'blue',
      descripcion: 'Plataforma principal desde donde se propaga la desinformación',
      formula: 'Contar casos por plataforma, ordenar descendente',
      ejemplo: 'WhatsApp: 38% de todos los casos (Vector principal)',
      interpretacion: [
        { rango: 'Vector principal', significado: 'Dónde concentrar monitoreo', color: 'blue' },
        { rango: 'Por plataforma', significado: 'Estrategias específicas', color: 'purple' }
      ],
      datosNecesarios: ['sources en aiAnalysis por cada caso'],
      codigoEjemplo: `const porPlataforma = {};
casos.forEach(c => c.sources.forEach(s => 
  porPlataforma[s] = (porPlataforma[s] || 0) + 1
));
const principal = Object.entries(porPlataforma).sort((a,b) => b[1]-a[1])[0];`
    }
  ];

  const categorias = [
    { id: 'epidemiologica', nombre: 'Métricas Epidemiológicas', color: 'purple', descripcion: 'Indicadores del comportamiento viral' },
    { id: 'prevalencia', nombre: 'Prevalencia y Detección', color: 'blue', descripcion: 'Métricas de casos y respuesta' },
    { id: 'derivado', nombre: 'Indicadores Derivados', color: 'orange', descripcion: 'Combinaciones y análisis avanzados' },
    { id: 'transmision', nombre: 'Fuentes y Transmisión', color: 'green', descripcion: 'Vectores y plataformas' }
  ];

  const virulenciasMarcadores = [
    { marcador: 'Incitación a la violencia', virulencia: 98, color: 'red' },
    { marcador: 'Discurso de odio/racismo', virulencia: 95, color: 'red' },
    { marcador: 'Falso', virulencia: 90, color: 'red' },
    { marcador: 'Manipulado', virulencia: 85, color: 'orange' },
    { marcador: 'Teoría conspirativa', virulencia: 80, color: 'purple' },
    { marcador: 'Engañoso', virulencia: 75, color: 'orange' },
    { marcador: 'Sin contexto', virulencia: 60, color: 'yellow' },
    { marcador: 'Sensacionalista', virulencia: 55, color: 'yellow' },
    { marcador: 'No verificable', virulencia: 35, color: 'gray' },
    { marcador: 'Satírico', virulencia: 20, color: 'blue' },
    { marcador: 'Verdadero', virulencia: 0, color: 'green' }
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      teal: 'bg-teal-50 text-teal-700 border-teal-200',
      cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      violet: 'bg-violet-50 text-violet-700 border-violet-200',
      pink: 'bg-pink-50 text-pink-700 border-pink-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      gray: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[color] || colors.blue;
  };

  const indicadorSeleccionado = indicadores.find(i => i.id === selectedIndicador);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary rounded-lg">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl">Documentación de Indicadores Epidemiológicos</h1>
              <p className="text-muted-foreground">
                Guía completa para entender y calcular cada métrica del Mapa Desinfodémico
              </p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="indicadores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicadores">
            <BarChart3 className="h-4 w-4 mr-2" />
            Indicadores
          </TabsTrigger>
          <TabsTrigger value="categorias">
            <Activity className="h-4 w-4 mr-2" />
            Por Categoría
          </TabsTrigger>
          <TabsTrigger value="marcadores">
            <Flame className="h-4 w-4 mr-2" />
            Virulencia
          </TabsTrigger>
          <TabsTrigger value="implementacion">
            <Code className="h-4 w-4 mr-2" />
            Implementación
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Lista de Indicadores */}
        <TabsContent value="indicadores" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Indicadores ({indicadores.length})</CardTitle>
              <CardDescription>Haz clic en cualquier indicador para ver detalles completos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicadores.map(indicador => {
                  const IconComponent = indicador.icon;
                  return (
                    <Card 
                      key={indicador.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedIndicador === indicador.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedIndicador(indicador.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-lg ${getColorClass(indicador.color)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {indicador.categoria}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{indicador.nombre}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {indicador.descripcion}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detalle del indicador seleccionado */}
          {indicadorSeleccionado && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {React.createElement(indicadorSeleccionado.icon, { 
                      className: "h-8 w-8 text-primary" 
                    })}
                    <div>
                      <CardTitle className="text-2xl">{indicadorSeleccionado.nombre}</CardTitle>
                      <CardDescription className="mt-1 text-base">
                        {indicadorSeleccionado.descripcion}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedIndicador(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fórmula */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3>Fórmula de Cálculo</h3>
                  </div>
                  <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                    {indicadorSeleccionado.formula}
                  </div>
                </div>

                {/* Ejemplo */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3>Ejemplo Práctico</h3>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm">{indicadorSeleccionado.ejemplo}</p>
                  </div>
                </div>

                {/* Interpretación */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3>Interpretación de Valores</h3>
                  </div>
                  <div className="space-y-2">
                    {indicadorSeleccionado.interpretacion.map((interp, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${getColorClass(interp.color)}`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">
                            {interp.rango}
                          </Badge>
                          <ArrowRight className="h-4 w-4 mx-2" />
                          <span className="text-sm flex-1">{interp.significado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Datos necesarios */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h3>Datos Necesarios</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {indicadorSeleccionado.datosNecesarios.map((dato, idx) => (
                      <Badge key={idx} variant="secondary">
                        {dato}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Código ejemplo */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h3>Código de Ejemplo</h3>
                  </div>
                  <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{indicadorSeleccionado.codigoEjemplo}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Por Categoría */}
        <TabsContent value="categorias" className="space-y-4 mt-6">
          {categorias.map(categoria => {
            const indicadoresCategoria = indicadores.filter(i => i.categoria === categoria.id);
            return (
              <Card key={categoria.id}>
                <CardHeader className={`${getColorClass(categoria.color)}`}>
                  <CardTitle>{categoria.nombre}</CardTitle>
                  <CardDescription className="text-current opacity-80">
                    {categoria.descripcion} • {indicadoresCategoria.length} indicadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {indicadoresCategoria.map(indicador => {
                      const IconComponent = indicador.icon;
                      return (
                        <div 
                          key={indicador.id}
                          className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all"
                          onClick={() => setSelectedIndicador(indicador.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getColorClass(indicador.color)}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{indicador.nombre}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {indicador.descripcion}
                              </p>
                              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                                {indicador.formula}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tab 3: Tabla de Virulencia */}
        <TabsContent value="marcadores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-primary" />
                <span>Tabla de Virulencia por Marcador</span>
              </CardTitle>
              <CardDescription>
                Nivel de peligrosidad de cada tipo de desinformación (escala 0-100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {virulenciasMarcadores.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.marcador}</span>
                        <Badge className={`${getColorClass(item.color)}`}>
                          {item.virulencia}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.virulencia >= 80 ? 'bg-red-600' :
                            item.virulencia >= 60 ? 'bg-orange-600' :
                            item.virulencia >= 40 ? 'bg-yellow-600' :
                            item.virulencia >= 20 ? 'bg-blue-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${item.virulencia}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <h4 className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>Cálculo de Virulencia Promedio Regional</span>
                </h4>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm space-y-2">
                  <div>VirulenciaPromedio = Σ(virulencia_marcador × casos) / total_casos</div>
                  <Separator />
                  <div className="text-green-600">// Ejemplo Región Andina:</div>
                  <div>Falso: 892 casos × 90 = 80,280</div>
                  <div>Engañoso: 756 casos × 75 = 56,700</div>
                  <div>Sensacionalista: 645 casos × 55 = 35,475</div>
                  <div>...</div>
                  <div className="text-blue-600">Total: 259,380 / 3,456 casos = 75% virulencia</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Guía de Implementación */}
        <TabsContent value="implementacion" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-primary" />
                <span>Guía de Implementación Técnica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estructura de datos */}
              <div>
                <h3 className="mb-3 flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Estructura de Datos Necesaria</span>
                </h3>
                <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`interface Caso {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  submittedBy: string;
  submittedAt: string; // ISO timestamp
  region: string;
  aiAnalysis: {
    veracity: string;
    confidence: number;
    detectedMarkers: string[];
    sources: string[]; // Plataformas
  };
  consensusMarkers: string[];
  votesCount: number;
  status: 'pendiente' | 'en_verificacion' | 'verificado';
}`}</pre>
                </div>
              </div>

              {/* Constantes */}
              <div>
                <h3 className="mb-3 flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span>Constantes Necesarias</span>
                </h3>
                <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`const VIRULENCIA_MARCADORES = {
  'incitacion_violencia': 98,
  'discurso_odio_racismo': 95,
  'falso': 90,
  'manipulado': 85,
  'teoria_conspirativa': 80,
  'enganoso': 75,
  'sin_contexto': 60,
  'sensacionalista': 55,
  'no_verificable': 35,
  'satirico': 20,
  'verdadero': 0
};

const POBLACION_REGIONES = {
  'caribe': 10654876,
  'andina': 34140778,
  // ...
};`}</pre>
                </div>
              </div>

              {/* Frecuencias de actualización */}
              <div>
                <h3 className="mb-3 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Frecuencias de Actualización Recomendadas</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Tiempo Real</div>
                    <div className="text-xs text-muted-foreground">
                      Casos activos, nuevos casos
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Cada 6 horas</div>
                    <div className="text-xs text-muted-foreground">
                      Virulencia promedio
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Diario</div>
                    <div className="text-xs text-muted-foreground">
                      R₀, velocidad, infectividad, densidad
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Semanal</div>
                    <div className="text-xs text-muted-foreground">
                      Tiempo detección, tasa reporte
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div>
                <h3 className="mb-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>Recomendaciones de Implementación</span>
                </h3>
                <div className="space-y-2">
                  {[
                    'Cachear cálculos pesados como R₀ y virulencia promedio',
                    'Usar agregaciones en base de datos para conteos',
                    'Crear índices en timestamps para filtros por fecha',
                    'Precalcular métricas en jobs programados',
                    'Usar ventanas temporales (rolling windows) para tendencias',
                    'Normalizar todos los indicadores a escala 0-100 para comparabilidad'
                  ].map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-900">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con glosario */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Glosario Epidemiológico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { termino: 'Caso', definicion: 'Instancia de desinformación reportada' },
              { termino: 'Marcador de diagnóstico', definicion: 'Tipo/categoría de desinformación' },
              { termino: 'Vector', definicion: 'Plataforma/medio de transmisión' },
              { termino: 'Incidencia', definicion: 'Nuevos casos en un período' },
              { termino: 'Prevalencia', definicion: 'Casos totales existentes' },
              { termino: 'Virulencia', definicion: 'Nivel de peligrosidad/daño' },
              { termino: 'R₀', definicion: 'Tasa de reproducción básica' },
              { termino: 'Consenso', definicion: 'Acuerdo entre diagnósticos' },
              { termino: 'Desinfodémico', definicion: 'Epidemia de desinformación' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-sm text-primary">{item.termino}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.definicion}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
