// ProfilePage.tsx
// Fase 9: ProfilePage (Integración)
// Archivo generado según el plan de desarrollo

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from './ProfileHeader';
import { BadgesAndKPI } from './BadgesAndKPI';
import { ProfileTabs } from './ProfileTabs';
import type { ProfileData } from './types';
import { Separator } from '../ui/separator';

// Mock data para desarrollo (según plan)
const mockProfile: ProfileData = {
  user: {
    id: '1',
    displayName: 'María Rodríguez',
    email: 'maria.rodriguez@botilito.co',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaRodriguez',
    level: 1,
    rank: 'Cibernauta Centinela',
    region: 'Región Andina',
    memberSince: new Date('2024-09-01'),
    bio: 'Observador responsable en la primera línea contra la desinformación',
  },
  gamification: {
    currentPI: 2350,
    nextRankPI: 2500,
    nextRankName: 'Cibernauta AMI',
    ranking: 156,
    totalUsers: 5432,
    currentStreak: 23,
    bestStreak: 45,
  },
  stats: {
    casesRegistered: 127,
    validations: 18,
    consensusAverage: 87,
    deepfakesDetected: 3,
    caseViews: 2847,
  },
  badges: [], // Puedes agregar mock badges si lo deseas
  achievements: [], // Puedes agregar mock achievements si lo deseas
};

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      // Simular error: setError('No se pudo cargar el perfil.');
      setProfile(mockProfile);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Skeleton minimal */}
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Error al cargar el perfil</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">Por favor, intenta recargar la página o contacta soporte si el problema persiste.</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Banner: BotilitoValidationBanner (placeholder) */}
      {/* TODO: Aquí se agregará BotilitoValidationBanner en la siguiente fase */}
      <div className="mb-6">
        {/* Placeholder banner */}
        {/* <BotilitoValidationBanner /> */}
        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-center text-sm">
          <span>Espacio reservado para el banner de validación de Botilito</span>
        </div>
      </div>

      {/* Composición principal */}
      <div className="rounded-lg p-6 border-primary border-2">
        <ProfileHeader {...profile.user} {...profile.gamification} />
        <Separator />
        <div className="mt-8">
          <BadgesAndKPI badges={profile.badges} stats={{
            casesRegistered: profile.stats.casesRegistered,
            validations: profile.stats.validations,
            currentStreak: profile.gamification.currentStreak,
            ranking: profile.gamification.ranking,
          }} />
        </div>
      </div>
      <div className="mt-8">
        <ProfileTabs />
      </div>
    </div>
  );
};

export default ProfilePage;
