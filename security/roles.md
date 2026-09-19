# Role and Permission Model

## Platform roles

- super_admin
- admin
- content_manager
- moderator
- support
- finance
- school_admin
- teacher
- parent
- learner

## Principle

Authentication identifies the user.

Authorization determines what the user can do.

The client may hide unavailable actions for usability, but security rules/backend authorization must enforce them.

## Sensitive operations

These must use privileged server-side operations:

- XP awards
- coin awards
- quiz scoring
- competition scoring
- leaderboard updates
- rewards
- premium entitlements
- payment state
- teacher payouts
- moderation enforcement
