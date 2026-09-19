# Skill Saga — Advertisement Manager Schema

## Feature flag

`ADS_ENABLED = false`

Advertising is disabled until the product is ready for launch.

## Ad model

- id
- title
- description
- advertiser
- mediaType: image | banner | video | short
- mediaUrl
- ctaText
- ctaUrl
- placements[]: Home | Learn | Play | Quiz | Result | Material | Compete | Forum | Premium
- startAt
- endAt
- frequencyLimit
- targeting
- priority
- status: draft | scheduled | active | paused | expired
- sponsoredLabel: Advertisement / Sponsored
- impressions
- clicks
- ctr
- createdAt
- updatedAt

## Admin lifecycle

Create → Draft → Schedule → Active → Pause/Resume → Expire

## Safety

- Ads must be clearly labeled.
- Content requires moderation/approval before activation.
- Advertising is separate from quiz/content access and XP progression.
- No purchase should grant XP or alter genuine learning progression.

Implementation is deferred until the final UI integration pass.
