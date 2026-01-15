// SummaryTab.tsx
// Fase 5: SummaryTab
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge, Achievement } from '../types';
import { Target, Calendar, BookOpen, Shield, Zap, Layers, TrendingUp, Activity } from 'lucide-react';

export interface SummaryTabProps {
  streak: { current: number; best: number };
  recentBadges: Badge[];
  achievementsInProgress: Achievement[];
}

function formatDate(date?: Date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ streak, recentBadges, achievementsInProgress }) => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      {/* Header sección */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" strokeWidth={2.5} />
          <h2 className="text-lg font-bold text-gray-900">Resumen de Actividad</h2>
        </div>
        <p className="text-sm text-gray-600">Tu contribución a la lucha contra la desinformación</p>
      </div>

      {/* Streak Card */}
      <div className="bg-orange-100 border-l-4 border-orange-400 rounded-md p-4 flex items-center justify-between mb-4">
        <div>
          <span className="font-semibold text-orange-800">Racha de Vigilancia Activa</span>
          <p className="text-sm text-orange-700 mt-1">¡Llevás <b>{streak.current}</b> días consecutivos protegiendo la verdad!</p>
          <span className="text-xs text-gray-600 block mt-2">Mejor racha: <b>{streak.best}</b> días</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-orange-600">{streak.current}</span>
          <span className="text-xs text-orange-700">días <span className="inline-block">🔥</span></span>
        </div>
      </div>

      {/* Recent Badges */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Últimas Insignias Ganadas</h3>
        <div className="grid grid-cols-2 gap-4">
          {recentBadges.map((badge, idx) => {
            // Mapeo de iconos por índice
            const icons = [Target, Calendar, BookOpen, Shield];
            const IconComponent = icons[idx % icons.length];

            return (
              <div key={badge.id || idx} className="flex items-center bg-white border rounded-lg p-3 shadow-sm gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-amber-700">
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{badge.name}</span>
                  <span className="block text-xs text-gray-500">{formatDate(badge.unlockedAt)}</span>
                </div>
                <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full ml-2">+{badge.piReward} PI</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements In Progress */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Logros en Progreso</h3>
        <div className="flex flex-col gap-4">
          {achievementsInProgress.map((ach, idx) => {
            const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));
            // Mapeo de iconos por índice
            const icons = [Zap, Layers, TrendingUp, Target, Calendar, BookOpen, Shield];
            const IconComponent = icons[idx % icons.length];

            return (
              <div key={ach.id || idx} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200">
                    <IconComponent className="w-7 h-7 text-gray-700" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 text-base block">{ach.name}</span>
                    <span className="text-xs text-gray-600">{ach.description}</span>
                  </div>
                  <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">+{ach.piReward} PI</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>{ach.current} / {ach.target}</span>
                  <span>{percent}% completado</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
