/**
 * Conversation Window domain
 *
 * A Window represents an intentional conversation span between two users.
 * This module is platform-neutral and frontend-safe (no transport/persistence).
 */

export const WINDOW_STATES = Object.freeze({
  UNAVAILABLE: 'unavailable',
  OPENING: 'opening',
  OPEN: 'open',
  PAUSED: 'paused',
  QUIET: 'quiet',
  CLOSED: 'closed'
})

export const WINDOW_RHYTHMS = Object.freeze({
  GENTLE: 'gentle',
  NORMAL: 'normal',
  REFLECTIVE: 'reflective'
})

export const createConversationWindow = ({
  id,
  userIds = [],
  opensAt = null,
  closesAt = null,
  state = WINDOW_STATES.UNAVAILABLE,
  rhythm = WINDOW_RHYTHMS.GENTLE,
  pauseReason = '',
  mutualParticipationReady = true,
  emotionalSpaceLevel = 'steady'
}) => ({
  id,
  userIds,
  opensAt,
  closesAt,
  state,
  rhythm,
  pauseReason,
  mutualParticipationReady,
  emotionalSpaceLevel
})

export const canWindowOpen = ({
  sparkStatus = 'potential',
  mutualParticipationReady = false,
  emotionalReadiness = 0,
  isIntentionalBreakActive = false
} = {}) => sparkStatus === 'accepted' && mutualParticipationReady && emotionalReadiness >= 0.45 && !isIntentionalBreakActive

export const isMessagingAvailableForWindow = ({ state } = {}) => [WINDOW_STATES.OPENING, WINDOW_STATES.OPEN, WINDOW_STATES.QUIET].includes(state)

export const getWindowPauseState = ({ state = WINDOW_STATES.UNAVAILABLE, pauseUntil = null, pauseReason = '' } = {}) => ({
  isPaused: state === WINDOW_STATES.PAUSED,
  pauseUntil,
  pauseReason: pauseReason || 'Taking a gentle pause for reflection.'
})

export const determineWindowRhythm = ({
  averageReplyDelayHours = 12,
  emotionalSpaceNeed = 'medium',
  promptDensityPerDay = 1
} = {}) => {
  if (emotionalSpaceNeed === 'high' || averageReplyDelayHours >= 24 || promptDensityPerDay <= 0.5) {
    return WINDOW_RHYTHMS.REFLECTIVE
  }

  if (averageReplyDelayHours <= 6 && promptDensityPerDay >= 1.5 && emotionalSpaceNeed === 'low') {
    return WINDOW_RHYTHMS.NORMAL
  }

  return WINDOW_RHYTHMS.GENTLE
}

export const getIntentionalPacingRecommendation = ({
  rhythm = WINDOW_RHYTHMS.GENTLE,
  recentMessagesCount = 0,
  hoursSinceLastMessage = 12
} = {}) => {
  if (rhythm === WINDOW_RHYTHMS.REFLECTIVE) {
    return {
      shouldSlowDown: recentMessagesCount >= 2 || hoursSinceLastMessage < 8,
      recommendation: 'Consider a longer pause before the next reply so there is room to reflect.'
    }
  }

  if (rhythm === WINDOW_RHYTHMS.NORMAL) {
    return {
      shouldSlowDown: recentMessagesCount >= 4 && hoursSinceLastMessage < 3,
      recommendation: 'A short pause may help keep the conversation intentional.'
    }
  }

  return {
    shouldSlowDown: recentMessagesCount >= 3 && hoursSinceLastMessage < 6,
    recommendation: 'Keep a gentle pace and respond when you can be present.'
  }
}

export const getFutureWindowPacingPolicyPlaceholder = ({ rhythm = WINDOW_RHYTHMS.GENTLE } = {}) => ({
  rhythm,
  maxSuggestedMessagesPerDay: rhythm === WINDOW_RHYTHMS.REFLECTIVE ? 2 : rhythm === WINDOW_RHYTHMS.NORMAL ? 6 : 4,
  minSuggestedReplyDelayHours: rhythm === WINDOW_RHYTHMS.REFLECTIVE ? 8 : rhythm === WINDOW_RHYTHMS.NORMAL ? 2 : 4
})

export const getFutureEmotionalSafetyPlaceholder = ({
  emotionalSpaceLevel = 'steady',
  receivedBoundarySignal = false
} = {}) => ({
  shouldSuggestPause: receivedBoundarySignal || emotionalSpaceLevel === 'tender',
  shouldSuggestPromptInsteadOfFreeform: emotionalSpaceLevel === 'tender'
})
