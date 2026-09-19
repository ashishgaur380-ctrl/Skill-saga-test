# Skill Saga — Learn Content Schema

## Purpose

Define the stable data model for the Learn area without changing the existing learner UI yet.

## Academic hierarchy

`Class → Subject → Chapter → Topic → Lesson`

Every academic item should carry a stable identifier and its parent identifier. Avoid hard-coding class names into rendering logic.

### Academic Content

```text
id
contentType: academic
classId: class_1 ... class_12
subjectId
chapterId
topicId
lessonId
status: draft | published | archived
order

Lesson fields:
title
description
body / media references
estimatedMinutes
xpReward
coinReward
prerequisites[]
relatedQuizIds[]
createdAt
updatedAt
```

## Skills

```text
id
contentType: skill
skillId
skillName
topicId
level: foundation | basic | intermediate | advanced
status
order
lesson content
relatedQuizIds[]
```

## Other

```text
id
contentType: other
topicId
title
level
status
order
lesson content
relatedQuizIds[]
```

## Learning loop

A lesson may expose `Practice this topic` and route into the existing quiz engine. Quiz completion should remain the source of truth for XP, coins, skill progress, streaks, and history.

## Access

Learn content can later use the same entitlement model as quizzes:

- free
- xp
- coins
- premium
- assigned

XP is a threshold and is never spent. Coins may be spent. Premium payment remains disabled until explicitly enabled.

## Implementation rule

This schema is intentionally modular. Do not replace the large finalized `index.html` merely to introduce this model. Integrate it later through targeted changes after the current testing phase.
