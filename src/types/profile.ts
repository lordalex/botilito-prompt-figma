// src/types/profile.ts
// EXACTLY matches Profile API v3.0.0 spec

export type UserRole = 'cibernauta' | 'epidemiologo' | 'director';

export interface NextRankProgress {
  current: number;
  target: number;
  label: string;
}

export interface UserStats {
  cases_registered: number;
  validations_performed: number;
  global_ranking: number;
  total_users: number;
  next_rank_progress: NextRankProgress;
}

export interface ChallengeProgress {
  id: string;
  title: string; // e.g. "Maestro Multimedia"
  description: string;
  completed: boolean;
  percent: number; // 0-100
  reward_display: string; // e.g. "150 PI"
}

/**
 * UserProfile - From Profile API v3.0.0
 */
export interface Profile {
  id: string;
  email: string;
  nombre_completo: string | null;
  // Deprecated/Compatibility fields if needed, but spec only lists minimal
  // Keeping optional for safety if old data persists
  departamento?: string | null;
  ciudad?: string | null;

  role: UserRole;
  reputation: number;
  xp: number;
  current_streak: number;
  best_streak: number;
  badges: string[]; // List of Badge IDs
  stats: UserStats;

  avatar_url: string | null;
  // Internal/Legacy flags
  profile_rewarded?: boolean;
  // Created At is not in v3 schema explicitly but likely returned by Supabase
  created_at?: string;
}

export interface UpdateProfileRequest {
  nombre_completo?: string;
  ciudad?: string;
  avatar?: string; // Base64
}

export interface UpdateProfileResponse {
  success?: boolean; // API v3 just says "200 OK", usually implies success
  data?: Profile;
}

/**
 * GET /profile response (v3.0.0)
 */
export interface ProfileResponse {
  data: Profile;
  challenges_progress: ChallengeProgress[];
}
