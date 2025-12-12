import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

// TOGGLE: Set to true to use comprehensive mock data, false to use real API data
const USE_MOCK_DATA = false;

// COMPREHENSIVE MOCK DATA: Realistic Colombian-context data for demo/testing purposes
const mockMapaData = {
    datosMagnitud: {
      noticiasReportadas: 1567,
      noticiasReportadasSemana: 234,
      noticiasReportadasMes: 892,
      deteccionesPorIA: 1234,
      deteccionesPorHumanos: 1189,
      tiempoDeteccionIA: 2.3,
      tiempoDeteccionHumanos: 4.8,
      fuentesGeneradoras: [
        { fuente: '@noticiasfalsas_col', casos: 456, tipo: 'Cuenta Twitter' },
        { fuente: 'Noticias Víricas Colombia', casos: 389, tipo: 'Grupo WhatsApp' },
        { fuente: '@desinforma_hoy', casos: 312, tipo: 'Cuenta Facebook' },
        { fuente: 'La Verdad Oculta CO', casos: 267, tipo: 'Canal Telegram' },
        { fuente: '@infofake_col', casos: 198, tipo: 'Cuenta Instagram' }
      ]
    },
    datosTemporalidad: {
      velocidadDeteccion: 3.8,
      tiempoViralizacionPromedio: 6.2,
      evolucionSemanal: [
        { semana: 'Sem 1', detectadas: 234, viralizadas: 189, tiempo: 5.8 },
        { semana: 'Sem 2', detectadas: 298, viralizadas: 245, tiempo: 6.1 },
        { semana: 'Sem 3', detectadas: 312, viralizadas: 267, tiempo: 5.9 },
        { semana: 'Sem 4', detectadas: 278, viralizadas: 223, tiempo: 6.3 },
        { semana: 'Sem 5', detectadas: 345, viralizadas: 298, tiempo: 6.0 },
        { semana: 'Sem 6', detectadas: 389, viralizadas: 334, tiempo: 5.7 }
      ],
      comparativaVerdaderasVsFalsas: [
        { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
        { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
      ]
    },
    datosAlcance: {
      indiceViralidad: 2.7,
      rangoViralizacion: { min: 100, max: 125000, promedio: 8450 },
      nivelEngagement: 78,
      efectividadAlcance: { verdaderas: 3250, falsas: 8975, ratio: 0.36 },
      distribucionViralidad: [
        { rango: '0-1K', casos: 456, porcentaje: 29 },
        { rango: '1K-5K', casos: 389, porcentaje: 25 },
        { rango: '5K-10K', casos: 312, porcentaje: 20 },
        { rango: '10K-50K', casos: 267, porcentaje: 17 },
        { rango: '50K-100K', casos: 89, porcentaje: 6 },
        { rango: '100K+', casos: 54, porcentaje: 3 }
      ]
    },
    datosGeograficos: {
      casosPorRegion: [
        { region: 'Andina', casos: 678, densidad: 45.2, color: '#ef4444' },
        { region: 'Caribe', casos: 423, densidad: 38.7, color: '#f97316' },
        { region: 'Pacífica', casos: 298, densidad: 31.4, color: '#fb923c' },
        { region: 'Orinoquía', casos: 98, densidad: 19.8, color: '#fbbf24' },
        { region: 'Amazonía', casos: 70, densidad: 12.3, color: '#a3e635' }
      ],
      mapaCalor: [
        { departamento: 'Bogotá D.C.', casos: 312 },
        { departamento: 'Antioquia', casos: 289 },
        { departamento: 'Valle del Cauca', casos: 256 },
        { departamento: 'Atlántico', casos: 198 },
        { departamento: 'Santander', casos: 167 }
      ],
      fuentesInternacionalesVsNacionales: {
        internacionales: 423,
        nacionales: 1144,
        porcentajeInternacional: 27
      }
    },
    datosDescriptivos: {
      porSector: [
        { sector: 'Política', casos: 512, porcentaje: 33 },
        { sector: 'Salud', casos: 389, porcentaje: 25 },
        { sector: 'Economía', casos: 298, porcentaje: 19 },
        { sector: 'Seguridad', casos: 234, porcentaje: 15 },
        { sector: 'Tecnología', casos: 89, porcentaje: 6 },
        { sector: 'Entretenimiento', casos: 45, porcentaje: 2 }
      ],
      plataformasPropagacion: [
        { plataforma: 'WhatsApp', casos: 567, porcentaje: 36 },
        { plataforma: 'Facebook', casos: 445, porcentaje: 28 },
        { plataforma: 'Twitter/X', casos: 334, porcentaje: 21 },
        { plataforma: 'Instagram', casos: 156, porcentaje: 10 },
        { plataforma: 'Telegram', casos: 65, porcentaje: 5 }
      ],
      personalidadesAtacadas: [
        { nombre: 'Gustavo Petro', ataques: 178 },
        { nombre: 'Claudia López', ataques: 134 },
        { nombre: 'Álvaro Uribe', ataques: 112 },
        { nombre: 'Federico Gutiérrez', ataques: 89 },
        { nombre: 'Roy Barreras', ataques: 67 }
      ],
      sectorMasEficiente: {
        sector: 'Política',
        alcancePromedio: 12450,
        viralidad: 87
      }
    },
    datosMitigacion: {
      consensoValidacionHumana: 87,
      consensoHumanoVsIA: {
        acuerdo: 82,
        desacuerdo: 18
      },
      distribucionDesacuerdo: [
        { categoria: 'Contexto ambiguo', porcentaje: 42, casos: 76 },
        { categoria: 'Sátira vs Desinformación', porcentaje: 28, casos: 51 },
        { categoria: 'Información desactualizada', porcentaje: 18, casos: 33 },
        { categoria: 'Opinión vs Hecho', porcentaje: 12, casos: 22 }
      ],
      noticiasMasReportadas: [
        { titulo: 'Supuesto plan de vacunación forzosa con chips 5G', reportes: 234 },
        { titulo: 'Falso decreto sobre confiscación de propiedades', reportes: 198 },
        { titulo: 'Rumor de desabastecimiento alimentario en Bogotá', reportes: 167 },
        { titulo: 'Información falsa sobre reforma tributaria', reportes: 145 },
        { titulo: 'Video manipulado de candidato presidencial', reportes: 123 }
      ],
      redEpidemiologos: {
        totalActivos: 47,
        casosProcesados: 1567,
        tiempoPromedioVerificacion: 3.2
      },
      redInmunizadores: {
        totalActivos: 23,
        estrategiasDesarrolladas: 89,
        alcanceTotal: 2340000
      }
    }
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
    // Skip API call if using mock data
    if (USE_MOCK_DATA) {
      setLoading(false);
      return;
    }

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
  
  // Data assignment: USE_MOCK_DATA toggle controls whether to use mock or real API data
  const datosMagnitud = USE_MOCK_DATA
    ? mockMapaData.datosMagnitud
    : (mapaData?.datosMagnitud ?? mockMapaData.datosMagnitud);

  const datosTemporalidad = USE_MOCK_DATA
    ? mockMapaData.datosTemporalidad
    : (mapaData?.datosTemporalidad ?? mockMapaData.datosTemporalidad);

  const datosAlcance = USE_MOCK_DATA
    ? mockMapaData.datosAlcance
    : (mapaData?.datosAlcance ?? mockMapaData.datosAlcance);

  const datosGeograficos = USE_MOCK_DATA
    ? mockMapaData.datosGeograficos
    : (mapaData?.datosGeograficos ?? mockMapaData.datosGeograficos);

  const datosDescriptivos = USE_MOCK_DATA
    ? mockMapaData.datosDescriptivos
    : (mapaData?.datosDescriptivos ?? mockMapaData.datosDescriptivos);

  const datosMitigacion = USE_MOCK_DATA
    ? mockMapaData.datosMitigacion
    : (mapaData?.datosMitigacion ?? mockMapaData.datosMitigacion);

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
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl">Mapa Desinfodémico de Colombia</h1>
                      {USE_MOCK_DATA && (
                        <Badge className="bg-blue-500 text-white">Modo Demo</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">Análisis epidemiológico en tiempo real por dimensiones de virulencia</p>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={USE_MOCK_DATA ? undefined : loadMapaData}
              disabled={USE_MOCK_DATA}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
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
