import { initializeApp } from "firebase-admin/app";

initializeApp();

export {
  listAcademic,
  createAcademic,
  updateAcademic,
  archiveAcademic,
  bulkImportAcademic,
} from "./academic";

export {
  listQuestions,
  createQuestion,
  updateQuestion,
  archiveQuestion,
  bulkImportQuestions,
} from "./question";

export {
  listQuizzes,
  createQuiz,
  updateQuiz,
  archiveQuiz,
} from "./quiz";

export {
  listCompetitions,
  createCompetition,
  updateCompetition,
  archiveCompetition,
} from "./competition";

export {
  listAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  setAutomationEnabled,
  runAutomationEngine,
  runAutomationEngineNow,
} from "./automation";

export {
  listCommunityPosts,
  createCommunityPost,
  moderateCommunityPost,
  archiveCommunityPost,
} from "./community";

export {
  listRewards,
  createReward,
  updateReward,
  archiveReward,
  listRewardRedemptions,
  updateRewardRedemptionStatus,
} from "./rewards";

export {
  listNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  archiveNotificationTemplate,
} from "./notifications";

export { getAnalyticsSummary } from "./analytics";

export { getSystemSettings, updateSystemSettings } from "./system";

export { listUsers, updateUser } from "./users";

export {
  listPublishedQuizzes,
  getQuizForAttempt,
  submitQuizAttempt,
  getLearnerStats,
  listLearnerAttempts,
  getLearnerHome,
  listLearnerNotifications,
  markNotificationRead,
  getLearnerAcademic,
  getTopicPractice,
  submitTopicPractice,
  getLearnerProgress,
  listPublishedCompetitions,
  joinCompetition,
  getCompetitionQuiz,
  submitCompetitionAttempt,
  getCompetitionLeaderboard,
} from "./learner";
export { getLearnerRewards, redeemReward } from "./learner";

export { createLearnerLinkCode, linkLearner, listLinkedLearners, getLinkedLearnerProgress } from "./guardian";

export {
  listLearningMaterials,
  createLearningMaterial,
  updateLearningMaterial,
  archiveLearningMaterial,
  bulkCreateLearningMaterials,
} from "./content";
