export type FeatureFlags = {
  academicEnabled: boolean; contentEnabled: boolean; assessmentEnabled: boolean;
  progressEnabled: boolean; rewardsEnabled: boolean; notificationsEnabled: boolean;
  analyticsEnabled: boolean; automationEnabled: boolean; learnerEnabled: boolean;
  guardianEnabled: boolean; coachingEnabled: boolean; schoolEnabled: boolean;
  liveClassesEnabled: boolean; marketplaceEnabled: boolean; careerEnabled: boolean;
};

export type ModuleContext = {
  userId: string;
  role: string;
  features: FeatureFlags;
};

export type AssessmentAttempt = {
  assessmentId: string;
  learnerId: string;
  answers: Array<{ questionId: string; selectedOption: number }>;
};

export type ProgressSummary = {
  attempts: number;
  questions: number;
  correct: number;
  accuracy: number;
  marks: number;
  totalMarks: number;
  marksPercentage: number;
};
