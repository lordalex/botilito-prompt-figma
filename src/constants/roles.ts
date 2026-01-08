/**
 * @file src/constants/roles.ts
 * @description Role-based access control constants and utilities
 */

// User roles in the system
export enum UserRole {
  CIBERNAUTA = 'cibernauta',
  EPIDEMIOLOGO = 'epidemiologo',
  DIRECTOR = 'director',
}

// Navigation items that require specific roles
export enum RestrictedFeature {
  HUMAN_VERIFICATION = 'verification',
  ADMIN_DASHBOARD = 'admin',
}

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CIBERNAUTA]: 1,
  [UserRole.EPIDEMIOLOGO]: 2,
  [UserRole.DIRECTOR]: 3,
};

// Feature access control map
export const FEATURE_ACCESS: Record<RestrictedFeature, UserRole[]> = {
  [RestrictedFeature.HUMAN_VERIFICATION]: [UserRole.EPIDEMIOLOGO, UserRole.DIRECTOR],
  [RestrictedFeature.ADMIN_DASHBOARD]: [UserRole.DIRECTOR],
};

/**
 * Check if a user role has access to a specific feature
 */
export function hasFeatureAccess(userRole: string | undefined | null, feature: RestrictedFeature): boolean {
  if (!userRole) return false;

  const normalizedRole = userRole.toLowerCase();
  const allowedRoles = FEATURE_ACCESS[feature];

  return allowedRoles.some((role) => role === normalizedRole);
}

/**
 * Check if a user role has a minimum required role level
 */
export function hasMinimumRole(userRole: string | undefined | null, minimumRole: UserRole): boolean {
  if (!userRole) return false;

  const normalizedRole = userRole.toLowerCase() as UserRole;
  const userLevel = ROLE_HIERARCHY[normalizedRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: string | undefined | null): string {
  if (!role) return 'Usuario';

  const roleMap: Record<string, string> = {
    [UserRole.CIBERNAUTA]: 'Cibernauta',
    [UserRole.EPIDEMIOLOGO]: 'Epidemiólogo',
    [UserRole.DIRECTOR]: 'Director',
  };

  return roleMap[role.toLowerCase()] || role;
}
