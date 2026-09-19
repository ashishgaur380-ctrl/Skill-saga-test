# Skill Saga 2.0

**A smarter way to learn.**

Skill Saga 2.0 is a centralized, backend-driven learning ecosystem for learners, parents, teachers, schools, and administrators.

## Architecture principles

- Backend and database are the source of truth.
- UI is data-driven; content is not hardcoded.
- Admin Console controls platform configuration and operational content.
- XP, coins, scores, rankings, rewards, and entitlements are server-authoritative.
- Development, staging, and production are separated.
- One repository is the authoritative source of code.
- New content and configuration should not require an application release.

## Planned repository

```
apps/
  learner/
  admin/
  teacher/
  parent/
backend/
functions/
shared/
database/
security/
tests/
documentation/
scripts/
```

## Current status

Phase 1 — repository foundation.

The repository is intentionally starting clean. No legacy application code is being copied into this foundation.
