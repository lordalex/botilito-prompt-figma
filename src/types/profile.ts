// src/types/profile.ts
// EXACTLY matches Profile API v1.2.0 spec (profileCRUD)

export type UserRole = 'cibernauta' | 'epidemiologo' | 'director';

/**
 * UserProfile - From profileCRUD v1.2.0 OpenAPI spec
 */
export interface Profile {
  id: string;
  email: string;
  nombre_completo: string | null;
  departamento: string | null;
  ciudad: string | null;
  role: UserRole;
  xp: number;
  reputation: number;
  current_streak: number;
  profile_rewarded: boolean;
  avatar_url: string | null;
}

/**
 * UpdateProfileRequest - From spec
 */
export interface UpdateProfileRequest {
  nombre_completo?: string;
  departamento?: string;
  ciudad?: string;
  avatar_url?: string;
}

/**
 * UpdateResponse - From spec
 */
export interface UpdateProfileResponse {
  success: boolean;
  data: Profile;
  reward_awarded: boolean;
  message: string;
}

/**
 * GET /profile response
 */
export interface ProfileResponse {
  data: Profile;
}
