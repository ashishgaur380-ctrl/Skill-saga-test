# Firebase Functions

Privileged server operations for Skill Saga 2.0 live here.

## Firebase project

The intended Firebase project is:

- Project name: `skill saga 20`
- Project ID: `skill-saga-2`

Do not deploy these functions to the legacy Skill Saga project or the unrelated `skill-saga-2-509112` project.

## Academic service

The Academic Console uses callable functions for server-authoritative mutations:

- `listAcademic`
- `createAcademic`
- `updateAcademic`
- `archiveAcademic`

The functions validate academic payloads, verify the caller's Firebase custom-claim role, write through the Admin SDK, and create audit log entries.

Supported collections:

- `boards`
- `classes`
- `subjects`
- `chapters`
- `topics`
- `skillCategories`
- `skills`

Client applications must not bypass these operations with direct writes. Firestore rules intentionally keep academic writes server-authoritative.

## Deployment safety

Before deploying, verify the selected Firebase project:

```bash
npx firebase use
```

It must report:

```
skill-saga-2
```

Build the Functions first:

```bash
pnpm --filter @skill-saga/functions build
```

Then deploy only Functions:

```bash
npx firebase deploy --only functions
```

Do not deploy Firestore rules or other Firebase resources as part of this step.

## Other planned functions

- `setPlatformRole`
- `bootstrapSuperAdmin`
- quiz/competition automation
- reward and leaderboard operations

Never commit service-account credentials, private keys, passwords, or authentication tokens.
