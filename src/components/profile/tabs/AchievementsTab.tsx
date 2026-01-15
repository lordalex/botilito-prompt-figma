import React from 'react';
import type { Achievement } from '../types';

interface AchievementsTabProps {
  achievements: Achievement[];
}

// Helper para calcular progreso y completados
const getCompletedCount = (achievements: Achievement[]) => achievements.filter(a => a.completed).length;

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ achievements }) => {
  const total = achievements.length;
  const completed = getCompletedCount(achievements);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span>Logros de la Plataforma</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {completed} de {total} logros completados
        </p>
      </header>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {achievements.map((a) => {
          const percent = Math.round((a.current / a.target) * 100);
          return (
            <div
              key={a.id}
              className={`relative bg-white rounded-xl border ${a.completed ? 'border-green-300' : 'border-gray-200'} shadow-sm p-5 flex flex-col gap-2`}
            >
              {/* Icon + Nombre + PI */}
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={a.icon}
                  alt={a.name}
                  className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-base">{a.name}</span>
                </div>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                  +{a.piReward} PI
                </span>
              </div>

              {/* Descripción */}
              <p className="text-sm text-gray-700 mb-2">{a.description}</p>

              {/* Progress bar + valores */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${a.completed ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${percent > 100 ? 100 : percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[48px] text-right">
                  {a.current} / {a.target}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {percent}% completado
                </span>
                {a.completed ? (
                  <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                    ✓ Completado
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
