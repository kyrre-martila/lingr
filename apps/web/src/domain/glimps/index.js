/**
 * Glimps domain
 *
 * A "Glimps" is Lingr's lightweight daily expression unit.
 * This module intentionally avoids UI/DOM concerns so the same contract
 * can be shared across web and future mobile clients.
 */

export const GLIMPS_LIMIT_REASON = {
  DAILY_LIMIT_REACHED: 'daily_limit_reached',
  EMPTY_CONTENT: 'empty_content',
  PAUSED: 'paused',
  ALLOWED: 'allowed'
}

/**
 * Placeholder policy helper for Glimps creation checks.
 *
 * @param {object} input
 * @param {number} input.createdToday
 * @param {number} input.dailyLimit
 * @param {boolean} [input.isPaused]
 * @param {string} [input.draftText]
 */
export const canCreateGlimps = ({ createdToday = 0, dailyLimit = 1, isPaused = false, draftText = '' } = {}) => {
  if (isPaused) return { allowed: false, reason: GLIMPS_LIMIT_REASON.PAUSED }
  if (createdToday >= dailyLimit) return { allowed: false, reason: GLIMPS_LIMIT_REASON.DAILY_LIMIT_REACHED }
  if (!draftText.trim()) return { allowed: false, reason: GLIMPS_LIMIT_REASON.EMPTY_CONTENT }

  return { allowed: true, reason: GLIMPS_LIMIT_REASON.ALLOWED }
}
