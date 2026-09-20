import { initializeApp } from "firebase-admin/app";
initializeApp();
export { listAcademic, createAcademic, updateAcademic, archiveAcademic, bulkImportAcademic } from "./academic";
export { listQuestions, createQuestion, updateQuestion, archiveQuestion, bulkImportQuestions } from "./question";
export { listQuizzes, createQuiz, updateQuiz, archiveQuiz } from "./quiz";
export { listCompetitions, createCompetition, updateCompetition, archiveCompetition } from "./competition";
export { listAutomationRules, createAutomationRule, updateAutomationRule, setAutomationEnabled, runAutomationEngine, runAutomationEngineNow } from "./automation";
export { listCommunityPosts, createCommunityPost, moderateCommunityPost, archiveCommunityPost } from "./community";
export { listLearnerCommunity, createLearnerCommunityPost, addCommunityComment, listCommunityComments, reportCommunityPost } from "./community-public";
export { listRewards, createReward, updateReward, archiveReward, listRewardRedemptions, updateRewardRedemptionStatus } from "./rewards";
export { listNotificationTemplates, createNotificationTemplate, updateNotificationTemplate, archiveNotificationTemplate } from "./notifications";
export { getAnalyticsSummary } from "./analytics";
export { getSystemSettings, updateSystemSettings } from "./system";
export { listUsers, updateUser } from "./users";
export { listPublishedQuizzes, getQuizForAttempt, submitQuizAttempt, getLearnerStats, listLearnerAttempts, getLearnerHome, listLearnerNotifications, markNotificationRead, getLearnerAcademic, listPublishedLearningMaterials, getTopicPractice, submitTopicPractice, getLearnerProgress, listLearnerAssignments, listPublishedCompetitions, joinCompetition, getCompetitionQuiz, submitCompetitionAttempt, getCompetitionLeaderboard, getLearnerRewards, redeemReward } from "./learner";
export { createLearnerLinkCode, linkLearner, listLinkedLearners, getLinkedLearnerProgress } from "./guardian";
export { listLearningMaterials, createLearningMaterial, updateLearningMaterial, archiveLearningMaterial, bulkCreateLearningMaterials } from "./content";
export { createAssignment, listAssignments, updateAssignment, archiveAssignment } from "./assignment";
export { getTeacherDashboard, listTeacherAssignments, listTeacherResults, listTeacherMaterials, createTeacherMaterial, updateTeacherMaterial } from "./teacher";
export { getSchoolDashboard, listSchoolMembers, updateSchoolMember, listSchoolAssignments } from "./school";
export { sendNotification, listRecipientNotifications, markRecipientNotificationRead } from "./notification-delivery";

export { requestAccountDeletion } from "./account";

export {runCompetitionLifecycle} from "./competition-lifecycle";
