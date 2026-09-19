# ADR-001: Data-Driven Monorepo Architecture

## Decision
Skill Saga 2.0 will use a single monorepo with separate application packages and shared contracts.

## Principles
1. One source repository.
2. Separate application concerns.
3. Shared types and validation contracts.
4. Backend owns authoritative business logic.
5. Firestore is the primary operational database.
6. Firebase Authentication handles identity.
7. Cloud Functions handle privileged/server-authoritative operations.
8. Development, staging, and production use separate Firebase resources/configuration.

## Rationale
The previous project experienced UI drift, disappearing admin controls, backup/final-version confusion, and configuration inconsistencies. A single source of truth with explicit environment boundaries reduces those failure modes.
