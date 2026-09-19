# Skill Saga — Discussion Forum Schema

The Discussion Forum belongs inside **Compete** and may later be linked from Learn topic pages.

## Discussion model

- id
- authorUid
- authorNickname
- authorAvatar
- classId (optional)
- subjectId (optional)
- skillId (optional)
- competitionId (optional)
- topicId (optional)
- title
- body
- tags[]
- replyCount
- status: active | locked | removed
- pinned: admin/teacher moderation
- reportedCount
- createdAt
- updatedAt

## Safety and privacy

- Display nickname/avatar rather than phone, email, or address.
- No private 1-to-1 messaging in the initial version.
- Users can report, block, and mute.
- Inappropriate-content filtering should run before publication where supported.
- Admin can remove or lock discussions.
- Teachers can pin educational discussions.
- Competition-specific discussions can be archived after the event.

## Initial areas

- Popular Discussions
- Class Discussions
- Subject Discussions
- Skill Discussions
- Competition Discussions

## Product loop

Learn → Topic → Discussion → Play Quiz → Improve → Compete → Discussion

Implementation remains deferred until the final UI integration pass so the finalized index.html is not disrupted.
