# Skill Saga 2.0 — Learner End-to-End Flow

## Flow under test

`Login → Home → Learn → Topic Practice → Quiz → Result → XP/Coins → Progress → Rewards → Competition → Profile → Guardian Link`

## Contract checks completed

| Flow | Frontend | Backend action | Server authorization |
|---|---|---|---|
| Login | `/login` | Firebase Auth | Firebase account + learner role required by callable services |
| Home | `/` | `getLearnerHome` | learner |
| Learn | `/learn` | `getLearnerAcademic` | learner |
| Topic practice | `/play?topicId=` | `getTopicPractice`, `submitTopicPractice` | learner |
| Published quiz | `/play?quizId=` | `getQuizForAttempt`, `submitQuizAttempt` | learner |
| Result | `/play` | server response | scoring remains server-side |
| Progress | `/progress` | `getLearnerProgress` | learner |
| Rewards | `/rewards` | `getLearnerRewards`, `redeemReward` | learner |
| Competition | `/compete` | list/join/get quiz/submit/leaderboard | learner |
| Profile | `/profile` | stats/history/link-code | learner |
| Guardian link | Profile → Guardian | `createLearnerLinkCode`, `linkLearner` | learner → parent/teacher |

## Hardening completed during Step 6

### Play mode isolation

The Play page now explicitly tracks one of:

- `quiz`
- `topic`
- `competition`

This prevents a previous topic/competition URL from causing a newly selected normal quiz to be submitted through the wrong backend action.

### Competition result handling

Competition submissions do not currently return XP/coin rewards. The result screen now handles that correctly instead of displaying undefined XP/coin values.

### Server-side scoring

Correct answers are not sent to the browser. Quiz/topic scoring is calculated inside Firebase Functions from the stored question answer key.

## Live test sequence

With a real learner account and published test data:

1. Sign in.
2. Confirm Home loads live XP, streak, coins and level.
3. Open Daily Quiz from Home.
4. Answer every question.
5. Submit.
6. Confirm result percentage/marks and XP/coins.
7. Return to Home/Profile and confirm stats changed.
8. Open Learn.
9. Select Board → Class → Subject → Chapter → Topic.
10. Start Topic Practice.
11. Complete and submit practice.
12. Open Progress and confirm subject/topic aggregates.
13. Open Rewards and confirm balance.
14. Redeem a reward with sufficient coins.
15. Confirm redemption appears in history.
16. Open Compete.
17. Join a free competition.
18. Start the competition.
19. Submit once.
20. Confirm duplicate submission is rejected.
21. Open leaderboard.
22. Open Profile.
23. Generate a learner link code.
24. Use the code from a parent/teacher account.
25. Confirm linked progress is visible.

## Current environment limitation

The current Codespace has browser authentication using the production Firebase Auth session while Firestore/Functions are configured for local emulators. Therefore a live browser-authenticated end-to-end run cannot honestly be marked as executed from the repository tools alone.

The repository-side contracts and authorization boundaries have been reviewed and the Play-mode bugs found during this review were fixed. The numbered live sequence above is the remaining execution test once a controlled learner Auth account/session is available.
