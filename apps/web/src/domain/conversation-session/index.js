import {
  WINDOW_STATES,
  canWindowOpen,
  determineWindowRhythm,
  getFutureEmotionalSafetyPlaceholder,
  getFutureWindowPacingPolicyPlaceholder,
  getIntentionalPacingRecommendation,
  getWindowPauseState,
  isMessagingAvailableForWindow
} from '../window/index.js'
import {
  createCompatibilitySignals,
  createConversationResonancePlaceholder,
  createPacingFitPlaceholder,
  createEmotionalAlignmentHints,
  createReflectivePromptsFromCompatibility
} from '../compatibility/index.js'
import {
  determineComfortSignals,
  determineSafetyState,
  createPauseRecommendation,
  determineTrustSignals,
  checkBoundaryPreferences,
  suggestGentleIntervention,
  createReportingHookPlaceholder
} from '../safety/index.js'
import { INTERVENTION_URGENCY, READINESS_LEVELS, RECOMMENDATION_TYPES } from '../contracts.js'

const toReadinessLevel = ({ canOpenWindow, messagingAvailable, paused }) => {
  if (paused) return READINESS_LEVELS.LOW
  if (canOpenWindow && messagingAvailable) return READINESS_LEVELS.READY
  return READINESS_LEVELS.EMERGING
}

const toInterventionUrgency = (interventionType) => {
  if (interventionType === 'boundary_reflection') return INTERVENTION_URGENCY.HIGH
  if (interventionType === 'pace_slowing') return INTERVENTION_URGENCY.MODERATE
  return INTERVENTION_URGENCY.LIGHT
}

export const createConversationSessionViewModel = ({ conversation, sessionContext } = {}) => {
  const { meCompatibilityProfile } = sessionContext

  const resolvedRhythm = determineWindowRhythm({
    averageReplyDelayHours: conversation.paused ? 30 : 10,
    emotionalSpaceNeed: conversation.emotionalSpaceLevel === 'tender' ? 'high' : 'medium',
    promptDensityPerDay: conversation.paused ? 0.25 : 1
  })

  const canOpenWindow = canWindowOpen({
    sparkStatus: conversation.windowState === WINDOW_STATES.OPENING || conversation.windowState === WINDOW_STATES.OPEN ? 'accepted' : 'invited',
    mutualParticipationReady: conversation.mutualParticipationReady,
    emotionalReadiness: conversation.emotionalSpaceLevel === 'steady' ? 0.7 : 0.4,
    isIntentionalBreakActive: conversation.windowState === WINDOW_STATES.PAUSED
  })

  const windowState = conversation.windowState || (canOpenWindow ? WINDOW_STATES.OPENING : WINDOW_STATES.UNAVAILABLE)
  const messagingAvailable = isMessagingAvailableForWindow({ state: windowState })
  const pauseState = getWindowPauseState({ state: windowState, pauseUntil: conversation.nextPromptAt })
  const pacingRecommendation = getIntentionalPacingRecommendation({ rhythm: resolvedRhythm, recentMessagesCount: conversation.messages.length, hoursSinceLastMessage: conversation.paused ? 18 : 4 })

  const compatibilitySignals = createCompatibilitySignals({ me: meCompatibilityProfile, other: conversation.compatibilityProfile })
  const resonance = createConversationResonancePlaceholder(compatibilitySignals)
  const pacingFit = createPacingFitPlaceholder(compatibilitySignals)
  const alignmentHints = createEmotionalAlignmentHints(compatibilitySignals)
  const reflectiveCompatibilityPrompts = createReflectivePromptsFromCompatibility(compatibilitySignals)

  const comfortSignals = determineComfortSignals({
    pacingMismatch: resolvedRhythm === 'reflective',
    pauseRequested: pauseState.isPaused,
    boundaryMentioned: conversation.safetyContext?.boundaryMentioned,
    unresolvedTension: conversation.safetyContext?.unresolvedTension
  })
  const safetyState = determineSafetyState({ comfortSignals })
  const pauseRecommendation = createPauseRecommendation({ safetyState, recentMessageCount: conversation.messages.length })
  const trustSignal = determineTrustSignals({
    mutualConsistency: conversation.safetyContext?.mutualConsistency,
    consentClarity: conversation.safetyContext?.consentClarity,
    repairAttempts: conversation.safetyContext?.repairAttempts
  })
  const boundaryCheck = checkBoundaryPreferences({
    boundaryPreferences: conversation.boundaryPreferences,
    conversationContext: {
      messageIntervalHours: conversation.safetyContext?.messageIntervalHours,
      isLateNight: conversation.safetyContext?.isLateNight,
      includesSensitiveTopic: conversation.safetyContext?.includesSensitiveTopic
    }
  })
  const intervention = suggestGentleIntervention({ safetyState, trustSignal, boundaryCheck })
  const reportingHook = createReportingHookPlaceholder({ conversationId: conversation.id, safetyState, interventionType: intervention.type })

  return {
    conversationId: conversation.id,
    header: {
      name: conversation.name,
      statusLine: pauseState.isPaused ? 'Paused for reflection' : `Next prompt in ${conversation.nextPromptAt}`,
      windowLine: `Window: ${windowState} · Rhythm: ${resolvedRhythm}`,
      messagingLine: messagingAvailable ? 'Messaging is gently available.' : 'Messaging is resting for now.'
    },
    readiness: toReadinessLevel({ canOpenWindow, messagingAvailable, paused: pauseState.isPaused }),
    recommendations: [
      { type: RECOMMENDATION_TYPES.PACING, text: pacingRecommendation.recommendation },
      { type: RECOMMENDATION_TYPES.COMPATIBILITY, text: resonance.note },
      { type: RECOMMENDATION_TYPES.COMPATIBILITY, text: pacingFit.note },
      { type: RECOMMENDATION_TYPES.COMPATIBILITY, text: alignmentHints[0] },
      { type: RECOMMENDATION_TYPES.SAFETY, text: pauseRecommendation.note },
      { type: RECOMMENDATION_TYPES.SAFETY, text: intervention.note }
    ],
    policy: {
      pacing: getFutureWindowPacingPolicyPlaceholder({ rhythm: resolvedRhythm }),
      emotionalSafety: getFutureEmotionalSafetyPlaceholder({ emotionalSpaceLevel: conversation.emotionalSpaceLevel })
    },
    safety: {
      state: safetyState,
      trustSignal,
      intervention,
      urgency: toInterventionUrgency(intervention.type),
      boundaryCheck,
      reportingHook
    },
    reflectivePrompt: reflectiveCompatibilityPrompts[0],
    paused: pauseState.isPaused,
    messagingAvailable
  }
}
