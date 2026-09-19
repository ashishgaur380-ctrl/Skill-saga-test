# Firestore Index Plan

Indexes will be added only when required by real queries.

Initial query patterns to plan for:
- content by board + class + subject + status
- lessons by course + order
- questions by board + class + subject + chapter + difficulty + status
- quizzes by audience + status + publishAt
- quiz attempts by learner + createdAt
- competitions by status + startAt
- participants by competition + learner
- leaderboard by scope + score
- posts by group + createdAt
- notifications by user + createdAt
- automation runs by automation + startedAt
- audit logs by actor + createdAt

Do not create broad composite indexes blindly. Validate indexes against actual Firestore query requirements.
