# Skill Saga 2.0 Architecture

## Principle
Skill Saga is a modular education platform. Existing capabilities must remain stable while new segments are added as extensions.

## Layers
1. Core platform — authentication, roles, permissions, organizations, content, assessments, attempts, progress, rewards, notifications, analytics, automation, payments and audit logs.
2. Domain modules — learner, guardian, admin, coaching, school, publisher, live classes, marketplace, career and other future segments.
3. Presentation — learner, guardian and admin interfaces. UI never becomes the source of truth for business rules.
4. Integrations — Firebase, payment providers, messaging, video/live-class providers and other external services.

## Extension rule
A new segment should reuse core services and introduce only its domain-specific entities, screens and workflows. Do not fork an existing engine when the business behavior is shared.

Regular quiz, daily quiz, weekly quiz, topic practice, competition tests and coaching tests should use shared assessment, question, attempt and scoring contracts.

## Stable contracts
Core data and services should be consumed through stable contracts rather than direct UI assumptions. Prefer backward-compatible optional fields and migrations over breaking existing callers.

## Configuration over code
Boards, classes, subjects, content types, feature availability, navigation modules, reward types, notification types and similar variable behavior should be represented by data/configuration wherever practical.

## Future segment example: Coaching
Coaching should plug into existing users, roles, content, assessment, progress, notification and payment services.

Coaching -> Organization -> Courses/Batches -> Content/Classes -> Assessments -> Attempts -> Progress

The existing learner quiz engine should not be duplicated for coaching tests.

## Security boundary
Authoritative operations remain server-side: permissions, XP, coins, scores, competition results, rewards, payment state and sensitive learner/guardian access.

## Compatibility rule
Before changing an existing module, check whether the requirement can be implemented as a new module, configuration entry, optional field, adapter/integration, or reusable core service. Only change a core contract when none of these approaches is appropriate.
