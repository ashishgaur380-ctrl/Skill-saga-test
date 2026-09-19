# Skill Saga — Competition Schema

## Competition scopes

```text
INDIVIDUAL
CLASS
SCHOOL
DISTRICT
STATE
NATIONAL
```

## Competition

```text
id
title
description
scope
classId (optional)
subjectId (optional)
skillId (optional)
quizIds[]
startAt
endAt
status: draft | scheduled | active | completed | cancelled
maxParticipants (optional)
entryAccess: free | xp | coins | premium | assigned
rules
createdBy
createdAt
updatedAt
```

## Participant

```text
competitionId
userId
score
correctAnswers
totalQuestions
competitionPoints
rank
joinedAt
completedAt
```

## Ranking model

Competition points and ranks are competition-specific. They must not overwrite the learner's XP, which remains the learning-progress currency/measure.

## Future hierarchy

`Student → Class → School → District → State → National`

The initial implementation can operate at smaller scopes while preserving these stable enum values.

## Implementation rule

This file defines the backend/data contract only. Existing Compete screens remain untouched until the final integration pass.
