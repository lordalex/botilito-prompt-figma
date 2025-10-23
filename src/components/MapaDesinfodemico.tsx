import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { generateMapa } from '../utils/mapaDesinfodemico/api';
import { 
  Activity, AlertTriangle, Shield, MapPin, Users, Bot, 
  Clock, Flame, Filter, Download, RefreshCw, Map, Database, FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Import Dimension Components
import { DimensionMagnitud } from './mapa/DimensionMagnitud';
import { DimensionTemporalidad } from './mapa/DimensionTemporalidad';
import { DimensionAlcance } from './mapa/DimensionAlcance';
import { DimensionGeografica } from './mapa/DimensionGeografica';
import { DimensionDescriptiva } from './mapa/DimensionDescriptiva';
import { DimensionMitigacion } from './mapa/DimensionMitigacion';

// MOCK DATA: Used as a fallback if the API doesn't provide specific fields.
const mockMapaData = {
    datosMagnitud: {
      noticiasReportadas: 1567, noticiasReportadasSemana: 234, noticiasReportadasMes: 892,
      deteccionesPorIA: 1234, deteccionesPorHumanos: 1189, tiempoDeteccionIA: 2.3, tiempoDeteccionHumanos: 4.8,
      fuentesGeneradoras: [{ fuente: '@noticiasfalsas_col', casos: 456, tipo: 'Cuenta Twitter' }]
    },
    datosTemporalidad: {
      velocidadDeteccion: 3.8, tiempoViralizacionPromedio: 6.2,
      evolucionSemanal: [{ semana: 'Sem 1', detectadas: 234, viralizadas: 189, tiempo: 5.8 }],
      comparativaVerdaderasVsFalsas: [{ tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 }]
    },
    datosAlcance: {
      indiceViralidad: 2.7, rangoViralizacion: { min: 100, max: 125000, promedio: 8450 },
      nivelEngagement: 78, efectividadAlcance: { verdaderas: 3250, falsas: 8975, ratio: 0.36 },
      distribucionViralidad: [{ rango: '0-1K', casos: 456, porcentaje: 29 }]
    },
    datosGeograficos: {},
    datosDescriptivos: {},
    datosMitigacion: {}
};

export function MapaDesinfodemico() {
  const [regionSeleccionada, setRegionSeleccionada] = useState('andina');
  const [periodoTiempo, setPeriodoTiempo] = useState('semanal');
  const [dimensionActiva, setDimensionActiva] = useState('magnitud');
  
  const [mapaData, setMapaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');

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
      const result = await generateMapa((status) => setJobStatus(status));
      setMapaData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el mapa desinfodémico');
    } finally {
      setLoading(false);
    }
  }

  const getJobStatusMessage = (status: string): { message: string, detail?: string } => {
    if (status.startsWith('Job started with ID:')) {
        const jobId = status.split(': ')[1];
        return { 
            message: "Trabajo iniciado. Esperando en la cola...",
            detail: `ID: ${jobId.substring(0, 8)}...`
        };
    }
    switch (status) {
        case 'starting_job': return { message: "Iniciando conexión con el servidor..." };
        case 'pending': return { message: "El trabajo está en cola, iniciando pronto." };
        case 'processing': return { message: "Procesando y analizando datos..." };
        case 'completed': return { message: "Análisis completado. Generando visualización..." };
        case 'failed': return { message: "El análisis falló. Por favor, reintenta." };
        default: return { message: "Cargando..." };
    }
  };
  
  const datosMagnitud = mapaData?.datosMagnitud ?? mockMapaData.datosMagnitud;
  const datosTemporalidad = mapaData?.datosTemporalidad ?? mockMapaData.datosTemporalidad;
  const datosAlcance = mapaData?.datosAlcance ?? mockMapaData.datosAlcance;
  const datosGeograficos = mapaData?.datosGeograficos ?? mockMapaData.datosGeograficos;
  const datosDescriptivos = mapaData?.datosDescriptivos ?? mockMapaData.datosDescriptivos;
  const datosMitigacion = mapaData?.datosMitigacion ?? mockMapaData.datosMitigacion;

  if (loading) {
    const statusInfo = getJobStatusMessage(jobStatus);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="flex justify-center"><img src={botilitoImage} alt="Botilito generando mapa" className="w-48 h-48 object-contain animate-bounce" /></div>
        <Card className="w-full max-w-3xl shadow-lg border-2"><CardContent className="p-8 space-y-6"><h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Bot className="h-6 w-6 text-primary" />Generando mapa desinfodémico...</h2><div className="space-y-2"><Progress value={jobStatus === 'completed' ? 100 : jobStatus === 'processing' ? 60 : 30} className="w-full h-3" /><div className="space-y-1 mt-2"><p className="text-sm text-center text-muted-foreground font-medium">{statusInfo.message}</p>{statusInfo.detail && (<p className="text-xs text-center text-gray-400 font-mono">{statusInfo.detail}</p>)}</div></div></CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Alert variant="destructive" className="max-w-2xl"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error al cargar el mapa</AlertTitle><AlertDescription className="mt-2">{error}</AlertDescription></Alert>
        <Button onClick={loadMapaData} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img src={botilitoImage} alt="Botilito" className="w-24 h-24 object-contain" />
          <div className="flex-1">
            <p className="text-xl">¡Bienvenido al epicentro del análisis desinfodémico! 🗺️🔬</p>
            <p className="text-sm mt-1 opacity-80">Explora las 6 dimensiones de virulencia y descubre cómo se comporta la desinformación.</p>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary rounded-lg"><Activity className="h-8 w-8 text-primary-foreground" /></div>
                <div>
                    <h1 className="text-3xl">Mapa Desinfodémico de Colombia</h1>
                    <p className="text-muted-foreground">Análisis epidemiológico en tiempo real por dimensiones de virulencia</p>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-sm">Filtrar:</span></div>
        <Select value={periodoTiempo} onValueChange={setPeriodoTiempo}><SelectTrigger className="w-[140px] border-gray-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diario">Últimas 24h</SelectItem><SelectItem value="semanal">Última semana</SelectItem></SelectContent></Select>
      </div>

      <Tabs value={dimensionActiva} onValueChange={setDimensionActiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="magnitud" className="flex flex-col items-center py-3 px-2"><Database className="h-5 w-5 mb-1" /><span className="text-xs">Magnitud</span></TabsTrigger>
          <TabsTrigger value="temporalidad" className="flex flex-col items-center py-3 px-2"><Clock className="h-5 w-5 mb-1" /><span className="text-xs">Temporalidad</span></TabsTrigger>
          <TabsTrigger value="alcance" className="flex flex-col items-center py-3 px-2"><Flame className="h-5 w-5 mb-1" /><span className="text-xs">Virulencia</span></TabsTrigger>
          <TabsTrigger value="geograficos" className="flex flex-col items-center py-3 px-2"><MapPin className="h-5 w-5 mb-1" /><span className="text-xs">Geográficos</span></TabsTrigger>
          <TabsTrigger value="descriptivos" className="flex flex-col items-center py-3 px-2"><FileText className="h-5 w-5 mb-1" /><span className="text-xs">Descriptivos</span></TabsTrigger>
          <TabsTrigger value="mitigacion" className="flex flex-col items-center py-3 px-2"><Shield className="h-5 w-5 mb-1" /><span className="text-xs">Mitigación</span></TabsTrigger>
        </TabsList>

        <TabsContent value="magnitud"><DimensionMagnitud data={datosMagnitud} /></TabsContent>
        <TabsContent value="temporalidad"><DimensionTemporalidad data={datosTemporalidad} /></TabsContent>
        <TabsContent value="alcance"><DimensionAlcance data={datosAlcance} /></TabsContent>
        <TabsContent value="geograficos"><DimensionGeografica data={datosGeograficos} /></TabsContent>
        <TabsContent value="descriptivos"><DimensionDescriptiva data={datosDescriptivos} /></TabsContent>
        <TabsContent value="mitigacion"><DimensionMitigacion data={datosMitigacion} /></TabsContent>
      </Tabs>
      
      <Alert className="border-blue-200 bg-blue-50/50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>* = Datos de prueba:</strong> Los valores marcados con asterisco (*) son datos de ejemplo o estimaciones.
        </AlertDescription>
      </Alert>
    </div>
  );
}
