/**
 * Pulse domain
 *
 * Pulse is a lightweight emotional tempo signal for a person or connection.
 * Placeholder for future richer sentiment and rhythm modeling.
 */

export const createPulse = ({ tone = 'steady', energy = 'medium', checkInAt = null } = {}) => ({
  tone,
  energy,
  checkInAt
})
