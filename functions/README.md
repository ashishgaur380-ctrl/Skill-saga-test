# Firebase Functions

Privileged server operations live here.

## Academic service

The Academic Console uses callable functions for server-authoritative mutations:

- `listAcademic`
- `createAcademic`
- `updateAcademic`
- `archiveAcademic`

The functions validate the academic payload, verify the caller's Firebase custom-claim role, write through the Admin SDK, and create an audit log entry.

Supported collections:

- boards
- classes
- subjects
- chapters
- topics
- skillCategories
- skills

Client applications must not bypass these operations with direct writes. Firestore rules intentionally keep academic writes server-authoritative.

## Other planned functions

- setPlatformRole
- bootstrapSuperAdmin
- audit logging extensions
- quiz/competition automation
- reward and leaderboard operations

Never commit service-account credentials or private keys.
