import React from 'react';
import { DetailedMetrics } from '../types';
import { Scale, Clock, Globe, Zap, Shield } from 'lucide-react';
import { MetricCard, MetricRow } from '../components/MetricCard';

interface DiagnosticoViewProps {
  data: DetailedMetrics;
}

export function DiagnosticoView({ data }: DiagnosticoViewProps) {
  const { magnitude, temporality, reach, impact, response } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pl-1">
        <Scale className="h-6 w-6 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">Métricas Detalladas de Diagnóstico</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <MetricCard title="Magnitud" icon={Scale} color="blue">
          <MetricRow label="Tasa de Generación" value={magnitude.generation_rate} />
          <MetricRow label="Recurrencia" value={magnitude.recurrence} />
          <MetricRow label="Diversidad de Fuentes" value={magnitude.source_diversity} />
          <MetricRow label="Concentración" value={magnitude.content_concentration} />
          <MetricRow label="Tasa de Incidencia" value={magnitude.incidence_rate} />
        </MetricCard>

        <MetricCard title="Temporalidad" icon={Clock} color="orange">
          <MetricRow label="Tiempo Detección" value={temporality.detection_time} />
          <MetricRow label="Velocidad Transmisión" value={temporality.transmission_speed} />
          <MetricRow label="Tiempo Resolución" value={temporality.resolution_time} />
          <MetricRow label="Latencia Respuesta" value={temporality.response_latency} />
          <MetricRow label="Frecuencia Pico" value={temporality.peak_frequency} />
        </MetricCard>

        <MetricCard title="Alcance" icon={Globe} color="purple">
          <MetricRow label="Índice Viral" value={reach.viral_index} />
          <MetricRow label="Engagement" value={reach.engagement} />
          <MetricRow label="Tasa Difusión" value={reach.diffusion_rate} />
          <MetricRow label="Demografía" value={reach.demographics} />
          <MetricRow label="Amplitud Canales" value={reach.channel_amplitude} />
        </MetricCard>

        <MetricCard title="Impacto" icon={Zap} color="red">
          <MetricRow label="Exposición Acumulada" value={impact.cumulative_exposure.toLocaleString()} />
          <MetricRow label="Población Expuesta" value={impact.exposed_population.toLocaleString()} />
          <MetricRow label="Tasa de Penetración" value={impact.penetration_rate} />
        </MetricCard>

        <MetricCard title="Respuesta" icon={Shield} color="green">
          <MetricRow label="Efectividad" value={response.effectiveness} />
          <MetricRow label="Tasa de Consenso" value={response.consensus_rate} />
          <MetricRow label="Participación" value={response.participation} />
        </MetricCard>

      </div>
    </div>
  );
}
