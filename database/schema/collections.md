# Firestore Collection Design

## Identity
users/{userId}
learnerProfiles/{userId}
parentProfiles/{userId}
teacherProfiles/{userId}
schools/{schoolId}
schoolMembers/{memberId}

## Academic
boards/{boardId}
classes/{classId}
subjects/{subjectId}
chapters/{chapterId}
topics/{topicId}
skillCategories/{categoryId}
skills/{skillId}

## Content
courses/{courseId}
lessons/{lessonId}
content/{contentId}
media/{mediaId}
resources/{resourceId}

## Assessment
questionBanks/{bankId}
questions/{questionId}
quizzes/{quizId}
quizAttempts/{attemptId}
assignments/{assignmentId}
assignmentAttempts/{attemptId}

## Competition
competitions/{competitionId}
competitionParticipants/{participantId}
competitionResults/{resultId}
leaderboards/{leaderboardId}

## Community
groups/{groupId}
posts/{postId}
comments/{commentId}
reports/{reportId}
moderationActions/{actionId}

## Rewards
levels/{levelId}
xpTransactions/{transactionId}
coinTransactions/{transactionId}
badges/{badgeId}
achievements/{achievementId}
learnerAchievements/{achievementId}
rewards/{rewardId}
rewardRedemptions/{redemptionId}

## Business
subscriptions/{subscriptionId}
entitlements/{entitlementId}
orders/{orderId}
payments/{paymentId}
teacherContent/{contentId}
teacherSales/{saleId}
payouts/{payoutId}

## Automation
automations/{automationId}
schedules/{scheduleId}
automationRuns/{runId}
automationFailures/{failureId}

## Notifications
notifications/{notificationId}
notificationTemplates/{templateId}
notificationCampaigns/{campaignId}

## System
appSettings/{settingId}
roles/{roleId}
permissions/{permissionId}
auditLogs/{logId}
