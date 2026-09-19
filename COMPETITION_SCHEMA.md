# Skill Saga — Competition Schema

## Competition scopes

- INDIVIDUAL
- CLASS
- SCHOOL
- DISTRICT
- STATE
- NATIONAL

## Competition model

- id
- title
- description
- scope
- classId (optional)
- subjectId (optional)
- skillId (optional)
- quizIds[]
- startAt
- endAt
- status: draft | scheduled | live | completed | archived
- entryAccess: free | xp | coins | premium | assigned
- rules
- participantCount
- leaderboardId
- createdAt
- updatedAt

## Initial competition types

- Weekly Championship
- Subject Challenge
- Class Challenge
- Inter-Class Quiz

## Result data

- competitionId
- userId
- score
- percentage
- points
- rank
- completedAt

The current tested competition UI remains unchanged. This document defines the future data contract for expansion.
