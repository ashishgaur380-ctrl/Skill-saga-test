export const PLATFORM_ROLES = ['super_admin','admin','content_manager','moderator','support','finance','school_admin','teacher','parent','learner'] as const;
export type PlatformRole = typeof PLATFORM_ROLES[number];

export function isPlatformRole(value: string): value is PlatformRole {
  return PLATFORM_ROLES.includes(value as PlatformRole);
}

export function buildRoleClaims(role: PlatformRole) {
  return { role };
}
