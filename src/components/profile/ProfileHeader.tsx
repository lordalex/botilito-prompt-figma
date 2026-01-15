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
    <div className="flex md:flex-row items-start gap-6 w-full bg-white rounded-lg p-6">
      {/* Avatar + Nivel */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-yellow-300 shadow object-cover"
        />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          Nv.{level}
        </span>
      </div>

      {/* Datos usuario + bio + progreso */}
      <div className="flex-1 flex flex-col gap-3 min-w-[220px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-gray-900">{displayName}</span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {email}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">{rank}</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            {region}
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            Desde {formatDate(memberSince)}
          </span>
        </div>
        <blockquote className="italic text-gray-600 text-sm max-w-xl">"{bio}"</blockquote>
        {/* Barra de progreso rango */}
        <div className="mt-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-400">Progreso al siguiente rango</span>
            <span className="text-sm font-semibold text-gray-900">{currentPI} / {nextRankPI} PI</span>
          </div>
          <div className="w-full h-2.5 bg-yellow-100 rounded-full overflow-hidden">
            <div
              className="h-2.5 bg-primary rounded-full transition-all"
              style={{ width: `${piPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-600">Próximo rango: <span className="font-semibold text-gray-800">{nextRankName}</span></span>
            <span className="text-xs text-gray-500">({nextRankPI - currentPI} PI restantes)</span>
          </div>
        </div>
      </div>

      {/* PI Score Card */}
      <div className="flex flex-col items-center justify-center bg-primary rounded-2xl px-8 py-6 min-w-[180px] shadow-lg">
        <span className="text-gray-900 text-4xl mb-1">🏆</span>
        <span className="text-4xl font-bold text-gray-900">{currentPI.toLocaleString('es-ES')}</span>
        <span className="text-xs font-semibold text-gray-900 mt-1">Puntos de Inmunización</span>
        <div className="flex items-center gap-1 mt-3 text-xs">
          <span className="text-gray-800">Ranking: <span className="font-bold text-purple-600">#{ranking}</span> / {totalUsers.toLocaleString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}
