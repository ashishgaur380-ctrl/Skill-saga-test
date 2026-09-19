export const authConfig = {
  loginPath: '/login',
  defaultAuthenticatedPath: '/academic',
  requiredRoles: ['super_admin', 'admin', 'content_manager'] as const,
};
