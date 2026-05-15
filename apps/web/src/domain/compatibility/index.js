/**
 * Emotional compatibility domain
 *
 * Holds normalized compatibility input dimensions.
 * No scoring engine yet; this is intentionally a contract for future logic.
 */

export const createEmotionalCompatibilityInput = ({
  communicationStyle = 'reflective',
  conflictRepairStyle = 'collaborative',
  pacingPreference = 'slow',
  emotionalAvailability = 'consistent'
} = {}) => ({
  communicationStyle,
  conflictRepairStyle,
  pacingPreference,
  emotionalAvailability
})
