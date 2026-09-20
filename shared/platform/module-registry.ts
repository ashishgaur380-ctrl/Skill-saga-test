import type { FeatureFlags } from "./contracts";

/**
 * Stable registry of Skill Saga platform modules.
 *
 * This file is data-only. Future modules can be enabled, disabled or
 * introduced without changing existing learner/admin flows.
 */
export type PlatformModule = {
  id: string;
  label: string;
  area: "core" | "learner" | "guardian" | "admin" | "extension" | "integration";
  featureKey: keyof FeatureFlags;
};

export const PLATFORM_MODULES: PlatformModule[] = [
  { id: "academic", label: "Academic Structure", area: "core", featureKey: "academicEnabled" },
  { id: "content", label: "Content", area: "core", featureKey: "contentEnabled" },
  { id: "assessment", label: "Assessment", area: "core", featureKey: "assessmentEnabled" },
  { id: "progress", label: "Progress", area: "core", featureKey: "progressEnabled" },
  { id: "rewards", label: "Rewards", area: "core", featureKey: "rewardsEnabled" },
  { id: "notifications", label: "Notifications", area: "core", featureKey: "notificationsEnabled" },
  { id: "analytics", label: "Analytics", area: "core", featureKey: "analyticsEnabled" },
  { id: "automation", label: "Automation", area: "core", featureKey: "automationEnabled" },
  { id: "learner", label: "Learner", area: "learner", featureKey: "learnerEnabled" },
  { id: "guardian", label: "Parent & Teacher", area: "guardian", featureKey: "guardianEnabled" },
  { id: "coaching", label: "Coaching", area: "extension", featureKey: "coachingEnabled" },
  { id: "school", label: "Schools", area: "extension", featureKey: "schoolEnabled" },
  { id: "live-classes", label: "Live Classes", area: "extension", featureKey: "liveClassesEnabled" },
  { id: "marketplace", label: "Marketplace", area: "extension", featureKey: "marketplaceEnabled" },
  { id: "career", label: "Career", area: "extension", featureKey: "careerEnabled" },
];

export const CORE_MODULE_IDS = PLATFORM_MODULES.filter((m) => m.area === "core").map((m) => m.id);

export function getModule(moduleId: string): PlatformModule | undefined {
  return PLATFORM_MODULES.find((module) => module.id === moduleId);
}

export function isModuleEnabled(moduleId: string, features: FeatureFlags): boolean {
  const module = getModule(moduleId);
  return module ? features[module.featureKey] : false;
}

export function getEnabledModules(features: FeatureFlags): PlatformModule[] {
  return PLATFORM_MODULES.filter((module) => features[module.featureKey]);
}
