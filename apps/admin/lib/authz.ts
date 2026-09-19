export const ADMIN_ROLES = ['super_admin', 'admin', 'content_manager'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | undefined): role is AdminRole {
  return !!role && ADMIN_ROLES.includes(role as AdminRole);
}
