import React from 'react';

// Definición local del tipo según PROFILE_DEVELOPMENT_PLAN.md y types.ts
interface StatsTabProps {
  generalStats: {
    casesRegistered: number;
    validations: number;
    consensusAverage: number;
    deepfakesDetected: number;
    caseViews: number;
  };
  rankingStats: {
    ranking: number;
    totalUsers: number;
    topPercent: number;
    currentStreak: number;
    bestStreak: number;
    badgesCount: number;
    achievementsCount: number;
    totalPI: number;
  };
}

const StatsTab: React.FC<StatsTabProps> = ({ generalStats, rankingStats }) => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Panel izquierdo: Estadísticas Generales */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-blue-600">📊</span>
          Estadísticas Generales
        </h2>
        <ul className="flex flex-col gap-3">
          <li className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-blue-700">Casos Registrados</span>
            <span className="font-bold text-blue-900">{generalStats.casesRegistered}</span>
          </li>
          <li className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-purple-700">Validaciones Completadas</span>
            <span className="font-bold text-purple-900">{generalStats.validations}</span>
          </li>
          <li className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-green-700">Consenso Promedio</span>
            <span className="font-bold text-green-900">{generalStats.consensusAverage}%</span>
          </li>
          <li className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-red-700">Deepfakes Detectados</span>
            <span className="font-bold text-red-900">{generalStats.deepfakesDetected}</span>
          </li>
          <li className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-yellow-700">Vistas de Casos</span>
            <span className="font-bold text-yellow-900">{generalStats.caseViews}</span>
          </li>
        </ul>
      </div>

      {/* Panel derecho: Ranking y Logros */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-yellow-500">🏆</span>
          Ranking y Logros
        </h2>
        <div className="flex flex-col gap-3">
          {/* Ranking Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-5 flex flex-col items-center justify-center text-center relative">
            <span className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">Top {rankingStats.topPercent}%</span>
            <span className="text-3xl font-bold text-yellow-700">#{rankingStats.ranking}</span>
            <span className="text-sm text-gray-700 mt-1">de {rankingStats.totalUsers} usuarios</span>
            <span className="text-xs text-gray-500 mt-1">Ranking Comunitario</span>
          </div>

          {/* Mejor Racha y Racha Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex flex-col items-center">
              <span className="text-orange-700 font-bold text-xl">{rankingStats.currentStreak}</span>
              <span className="text-xs text-orange-700 mt-1">Racha Actual</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex flex-col items-center">
              <span className="text-green-700 font-bold text-xl">{rankingStats.bestStreak}</span>
              <span className="text-xs text-green-700 mt-1">Mejor Racha</span>
            </div>
          </div>

          {/* Insignias y Logros */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 flex flex-col items-center">
              <span className="text-purple-700 font-bold text-xl">{rankingStats.badgesCount}</span>
              <span className="text-xs text-purple-700 mt-1">Insignias</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col items-center">
              <span className="text-blue-700 font-bold text-xl">{rankingStats.achievementsCount}</span>
              <span className="text-xs text-blue-700 mt-1">Logros</span>
            </div>
          </div>

          {/* PI Total Card */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-5 flex flex-col items-center mt-2">
            <span className="text-3xl font-bold text-yellow-700 flex items-center gap-2">
              <span>🏅</span>
              {rankingStats.totalPI}
            </span>
            <span className="text-xs text-yellow-700 mt-1">Puntos de Inmunización</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsTab;
