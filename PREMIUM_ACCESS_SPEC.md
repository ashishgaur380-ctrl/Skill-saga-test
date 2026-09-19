# Skill Saga — Premium & Quiz Access Specification

## Feature state

`PREMIUM_PAYMENT_ENABLED = false`

Premium payment must remain disabled until launch readiness is confirmed.

## Quiz access modes

1. FREE — immediately available.
2. XP_UNLOCK — available when the learner reaches the configured XP threshold. XP is a progression threshold and is not spent.
3. COIN_UNLOCK — learner spends the configured number of coins.
4. PREMIUM — requires an active premium entitlement.
5. ASSIGNED — available only through an Admin/Teacher assignment.

## Quiz fields

- accessMode
- requiredXp
- requiredCoins
- premiumRequired
- assignedOnly

## Principles

- XP represents learning/progression and cannot be purchased.
- Coins are spendable in-app currency.
- Premium entitlement must be separate from XP/coin balances.
- Access checks must happen before starting a quiz.
- Existing working quiz completion/reward logic should remain unchanged.
- Payment integration is a later launch task.

## Future premium scope

- Expanded learning content
- Advanced practice
- Personalized learning plans
- Advanced Skill DNA analytics
- Detailed progress analytics
- Parent reports
- Premium competitions/events
- Additional customization

Implementation of UI/payment remains deferred until the consolidated integration pass.
