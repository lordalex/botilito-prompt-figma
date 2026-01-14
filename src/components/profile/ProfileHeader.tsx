// ProfileHeader.tsx
// Fase 2: ProfileHeader
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge } from './types';

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

// Componente base (estructura, sin UI ni lógica interna)
export const ProfileHeader: React.FC<ProfileHeaderProps> = (props) => {
  // Estructura base, sin implementación UI
  return (
    <div>
      {/* Layout base: avatar, datos, PI card */}
      {/* Avatar con nivel */}
      {/* Info usuario: nombre, email, badges (rango, región, fecha) */}
      {/* Bio */}
      {/* Barra progreso rango */}
      {/* PI Score Card */}
      {/* TODO: Implementar UI según plan en siguientes fases */}
      <span>ProfileHeader (estructura base)</span>
    </div>
  );
}
