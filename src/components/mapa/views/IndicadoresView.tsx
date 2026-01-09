import React from 'react';
import { Brain, Fingerprint, Activity, CheckCircle, ShieldAlert, AlertTriangle, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IndicatorsGroup } from '../types';

interface IndicadoresViewProps {
  data: IndicatorsGroup;
}

export function IndicadoresView({ data }: IndicadoresViewProps) {
  const { ami, forensic, epidemiological } = data;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* AMI Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-purple-700">
          <Brain className="h-5 w-5" />
          <h3 className="font-bold text-lg">Indicadores de Alfabetización Mediática (AMI)</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 -mt-2">Métricas oficiales del potencial educativo del contenido textual</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Green */}
          <div className="rounded-xl border p-6 bg-green-50/50 border-green-200 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
               <span className="font-semibold text-gray-700">Desarrolla Premisas AMI</span>
               <Brain className="h-4 w-4 text-green-600" />
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{ami.develops_rate}%</div>
             <p className="text-xs text-gray-500 font-medium mb-4">potencial educativo</p>
             <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">Alto potencial</Badge>
          </div>

          {/* Card 2: Orange */}
          <div className="rounded-xl border p-6 bg-orange-50/50 border-orange-200 shadow-sm relative">
             <div className="flex justify-between items-start mb-4">
               <span className="font-semibold text-gray-700">Requiere Enfoque AMI</span>
               <AlertTriangle className="h-4 w-4 text-orange-600" />
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{ami.needs_focus_rate}%</div>
             <p className="text-xs text-gray-500 font-medium">necesita educación crítica</p>
          </div>

          {/* Card 3: Blue */}
          <div className="rounded-xl border p-6 bg-blue-50/50 border-blue-200 shadow-sm relative">
             <div className="flex justify-between items-start mb-4">
               <span className="font-semibold text-gray-700">Índice AMI (IAMI)</span>
               <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
               </div>
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{ami.iami_score}</div>
             <p className="text-[10px] text-gray-400 mb-3">compuesto: Requiere×0.6 + Desarrolla×0.4</p>
             <Badge className="bg-amber-600 hover:bg-amber-700 text-white border-0">Moderado</Badge>
          </div>
        </div>
      </section>

      {/* Forensic Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-blue-700">
          <Fingerprint className="h-5 w-5" />
          <h3 className="font-bold text-lg">Indicadores de Análisis Forense</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 -mt-2">Métricas oficiales de autenticidad y manipulación multimedia</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Authentic */}
          <div className="rounded-xl border p-5 bg-green-50/30 border-green-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <span className="font-semibold text-gray-700">Sin Alteraciones</span>
               <CheckCircle className="h-4 w-4 text-green-500"/>
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{forensic.authentic_rate}%</div>
             <p className="text-xs text-gray-500 mb-4">contenido auténtico</p>
             <div className="w-full bg-green-100 h-1.5 rounded-full"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${forensic.authentic_rate}%`}}></div></div>
          </div>

          {/* Manipulated */}
          <div className="rounded-xl border p-5 bg-orange-50/30 border-orange-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <span className="font-semibold text-gray-700">Manipulado</span>
               <AlertTriangle className="h-4 w-4 text-orange-500"/>
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{forensic.manipulated_rate}%</div>
             <p className="text-xs text-gray-500 mb-4">editado digitalmente</p>
             <div className="w-full bg-orange-100 h-1.5 rounded-full"><div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${forensic.manipulated_rate}%`}}></div></div>
          </div>

          {/* AI Generated */}
          <div className="rounded-xl border p-5 bg-blue-50/30 border-blue-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <span className="font-semibold text-gray-700">Generado IA</span>
               <Cpu className="h-4 w-4 text-blue-500"/>
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{forensic.ai_rate}%</div>
             <p className="text-xs text-gray-500 mb-4">creado por IA</p>
             <div className="w-full bg-blue-100 h-1.5 rounded-full"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${forensic.ai_rate}%`}}></div></div>
          </div>

          {/* Deepfakes (Full Width Style in Grid) */}
          <div className="rounded-xl border p-5 bg-red-50/30 border-red-200 shadow-sm relative">
             <div className="flex justify-between items-center mb-4">
               <span className="font-semibold text-gray-700">Deepfakes</span>
               <ShieldAlert className="h-4 w-4 text-red-500"/>
             </div>
             <div className="text-4xl font-extrabold text-gray-900 mb-1">{forensic.deepfake_rate}%</div>
             <p className="text-xs text-gray-500 mb-4">suplantación identidad</p>
             <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 text-[10px] px-2 py-0.5">Vigilancia</Badge>
          </div>
        </div>
        
        {/* Risk Index (Full Width) */}
        <div className="mt-6 rounded-xl border p-5 bg-blue-50/30 border-blue-200 shadow-sm flex flex-col md:flex-row justify-between items-center">
          <div>
            <h4 className="font-semibold text-gray-700">Índice de Riesgo Forense (IRF)</h4>
            <div className="text-4xl font-extrabold text-gray-900 mt-1">19%</div>
            <p className="text-[10px] text-gray-500 mt-1">compuesto: Deepfake×0.5 + IA×0.3 + Manipulado×0.2</p>
          </div>
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white h-7 px-3 mt-4 md:mt-0">Riesgo Moderado</Badge>
        </div>
      </section>

      {/* Epi Section */}
      <section className="bg-white p-0 rounded-xl">
        <div className="flex items-center gap-2 mb-4 text-yellow-700">
          <Activity className="h-5 w-5" />
          <h3 className="font-bold text-lg">Indicadores Epidemiológicos Básicos</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 -mt-2">Indicadores oficiales alineados con el Centro de Documentación</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* R0 */}
          <div className="bg-red-50/30 border border-red-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-gray-700">R₀ - Reproducción</span>
              <Activity className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-3xl font-extrabold my-2 text-gray-900">{epidemiological.r0}</div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">casos nuevos/caso</p>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-[10px]">Crecimiento</Badge>
          </div>

          {/* Velocidad */}
          <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-gray-700">Velocidad Transmisión</span>
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-extrabold my-2 text-gray-900">{epidemiological.transmission_speed}</div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">rapidez de propagación</p>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-[10px]">Rápida</Badge>
          </div>

          {/* Infectividad */}
          <div className="bg-red-50/30 border border-red-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-gray-700">Infectividad</span>
              <Activity className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-3xl font-extrabold my-2 text-gray-900">{epidemiological.infectivity}</div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">prob. de compartir</p>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-[10px]">Alta</Badge>
          </div>

          {/* Virulencia */}
          <div className="bg-purple-50/30 border border-purple-100 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-gray-700">Virulencia</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold my-2 text-gray-900">{epidemiological.virulence}</div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">severidad de daño</p>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 text-[10px]">Alta</Badge>
          </div>
        </div>

        {/* Bottom Row Epi (Casos Activos, Densidad, etc) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
           <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-1">Casos Activos</div>
              <div className="text-3xl font-extrabold text-gray-900">1,634</div>
              <p className="text-xs text-gray-500">en circulación</p>
           </div>
           <div className="bg-cyan-50/30 border border-cyan-100 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-1">Densidad</div>
              <div className="text-3xl font-extrabold text-gray-900">3.2</div>
              <p className="text-xs text-gray-500">casos/100k hab.</p>
           </div>
           <div className="bg-teal-50/30 border border-teal-100 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-1">Tiempo Detección</div>
              <div className="text-3xl font-extrabold text-gray-900">2.8h</div>
              <Badge className="bg-teal-600 text-white text-[10px] mt-2">Muy rápida</Badge>
           </div>
           <div className="bg-green-50/30 border border-green-100 rounded-xl p-5">
              <div className="text-sm font-semibold text-gray-700 mb-1">Consenso Humano+IA</div>
              <div className="text-3xl font-extrabold text-gray-900">87.3%</div>
              <Badge className="bg-green-600 text-white text-[10px] mt-2">Alto</Badge>
           </div>
        </div>
      </section>
    </div>
  );
}
