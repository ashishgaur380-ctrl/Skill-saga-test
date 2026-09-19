export const PLATFORM_ROLES = [
  "super_admin",
  "admin",
  "content_manager",
  "moderator",
  "support",
  "finance",
  "school_admin",
  "teacher",
  "parent",
  "learner"
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  role: PlatformRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
