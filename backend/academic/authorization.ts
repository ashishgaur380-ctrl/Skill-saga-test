const WRITE_ROLES = new Set(['super_admin', 'admin', 'content_manager']);

export function canManageAcademic(role: string): boolean {
  return WRITE_ROLES.has(role);
}

export function assertCanManageAcademic(role: string): void {
  if (!canManageAcademic(role)) throw new Error('Insufficient permission to manage academic structure.');
}
