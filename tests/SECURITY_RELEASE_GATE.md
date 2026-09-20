# Skill Saga 2.0 security gate

## Server-authoritative invariants
- Learner quiz scores, XP and coins are calculated in Cloud Functions.
- Learners cannot write Firestore documents directly under the global fallback rule.
- Competition attempts/results must be produced by callable backend functions.
- Parent progress is resolved only through an active learner link.
- Teacher material/assignment mutations validate the authenticated teacher.
- School member mutations validate same-school access.
- Notification delivery validates recipient roles server-side.
- Community learner posts are created as pending and require moderation before appearing in the approved feed.
- Community comments require an approved, active post.
- Community reports are stored separately for moderation.

## Release checks
1. Run pnpm install --frozen-lockfile.
2. Run pnpm test.
3. Run pnpm build:functions.
4. Run pnpm build:learner.
5. Run pnpm build:admin.
6. Deploy Firebase rules/functions only through the protected production workflow.
7. Verify the learner web root is generated from apps/learner, not the legacy root HTML.
8. Verify APK/Web use the same Skill Saga 2.0 learner source.

## Manual role-isolation matrix
| Area | Learner | Parent | Teacher | School | Admin |
|---|---|---|---|---|---|
| Own learner data | Yes | linked child only | — | — | support/admin |
| Quiz submission | Yes | — | — | — | — |
| Create assignment | — | — | Yes | Yes | Yes |
| Manage school members | — | — | — | same school | Yes |
| Publish/moderate community | — | — | — | — | Yes |
| Send notifications | — | — | teacher role | school role | Yes |
| Manage rewards | — | — | — | — | Yes |

## Release prerequisite
A successful CI/build run should be confirmed before Play Store release.
