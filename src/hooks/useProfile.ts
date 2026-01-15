// useProfile.ts
// Fase 10: Integración API
// Archivo generado según el plan de desarrollo




import { useState, useEffect, useCallback } from 'react';
import { ProfileData, ProfileAPIResponse } from '../components/profile/types';
import { transformAPIToProfileData } from '../components/profile/api-mapper';
import { mockProfileDataNormalized } from '../components/profile/mockProfileData.normalized';
import { useAuth } from '../providers/AuthProvider';
import { api } from '../services/api';


interface UseProfileResult {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toProfileAPIResponse(input: unknown): ProfileAPIResponse {
  if (!isRecord(input)) {
    throw new Error('Respuesta inválida del perfil');
  }

  const dataRaw = input['data'];
  const challengesRaw = input['challenges_progress'];

  if (!isRecord(dataRaw) || !Array.isArray(challengesRaw)) {
    throw new Error('Respuesta inválida del perfil');
  }

  const statsRaw = isRecord(dataRaw['stats']) ? dataRaw['stats'] : {};
  const nextRankRaw = isRecord(statsRaw['next_rank_progress']) ? statsRaw['next_rank_progress'] : {};

  return {
    data: {
      id: toString(dataRaw['id'], ''),
      email: toString(dataRaw['email'], ''),
      nombre_completo: toString(dataRaw['nombre_completo'], ''),
      ciudad: toString(dataRaw['ciudad'], ''),
      // backend puede enviar `photo`, `avatar` o `avatar_url`
      photo:
        typeof dataRaw['photo'] === 'string'
          ? dataRaw['photo']
          : typeof dataRaw['avatar'] === 'string'
            ? dataRaw['avatar']
            : typeof dataRaw['avatar_url'] === 'string'
              ? dataRaw['avatar_url']
              : undefined,
      xp: toNumber(dataRaw['xp'], Number.NaN),
      current_streak: toNumber(dataRaw['current_streak'], Number.NaN),
      best_streak: toNumber(dataRaw['best_streak'], Number.NaN),
      badges: Array.isArray(dataRaw['badges']) ? dataRaw['badges'].filter((b) => typeof b === 'string') : [],
      stats: {
        cases_registered: toNumber(statsRaw['cases_registered'], Number.NaN),
        validations_performed: toNumber(statsRaw['validations_performed'], Number.NaN),
        global_ranking: toNumber(statsRaw['global_ranking'], Number.NaN),
        total_users: toNumber(statsRaw['total_users'], Number.NaN),
        next_rank_progress: {
          current: toNumber(nextRankRaw['current'], Number.NaN),
          target: toNumber(nextRankRaw['target'], Number.NaN),
          label: toString(nextRankRaw['label'], ''),
        },
      },
    },
    challenges_progress: challengesRaw
      .filter(isRecord)
      .map((ch) => ({
        id: toString(ch['id'], ''),
        title: toString(ch['title'], ''),
        description: toString(ch['description'], ''),
        badge_name: toString(ch['badge_name'], toString(ch['id'], toString(ch['title'], ''))),
        completed: typeof ch['completed'] === 'boolean' ? ch['completed'] : false,
        percent: toNumber(ch['percent'], 0),
        reward_display: toString(ch['reward_display'], '+0 PI'),
      })),
  };
}


export function useProfile(): UseProfileResult {
  const { session, user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Llamada a la API usando el cliente anterior
      const response = await api.profile.get(session);
      const apiResponse = toProfileAPIResponse(response);
      setData(transformAPIToProfileData(apiResponse, mockProfileDataNormalized));
    } catch (err: any) {
      setError('Error al cargar el perfil');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [session, user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error, refresh };
}
