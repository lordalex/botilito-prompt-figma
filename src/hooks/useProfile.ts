// useProfile.ts
// Fase 10: Integración API
// Archivo generado según el plan de desarrollo


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { ProfileData } from '../components/profile/types';
import { api } from '../services/api';

interface UseProfileResult {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
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
      // Llamada a la API (ajustar según implementación real)
      const response = await api.profile.get(session);
      setData(response.data as ProfileData);
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
