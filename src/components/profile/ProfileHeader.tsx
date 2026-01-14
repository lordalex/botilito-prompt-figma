// ProfileHeader.tsx
// Fase 2: ProfileHeader
// Archivo generado según el plan de desarrollo

import React from 'react';

export interface ProfileHeaderProps {
  avatarUrl: string;
  displayName: string;
  email: string;
  level: number;
  rank: string;
  region: string;
  memberSince: Date;
  bio: string;
  currentPI: number;
  nextRankPI: number;
  nextRankName: string;
  ranking: number;
  totalUsers: number;
}

// Utilidad para formatear fecha
function formatDate(date: Date) {
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  displayName,
  email,
  level,
  rank,
  region,
  memberSince,
  bio,
  currentPI,
  nextRankPI,
  nextRankName,
  ranking,
  totalUsers,
}) => {
  // Calcular progreso PI
  const piPercent = Math.min(100, Math.round((currentPI / nextRankPI) * 100));

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full max-w-7xl mx-auto py-6">
      {/* Avatar + Nivel */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
        />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white">
          Nv.{level}
        </span>
      </div>

      {/* Datos usuario + bio + progreso */}
      <div className="flex-1 flex flex-col gap-2 min-w-[220px]">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold text-gray-900">{displayName}</span>
          <span className="text-sm text-gray-600">{email}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">{rank}</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-semibold">{region}</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-semibold">Desde {formatDate(memberSince)}</span>
        </div>
        <blockquote className="italic text-gray-700 mt-2 max-w-xl">“{bio}”</blockquote>
        {/* Barra de progreso rango */}
        <div className="mt-3 w-full max-w-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Progreso al siguiente rango</span>
            <span className="text-xs text-gray-600">{currentPI} / {nextRankPI} PI</span>
          </div>
          <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden">
            <div
              className="h-3 bg-yellow-400 rounded-full transition-all"
              style={{ width: `${piPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-700">Próximo rango: <b>{nextRankName}</b></span>
            <span className="text-xs text-gray-700">({nextRankPI - currentPI} PI restantes)</span>
          </div>
        </div>
      </div>

      {/* PI Score Card */}
      <div className="flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 min-w-[140px] shadow-md">
        <span className="text-3xl font-bold text-yellow-700">{currentPI.toLocaleString('es-ES')}</span>
        <span className="text-sm text-gray-700 mt-1">Puntos de Inmunización</span>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-500">Ranking:</span>
          <span className="font-bold text-purple-700">#{ranking}</span>
          <span className="text-xs text-gray-500">/ {totalUsers.toLocaleString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}
