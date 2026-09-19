# Skill Saga — Product Architecture

## Core loop
Learn → Play → Earn XP + Coins → Improve → Compete → Rewards → Return to Learn

## Main navigation
- Home
- Learn
- Play
- Compete
- Profile

## Content categories
- Academic — class-aware, Class 1–12
- Skills — cross-grade skill learning
- Other — cross-grade/general learning

## Academic hierarchy
Student → Class → Subject → Chapter → Topic → Learning Material

## Play hierarchy
Academic → Class → Subject/Chapter/Topic → Difficulty → Quiz
Skills → Skill → Topic/Level → Quiz
Other → Topic → Activity/Quiz

## Difficulty
- Foundation
- Basic
- Intermediate
- Advanced

## Competition scopes
- Individual
- Class
- School
- District
- State
- National

## Quiz access modes
- Free
- XP Unlock — XP is a threshold and is not spent
- Coin Unlock — coins are spendable
- Premium
- Assigned Only — Admin/Teacher assignment

## Progression principles
- XP represents learning/progression and should not be purchasable.
- Coins are an in-app currency that may be spent for eligible unlocks.
- Level reflects learning/activity progression.

## Premium
Payment remains disabled until launch readiness. Configuration is centralized in `app/src/main/assets/quiz-access-config.js`.

## Moderated discussion forum
The forum lives inside Compete. Posts may be associated with class, subject, skill, competition, or topic. Initial privacy model uses nickname/avatar rather than phone/email/address. Reporting, blocking/muting, automated inappropriate-content filtering, and Admin/Teacher moderation are planned.

## Advertising
Advertising is a separate future Admin Advertisement Manager. It is disabled by default and must remain separate from quiz/content access decisions.

## Engineering safety rule
The finalized large `app/src/main/assets/index.html` should not be wholesale replaced through the GitHub file editor. Risky integrations are tracked in `DEFERRED_MANUAL_FIXES.md` for a consolidated manual patch/build cycle after functional testing.
