/**
 * Intentional discovery domain
 *
 * Handles daily pacing constraints for introductions/discovery actions.
 * Pure functions only; backend counters can replace these inputs later.
 */

export const createDailyDiscoveryLimit = ({ dateKey, used = 0, max = 3 } = {}) => {
  const remaining = Math.max(max - used, 0)

  return {
    dateKey: dateKey || new Date().toISOString().slice(0, 10),
    used,
    max,
    remaining,
    exhausted: remaining === 0
  }
}
