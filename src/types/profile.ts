// src/types/profile.ts

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  photo: string | null;
  avatar: string | null;
  phone_number: string | null;
  state_province: string | null;
  city: string | null;
  birth_date: string | null;
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
  full_name?: string;
  photo?: string;
  avatar?: string;
  phone_number?: string;
  state_province?: string;
  city?: string;
  birth_date?: string;
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
