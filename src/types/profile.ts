// src/types/profile.ts

export interface Profile {
  id: string;
  email: string;
  nombre_completo: string | null;
  photo: string | null;
  avatar: string | null;
  numero_telefono: string | null;
  departamento: string | null;
  ciudad: string | null;
  fecha_nacimiento: string | null;
  reputation: number;
  xp: number;
  badges: string[];
  role: string | null;
}

export interface ChallengeProgress {
  id: string;
  title: string;
  badge_name: string;
  completed: boolean;
  requirements: {
    xp?: number;
    reputation?: number;
  };
  current: {
    xp?: number;
    reputation?: number;
  };
}

export interface ProfileResponse {
  data: Profile;
  challenges_progress: ChallengeProgress[];
}

export interface ProfileUpdateInput {
  nombre_completo?: string;
  photo?: string;
  avatar?: string;
  numero_telefono?: string;
  departamento?: string;
  ciudad?: string;
  fecha_nacimiento?: string;
}

export interface ConversionRequest {
  amount: number;
  from: 'xp' | 'reputation';
}

export interface ConversionResponse {
  input: {
    amount: number;
    unit: 'xp' | 'reputation';
  };
  conversion: {
    amount: number;
    unit: 'xp' | 'reputation';
  };
}
