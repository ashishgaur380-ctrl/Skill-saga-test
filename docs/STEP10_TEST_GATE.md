# Step 10 — Testing & Stabilization Gate

## Scope

This gate validates the Skill Saga learner UI, Admin Console, Firebase data flow, automation engine, security boundaries, and regression protection before production release.

## Current baseline

Repository: `ashishgaur380-ctrl/Skill-saga-test`
Branch: `main`

The repository currently declares the backend/database as the source of truth and keeps learner UI data-driven. The Firebase configuration points Firestore rules to `security/firestore.rules`.

## Gate A — Authentication

- [ ] Learner signup/login/logout
- [ ] Parent signup/login/logout
- [ ] Teacher signup/login/logout
- [ ] Admin authentication
- [ ] Email verification
- [ ] Disabled-account enforcement
- [ ] Role isolation

## Gate B — Admin → Learner synchronization

- [ ] Admin Home configuration changes appear on learner Home
- [ ] Quiz create/edit/publish/unpublish
- [ ] Scheduled quiz becomes visible at the scheduled time
- [ ] Expired content stops appearing
- [ ] Board/Class/Subject mapping is preserved
- [ ] Competition publishing is reflected in Compete
- [ ] Rewards/badges configuration is reflected in learner UI
- [ ] Notification publishing is reflected in learner UI

## Gate C — Learner navigation regression

Required navigation:

Home → Learn → Play → Compete → Profile

- [ ] Navigation survives refresh
- [ ] Active tab remains correct
- [ ] Daily Quiz from Home opens Play
- [ ] Weekly Quiz from Home opens Play
- [ ] Learn content opens correctly
- [ ] Play search/filter works
- [ ] Compete leaderboard loads
- [ ] Profile loads without reverting to legacy UI
- [ ] Mobile viewport remains usable

## Gate D — Quiz engine

- [ ] Quiz loads only eligible/published questions
- [ ] Question navigation
- [ ] Answer selection
- [ ] Timer
- [ ] Submit
- [ ] Result screen
- [ ] Quiz history
- [ ] XP/coins/badges
- [ ] Duplicate submission protection
- [ ] Refresh/re-entry handling

## Gate E — Competition

- [ ] Competition eligibility
- [ ] Start/end window
- [ ] Board/class/school/district filters
- [ ] Leaderboard
- [ ] Current learner position
- [ ] Competition result recording
- [ ] Reward settlement
- [ ] Duplicate result protection

## Gate F — Automation

The server-side execution model is:

Automation Rule → Scheduler → Idempotency Lock → Action → Automation Run Log

- [ ] Daily Quiz automation
- [ ] Weekly Quiz automation
- [ ] Notification queue creation
- [ ] Asia/Kolkata schedule handling
- [ ] Idempotency lock
- [ ] Manual admin-only execution
- [ ] Automation run audit trail
- [ ] Failure logging
- [ ] Disabled rules do not execute

## Gate G — Security

### Security baseline

The current Firestore rules use a **server-authoritative default-deny model**: direct client writes are denied except where explicitly permitted. Learner quiz results are written through the server-side callable quiz service, which loads the published quiz/questions, validates submitted answers, calculates marks/percentage/XP/coins, and writes the attempt. The client does not supply the final score fields.

The learner quiz service now also supports an idempotent `submissionId`, so a retried submission can return the existing authoritative result instead of creating a second result.

Required production architecture:

Learner submits answers → server validates answers → server calculates score → server writes authoritative result → server awards XP/coins/badges.

The client must never be trusted to decide final score, XP, coins, leaderboard position, or entitlement.

**Remaining security work:** emulator-based abuse tests, competition eligibility/result tamper tests, parent/teacher relationship tests, and a production rules/deployment verification pass.

### Additional security checks

- [ ] Learner cannot write admin configuration
- [ ] Learner cannot publish content
- [ ] Learner cannot modify another learner's profile
- [ ] Parent/teacher relationship permissions verified
- [ ] Competition result tampering prevented
- [ ] Reward tampering prevented
- [ ] Admin-only callable functions verified
- [ ] Firestore rules tested with emulator
- [ ] No secret/API credentials committed

## Gate H — Regression protection

Before every production merge:

1. Build succeeds.
2. Firebase rules compile/deploy.
3. Authentication smoke test passes.
4. Admin publishing smoke test passes.
5. Learner visibility smoke test passes.
6. Daily/weekly automation smoke test passes.
7. Quiz result integrity test passes.
8. Mobile navigation smoke test passes.
9. No legacy UI is reintroduced.
10. No critical browser console errors remain.

## Current status

Step 10 has begun.

The repository already contains the server-side automation model and idempotency design. The next implementation blocker is the authoritative quiz-result pipeline; this must be completed before production/Play Store readiness can be declared.

**Release rule: do not mark Skill Saga production-ready while client-authoritative scoring remains enabled.**
