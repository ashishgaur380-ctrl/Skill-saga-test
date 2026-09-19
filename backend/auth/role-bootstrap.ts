export const BOOTSTRAP_ROLE = 'super_admin' as const;

export interface RoleBootstrapRequest {
  targetUid: string;
  requestedByUid: string;
}

export function validateBootstrapRequest(request: RoleBootstrapRequest): void {
  if (!request.targetUid.trim()) throw new Error('targetUid is required');
  if (!request.requestedByUid.trim()) throw new Error('requestedByUid is required');
}

// The actual Firebase Admin SDK call belongs in a privileged deployment.
// Never expose service-account credentials or this operation to the browser.
