import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailedMetrics } from '../types';
import { Scale, Clock, Globe, Zap, Shield } from 'lucide-react';

interface DiagnosticoViewProps {
  data: DetailedMetrics;
}

export function DiagnosticoView({ data }: DiagnosticoViewProps) {
  const { magnitude, temporality, reach, impact, response } = data;

  const MetricRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded transition-colors">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Scale className="h-6 w-6 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">Métricas Detalladas de Diagnóstico</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Magnitud - Blue */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Scale className="h-5 w-5" />
              </div>
              Magnitud
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <MetricRow label="Tasa de Generación" value={magnitude.generation_rate} />
            <MetricRow label="Recurrencia" value={magnitude.recurrence} />
            <MetricRow label="Diversidad de Fuentes" value={magnitude.source_diversity} />
            <MetricRow label="Concentración" value={magnitude.content_concentration} />
            <MetricRow label="Tasa de Incidencia" value={magnitude.incidence_rate} />
          </CardContent>
        </Card>

        {/* Temporalidad - Orange */}
        <Card className="border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              Temporalidad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <MetricRow label="Tiempo Detección" value={temporality.detection_time} />
            <MetricRow label="Velocidad Transmisión" value={temporality.transmission_speed} />
            <MetricRow label="Tiempo Resolución" value={temporality.resolution_time} />
            <MetricRow label="Latencia Respuesta" value={temporality.response_latency} />
            <MetricRow label="Frecuencia Pico" value={temporality.peak_frequency} />
          </CardContent>
        </Card>

        {/* Alcance - Purple */}
        <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Globe className="h-5 w-5" />
              </div>
              Alcance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <MetricRow label="Índice Viral" value={reach.viral_index} />
            <MetricRow label="Engagement" value={reach.engagement} />
            <MetricRow label="Tasa Difusión" value={reach.diffusion_rate} />
            <MetricRow label="Demografía" value={reach.demographics} />
            <MetricRow label="Amplitud Canales" value={reach.channel_amplitude} />
          </CardContent>
        </Card>

        {/* Impacto - Red */}
        <Card className="border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <Zap className="h-5 w-5" />
              </div>
              Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <MetricRow label="Exposición Acumulada" value={impact.cumulative_exposure.toLocaleString()} />
            <MetricRow label="Población Expuesta" value={impact.exposed_population.toLocaleString()} />
            <MetricRow label="Tasa de Penetración" value={impact.penetration_rate} />
          </CardContent>
        </Card>

        {/* Respuesta - Green */}
        <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Shield className="h-5 w-5" />
              </div>
              Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <MetricRow label="Efectividad" value={response.effectiveness} />
            <MetricRow label="Tasa de Consenso" value={response.consensus_rate} />
            <MetricRow label="Participación" value={response.participation} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
