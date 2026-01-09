import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Activity, CheckCircle2, PencilLine, TrendingUp, TrendingDown, Flame, Users } from 'lucide-react';
import { KPIData } from './types';

interface KPICardsProps {
  kpi: KPIData;
  caseTrend?: number | null;
}

export function KPICards({ kpi, caseTrend }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      
      {/* Total Cases */}
      <Card className="shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Total de Casos</p>
              <div className="text-3xl font-bold text-gray-900">{kpi?.total_cases?.toLocaleString() || 0}</div>
            </div>
            <div className="p-4 rounded-full bg-blue-500 text-white shadow-md ml-2">
              <Database className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium">
            {caseTrend !== null && caseTrend !== undefined ? (
              <>
                {caseTrend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={caseTrend > 0 ? 'text-red-500' : 'text-green-500'}>
                  {caseTrend > 0 ? '+' : ''}{caseTrend.toFixed(1)}%
                </span>
                <span className="text-gray-600 ml-1">esta semana</span>
              </>
            ) : (
              <span className="text-gray-400">Sin datos históricos</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Cases */}
      <Card className="shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-white border-2 border-orange-300 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Casos Activos</p>
              <div className="text-3xl font-bold text-gray-900">{kpi?.active_cases?.toLocaleString() || 0}</div>
            </div>
            <div className="p-4 rounded-full bg-orange-500 text-white shadow-md ml-2">
              <Activity className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-orange-500">
            <Flame className="h-3 w-3 mr-1" />
            En análisis
          </div>
        </CardContent>
      </Card>

      {/* Consensus */}
      <Card className="shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Consenso Promedio</p>
              <div className="text-3xl font-bold text-gray-900">{kpi?.average_consensus || '0%'}</div>
            </div>
            <div className="p-4 rounded-full bg-green-500 text-white shadow-md ml-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-green-600">
            <Users className="h-3 w-3 mr-1" />
            {kpi?.total_validations ? `${kpi.total_validations.toLocaleString()} validaciones` : 'Sin validaciones'}
          </div>
        </CardContent>
      </Card>

      {/* PI Generated */}
      <Card className="shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-300 rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">PI Generados</p>
              <div className="text-3xl font-bold text-gray-900">{kpi?.pi_generated?.toLocaleString() || 0}</div>
            </div>
            <div className="p-4 rounded-full bg-yellow-500 text-white shadow-md ml-2">
              <PencilLine className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-yellow-600">
            <Users className="h-3 w-3 mr-1" />
            {kpi?.active_users || 0} usuarios activos
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
