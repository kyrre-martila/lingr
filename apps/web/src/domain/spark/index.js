const DEFAULT_DAILY_SPARK_INVITE_LIMIT = 3
const DEFAULT_CONNECTION_WINDOW_THRESHOLD = 0.7

export const SPARK_STATUSES = {
  POTENTIAL: 'potential',
  INVITED: 'invited',
  ACCEPTED: 'accepted',
  PAUSED: 'paused',
  DECLINED: 'declined',
  EXPIRED: 'expired'
}

export const SPARK_DECISIONS = {
  ACCEPT: 'accept',
  DECLINE: 'decline',
  PAUSE: 'pause'
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const toNumber = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback)
const toTrimmedString = (value) => String(value || '').trim()
const isKnownValue = (enumLike, value) => Object.values(enumLike).includes(value)

export const calculateSoftResonanceSignals = ({
  sharedValuesOverlap = 0,
  emotionalRhythmAlignment = 0,
  reflectionDepthAlignment = 0,
  pacingAlignment = 0
} = {}) => {
  const normalized = {
    sharedValuesOverlap: clamp(toNumber(sharedValuesOverlap)),
    emotionalRhythmAlignment: clamp(toNumber(emotionalRhythmAlignment)),
    reflectionDepthAlignment: clamp(toNumber(reflectionDepthAlignment)),
    pacingAlignment: clamp(toNumber(pacingAlignment))
  }

  const resonanceScore = clamp(
    normalized.sharedValuesOverlap * 0.32
      + normalized.emotionalRhythmAlignment * 0.28
      + normalized.reflectionDepthAlignment * 0.22
      + normalized.pacingAlignment * 0.18
  )

  return {
    ...normalized,
    resonanceScore,
    feelsMutual: resonanceScore >= 0.55,
    feelsGrounded: normalized.pacingAlignment >= 0.45 && normalized.emotionalRhythmAlignment >= 0.45
  }
}

export const canStartSpark = ({
  existingSparkStatus,
  dailyInvitesSent = 0,
  dailyInviteLimit = DEFAULT_DAILY_SPARK_INVITE_LIMIT,
  connectionReadiness = 0.5,
  resonanceSignals = {}
} = {}) => {
  const readiness = clamp(toNumber(connectionReadiness, 0.5))
  const invitesSent = Math.max(0, Math.floor(toNumber(dailyInvitesSent, 0)))
  const inviteLimit = Math.max(1, Math.floor(toNumber(dailyInviteLimit, DEFAULT_DAILY_SPARK_INVITE_LIMIT)))
  const normalizedSignals = calculateSoftResonanceSignals(resonanceSignals)
  const status = existingSparkStatus || SPARK_STATUSES.POTENTIAL

  if (isKnownValue(SPARK_STATUSES, status) && ![SPARK_STATUSES.POTENTIAL, SPARK_STATUSES.EXPIRED, SPARK_STATUSES.DECLINED].includes(status)) {
    return { allowed: false, reason: 'spark_already_active', readiness, signals: normalizedSignals }
  }

  if (invitesSent >= inviteLimit) {
    return { allowed: false, reason: 'daily_pacing_limit_reached', readiness, signals: normalizedSignals }
  }

  if (readiness < 0.45) {
    return { allowed: false, reason: 'connection_not_ready_yet', readiness, signals: normalizedSignals }
  }

  if (!normalizedSignals.feelsMutual) {
    return { allowed: false, reason: 'insufficient_mutual_resonance', readiness, signals: normalizedSignals }
  }

  return { allowed: true, reason: 'ready_for_invitation', readiness, signals: normalizedSignals }
}

export const createSparkInvitation = ({
  sparkId,
  fromUserId,
  toUserId,
  note = '',
  resonanceSignals = {},
  connectionReadiness = 0.5,
  invitedAt = new Date().toISOString()
} = {}) => ({
  id: sparkId || `spark-${toTrimmedString(fromUserId)}-${toTrimmedString(toUserId)}`,
  fromUserId: toTrimmedString(fromUserId),
  toUserId: toTrimmedString(toUserId),
  note: toTrimmedString(note),
  invitedAt,
  status: SPARK_STATUSES.INVITED,
  connectionReadiness: clamp(toNumber(connectionReadiness, 0.5)),
  resonanceSignals: calculateSoftResonanceSignals(resonanceSignals)
})

export const resolveSparkStatus = ({ status = SPARK_STATUSES.POTENTIAL, decision } = {}) => {
  if (!isKnownValue(SPARK_STATUSES, status)) return SPARK_STATUSES.POTENTIAL

  if (status === SPARK_STATUSES.INVITED && decision === SPARK_DECISIONS.ACCEPT) return SPARK_STATUSES.ACCEPTED
  if (status === SPARK_STATUSES.INVITED && decision === SPARK_DECISIONS.DECLINE) return SPARK_STATUSES.DECLINED
  if ([SPARK_STATUSES.INVITED, SPARK_STATUSES.ACCEPTED].includes(status) && decision === SPARK_DECISIONS.PAUSE) return SPARK_STATUSES.PAUSED

  return status
}

export const shouldOpenConversationWindowLater = ({
  sparkStatus,
  resonanceSignals = {},
  connectionReadiness = 0.5,
  minScore = DEFAULT_CONNECTION_WINDOW_THRESHOLD
} = {}) => {
  const status = sparkStatus || SPARK_STATUSES.POTENTIAL
  const readiness = clamp(toNumber(connectionReadiness, 0.5))
  const signals = calculateSoftResonanceSignals(resonanceSignals)

  if (status !== SPARK_STATUSES.ACCEPTED) {
    return { shouldOpen: false, reason: 'spark_not_accepted', suggestedDelayHours: 24 }
  }

  if (readiness < 0.6 || signals.resonanceScore < clamp(toNumber(minScore, DEFAULT_CONNECTION_WINDOW_THRESHOLD))) {
    return { shouldOpen: false, reason: 'deepen_resonance_first', suggestedDelayHours: 18 }
  }

  return { shouldOpen: true, reason: 'spark_ready_for_window', suggestedDelayHours: 6 }
}

export const getSparkStatusLabel = (status) => {
  const value = isKnownValue(SPARK_STATUSES, status) ? status : SPARK_STATUSES.POTENTIAL
  return value.charAt(0).toUpperCase() + value.slice(1)
}
