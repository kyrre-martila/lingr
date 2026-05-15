export const SAFETY_STATES = {
  COMFORTABLE: 'comfortable',
  UNCERTAIN: 'uncertain',
  PAUSE_RECOMMENDED: 'pause_recommended',
  CHECK_IN_RECOMMENDED: 'check_in_recommended',
  BOUNDARY_CROSSED: 'boundary_crossed'
}

export const TRUST_SIGNAL_STATES = {
  STEADY: 'steady',
  GROWING: 'growing',
  NEEDS_CARE: 'needs_care'
}

export const INTERVENTION_TYPES = {
  GENTLE_CHECK_IN: 'gentle_check_in',
  PACE_SLOWING: 'pace_slowing',
  BOUNDARY_REFLECTION: 'boundary_reflection'
}

const createBoundaryPreferences = ({
  pace = 'steady',
  preferredResponseWindowHours = 12,
  consentForLateNightPrompts = false,
  allowSensitiveTopics = false
} = {}) => ({
  pace,
  preferredResponseWindowHours,
  consentForLateNightPrompts,
  allowSensitiveTopics
})

export const createSafetyState = ({
  state = SAFETY_STATES.COMFORTABLE,
  comfortSignals = [],
  trustSignals = [],
  notes = []
} = {}) => ({
  state,
  comfortSignals,
  trustSignals,
  notes,
  isCalm: state === SAFETY_STATES.COMFORTABLE || state === SAFETY_STATES.CHECK_IN_RECOMMENDED
})

export const determineComfortSignals = ({
  pacingMismatch = false,
  pauseRequested = false,
  boundaryMentioned = false,
  unresolvedTension = false
} = {}) => {
  const signals = []
  if (pauseRequested) signals.push('pause_requested')
  if (pacingMismatch) signals.push('pacing_mismatch')
  if (boundaryMentioned) signals.push('boundary_mentioned')
  if (unresolvedTension) signals.push('unresolved_tension')
  return signals
}

export const determineSafetyState = ({ comfortSignals = [] } = {}) => {
  if (comfortSignals.includes('boundary_mentioned') && comfortSignals.includes('unresolved_tension')) {
    return SAFETY_STATES.BOUNDARY_CROSSED
  }
  if (comfortSignals.includes('pause_requested')) return SAFETY_STATES.PAUSE_RECOMMENDED
  if (comfortSignals.includes('pacing_mismatch')) return SAFETY_STATES.CHECK_IN_RECOMMENDED
  if (comfortSignals.includes('unresolved_tension')) return SAFETY_STATES.UNCERTAIN
  return SAFETY_STATES.COMFORTABLE
}

export const createPauseRecommendation = ({ safetyState, recentMessageCount = 0 } = {}) => {
  const shouldPause = [SAFETY_STATES.PAUSE_RECOMMENDED, SAFETY_STATES.BOUNDARY_CROSSED].includes(safetyState)
  const gentleDelayHours = shouldPause ? 12 : recentMessageCount > 8 ? 6 : 0
  return {
    shouldPause,
    gentleDelayHours,
    note: shouldPause ? 'A short pause may help both people feel grounded before continuing.' : 'Current pace looks okay for now.'
  }
}

export const determineTrustSignals = ({ mutualConsistency = true, consentClarity = true, repairAttempts = 0 } = {}) => {
  if (!consentClarity) return TRUST_SIGNAL_STATES.NEEDS_CARE
  if (mutualConsistency && repairAttempts <= 1) return TRUST_SIGNAL_STATES.STEADY
  return TRUST_SIGNAL_STATES.GROWING
}

export const checkBoundaryPreferences = ({ boundaryPreferences, conversationContext } = {}) => {
  const preferences = createBoundaryPreferences(boundaryPreferences)
  const { messageIntervalHours = 12, isLateNight = false, includesSensitiveTopic = false } = conversationContext || {}

  const mismatches = []
  if (messageIntervalHours < preferences.preferredResponseWindowHours / 2) mismatches.push('pace_too_fast')
  if (isLateNight && !preferences.consentForLateNightPrompts) mismatches.push('late_night_without_consent')
  if (includesSensitiveTopic && !preferences.allowSensitiveTopics) mismatches.push('sensitive_topic_without_opt_in')

  return { preferences, mismatches, respectsBoundaries: mismatches.length === 0 }
}

export const suggestGentleIntervention = ({ safetyState, trustSignal, boundaryCheck } = {}) => {
  if (safetyState === SAFETY_STATES.BOUNDARY_CROSSED || !boundaryCheck?.respectsBoundaries) {
    return {
      type: INTERVENTION_TYPES.BOUNDARY_REFLECTION,
      note: 'Consider a boundary check-in before continuing this thread.'
    }
  }

  if (safetyState === SAFETY_STATES.PAUSE_RECOMMENDED) {
    return {
      type: INTERVENTION_TYPES.PACE_SLOWING,
      note: 'A gentle pause can help conversation stay emotionally safe.'
    }
  }

  if (trustSignal === TRUST_SIGNAL_STATES.NEEDS_CARE || safetyState === SAFETY_STATES.CHECK_IN_RECOMMENDED) {
    return {
      type: INTERVENTION_TYPES.GENTLE_CHECK_IN,
      note: 'A simple “how is this pace feeling for you?” check-in may help.'
    }
  }

  return {
    type: INTERVENTION_TYPES.GENTLE_CHECK_IN,
    note: 'Comfort looks steady. Keep pacing intentional and mutual.'
  }
}

export const createReportingHookPlaceholder = ({ conversationId, safetyState, interventionType } = {}) => ({
  conversationId,
  safetyState,
  interventionType,
  reportCategory: 'not_set',
  summary: 'Placeholder only: future reporting/moderation pipeline can attach here.',
  isReadyForBackend: false
})
