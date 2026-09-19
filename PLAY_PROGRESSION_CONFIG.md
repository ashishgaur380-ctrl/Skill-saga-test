# Skill Saga — Play Progression Configuration

```js
const PLAY_PROGRESSION = Object.freeze({
  CURRENT_CLASS: { xp: 0, coins: 0 },
  PLUS_MINUS_1: { xp: 500, coins: 50 },
  PLUS_MINUS_2: { xp: 1000, coins: 100 },
  PLUS_MINUS_3: { xp: 2000, coins: 200 }
});
```

## Meaning

- XP is a threshold and is never deducted for class unlocks.
- Coins are spendable and are deducted when a coin unlock is actually used.
- The current academic class remains free/unlocked.
- Additional/higher classes can use progressive requirements configured by Admin.
- Skills and Other use their own level/difficulty rules and are not forced into academic class unlocking.

This is a reference configuration only. It is not wired into the current UI yet.
