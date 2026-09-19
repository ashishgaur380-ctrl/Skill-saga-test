/* Skill Saga — Quiz Access configuration
 * Central configuration for the finalized access/unlock architecture.
 * Payment remains disabled until the product is ready for launch.
 */
window.SKILL_SAGA_ACCESS_CONFIG = Object.freeze({
  PREMIUM_PAYMENT_ENABLED: false,
  MODES: Object.freeze({
    FREE: 'free',
    XP_UNLOCK: 'xp',
    COIN_UNLOCK: 'coins',
    PREMIUM: 'premium',
    ASSIGNED_ONLY: 'assigned'
  }),
  DEFAULT_MODE: 'free',
  DEFAULT_XP_REQUIRED: 500,
  DEFAULT_COINS_REQUIRED: 100,
  XP_IS_THRESHOLD: true,
  COINS_ARE_SPENDABLE: true
});
