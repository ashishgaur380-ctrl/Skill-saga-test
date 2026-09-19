# Skill Saga — Final Integration Checklist

## Rule
Keep the tested/finalized learner UI stable. Do not replace `app/src/main/assets/index.html` wholesale. Apply targeted patches only after a backup and test build.

## P0 — Known functional fixes
- [ ] Quiz History → Attempt Details: retain and render question-by-question responses for newly completed attempts.
- [ ] Skill Mastery: remove duplicate skill records and make skill rows open their detail view.
- [ ] Teacher Dashboard: sync learner XP, accuracy, streak, quiz count and mastery from canonical learner data.
- [ ] Notifications: surface pending teacher/admin assignments with an actionable `Start Quiz` action.
- [ ] Change/Reset Password: implement and test the intended account flow.
- [ ] Mobile OTP Login: implement and test India +91 OTP flow.

## P1 — Admin/Teacher expansion
- [ ] Expand Create/Edit Quiz to Academic / Skills / Other.
- [ ] Academic: Class 1–12 → Subject → Chapter → Topic.
- [ ] Skills and Other remain cross-grade.
- [ ] Add Free / XP Unlock / Coin Unlock / Premium / Assigned Only access controls.
- [ ] Add configurable XP/coin requirements.
- [ ] Preserve Draft / Published / Scheduled lifecycle.

## P1 — Learn
- [ ] Academic content: Class → Subject → Chapter → Topic → Lesson.
- [ ] Lesson content types and ordering.
- [ ] `Practice this topic` launches existing quiz engine.
- [ ] Add Skills and Other learning paths without replacing Academic.

## P1 — Play
- [ ] Academic class progression and unlock rules.
- [ ] Skills → Skill → Topic/Level → Quiz.
- [ ] Other → Topic → Quiz.
- [ ] Daily Quiz, Quick Practice, Topic Practice, Mixed Quiz, Assigned Quizzes and Puzzles.
- [ ] Keep competitions inside Compete, not Play.

## P1 — Compete
- [ ] Preserve tested competition screens.
- [ ] Add Discussion Forum inside Compete.
- [ ] Competition scopes: Individual, Class, School, District, State, National.
- [ ] Moderation: report/block/mute, admin remove/lock, teacher pin.

## P2 — Premium
- [ ] Keep `PREMIUM_PAYMENT_ENABLED = false` during development.
- [ ] Implement entitlement model separately from XP/coins.
- [ ] Add premium content/features only after access control is tested.
- [ ] Add payment only at launch-ready stage.

## P2 — Advertisement
- [ ] Keep `ADS_ENABLED = false` during development.
- [ ] Build Admin Advertisement Manager.
- [ ] Add scheduling, placements, targeting, moderation and analytics.
- [ ] Clearly label sponsored/advertisement content.

## Security / data checks
- [ ] Review Firestore rules after all new collections/fields are finalized.
- [ ] Verify Admin UID protection remains intact.
- [ ] Verify teacher/learner authorization boundaries.
- [ ] Avoid exposing phone/email/address in forum content.
- [ ] Verify assigned-quiz access cannot be bypassed.

## Final regression test
- [ ] Login/signup/logout
- [ ] Home
- [ ] Learn
- [ ] Play
- [ ] Quiz timer and completion
- [ ] XP / coins / streak
- [ ] Quiz History
- [ ] Attempt Details
- [ ] Skills / Skill DNA
- [ ] Rewards / Badges
- [ ] Profile / Edit Profile
- [ ] Settings / Password / OTP
- [ ] Notifications
- [ ] Teacher linking
- [ ] Teacher Dashboard
- [ ] Assign Quiz
- [ ] Learner assignment completion
- [ ] Admin Quiz Manager
- [ ] Bulk Import
- [ ] Compete / Leaderboards
- [ ] Discussion Forum
- [ ] Android build
- [ ] Firebase Hosting

## Release gate

Do not call the release final until the P0 items are fixed/tested and the P1 flows are verified end-to-end. Premium payments and advertising remain disabled until separately approved for launch.
