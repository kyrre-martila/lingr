/**
 * Safety domain
 *
 * Safety states and flags are intentionally simple placeholders for now.
 * These contracts can later map to backend moderation and trust systems.
 */

export const SAFETY_STATES = {
  CLEAR: 'clear',
  REVIEW: 'review',
  RESTRICTED: 'restricted'
}

export const createSafetyState = ({ state = SAFETY_STATES.CLEAR, flags = [] } = {}) => ({
  state,
  flags,
  hasFlags: flags.length > 0
})
