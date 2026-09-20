# Skill Saga 2.0 Extension Guide

This is the working rule for future development.

## Adding a new segment
1. Define the segment boundary and user roles.
2. Identify existing core services that can be reused.
3. Define only the new entities/data required by the segment.
4. Add backend functions/service methods for the new domain.
5. Add an API/proxy boundary if the client needs it.
6. Add the UI as an independent route/module.
7. Add feature/configuration flags when rollout should be controlled.
8. Add audit logging and permission checks.
9. Add tests without changing unrelated modules.
10. Enable the feature only after its module is verified.

## Coaching
Reuse users, roles, academic/content hierarchy, question bank, assessment engine, attempts, progress, notifications, payments and analytics.

Add institutes, batches, courses, teacher assignments, class schedules, attendance and coaching-specific dashboards.

## School
Reuse users, guardian links, academic structure, assessments, progress, notifications and analytics.

Add school organization, sections, teacher assignments, attendance and school reports.

## Live classes
Reuse users, courses, notifications, progress and payments.

Add class sessions, meeting-provider adapter, attendance events and recordings.

## Anti-patterns
Do not copy the quiz engine for a new segment.
Do not put business rules in React components.
Do not hard-code one board, class or segment into shared services.
Do not make one module depend on another module's UI state.
Do not store authoritative XP, coins or scores only in the browser.
Do not remove or rename existing fields without a migration/version strategy.
Do not couple payment providers directly to learner UI.

## Preferred flow
UI -> API boundary -> domain service -> core service -> Firestore

External systems use adapters:
Domain service -> provider adapter -> external provider

This keeps future integrations replaceable.
