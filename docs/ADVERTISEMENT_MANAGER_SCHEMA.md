# Skill Saga — Advertisement Manager Schema

## Status

`ADS_ENABLED = false` by default. This module is planned and must not affect the current learner experience while disabled.

## Advertisement

```text
id
title
description
advertiserName
creativeType: image | banner | video | short_ad
creativeUrl
ctaText
ctaUrl
startAt
endAt
placements[]
targeting
frequencyLimit
priority
status: draft | scheduled | active | paused | expired
sponsoredLabel
createdBy
createdAt
updatedAt
```

## Placements

```text
HOME
LEARN
PLAY
QUIZ
QUIZ_RESULT
LEARNING_MATERIAL
COMPETE
FORUM
PREMIUM
```

## Analytics

```text
impressions
clicks
ctr
```

## Governance

- Ads must be clearly labelled as Sponsored/Advertisement.
- Admin controls creation, editing, scheduling, pausing, activation, and moderation.
- Targeting must be limited to appropriate educational/product criteria.
- Ads remain separate from quiz/content records.

## Implementation rule

Keep disabled until the product is ready. Do not introduce ad UI into the finalized `index.html` during the current safe modular phase.
