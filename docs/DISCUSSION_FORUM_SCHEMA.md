# Skill Saga — Discussion Forum Schema

## Location

Discussion Forum belongs inside **Compete**. It is not a separate top-level navigation item.

## Discussion

```text
id
title
body
nickname
avatar
classId (optional)
subjectId (optional)
skillId (optional)
topicId (optional)
competitionId (optional)
authorUid
status: active | locked | removed
pinned: boolean
createdAt
updatedAt
reportCount
```

## Safety and moderation

- Never expose phone number, email, address, or other direct contact details in public discussion data.
- No private one-to-one messaging in the initial release.
- Users can report, block, and mute.
- Inappropriate content should be filtered before publication where supported.
- Admin can remove or lock discussions.
- Teachers can pin educational discussions where authorized.
- Competition-specific discussions can be archived after the competition.

## Relationship to learning

A discussion can be associated with a class, subject, skill, topic, or competition. Learn content may later link to a relevant discussion thread.

Target loop:

`Learn → Discuss → Play Quiz → Improve → Compete → Discuss`

## Implementation rule

Schema only for now. Do not modify the finalized learner UI until the consolidated integration pass.
