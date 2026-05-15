const GLIMPS_MAX_REFLECTION_LENGTH = 280
const GLIMPS_MAX_IMAGE_NOTE_LENGTH = 160

export const GLIMPS_STATES = {
  DRAFT: 'draft',
  SHARED: 'shared',
  EXPIRED: 'expired',
  ARCHIVED: 'archived'
}

export const GLIMPS_PRIVACY_LEVELS = {
  PRIVATE: 'private',
  CONNECTION_ONLY: 'connection_only',
  VISIBLE_FOR_MATCHING: 'visible_for_matching'
}

export const GLIMPS_EMOTIONAL_TONES = {
  SOFT: 'soft',
  OPEN: 'open',
  TENDER: 'tender',
  GROUNDED: 'grounded',
  UNCERTAIN: 'uncertain'
}

export const GLIMPS_MODERATION_FLAGS = {
  NEEDS_REVIEW: 'needs_review',
  SELF_HARM_SIGNAL: 'self_harm_signal',
  HARASSMENT_SIGNAL: 'harassment_signal'
}

export const GLIMPS_VALIDATION_ERROR = {
  INVALID_STATE: 'invalid_state',
  INVALID_PRIVACY: 'invalid_privacy',
  INVALID_EMOTIONAL_TONE: 'invalid_emotional_tone',
  REFLECTION_REQUIRED: 'reflection_required',
  REFLECTION_TOO_LONG: 'reflection_too_long',
  MOOD_REQUIRED: 'mood_required',
  IMAGE_NOTE_TOO_LONG: 'image_note_too_long',
  INVALID_CREATED_AT: 'invalid_created_at'
}

const isKnownValue = (enumLike, value) => Object.values(enumLike).includes(value)
const toTrimmedString = (value) => String(value || '').trim()

const normalizeSoftMetadata = (input = {}) => ({
  promptCategory: toTrimmedString(input.promptCategory),
  source: toTrimmedString(input.source) || 'local_mock',
  tags: Array.isArray(input.tags) ? input.tags.map((tag) => toTrimmedString(tag)).filter(Boolean) : []
})

export const createGlimpsDraft = ({
  reflection = '',
  mood = '',
  prompt = '',
  imageNote = '',
  privacy = GLIMPS_PRIVACY_LEVELS.PRIVATE,
  emotionalTone = GLIMPS_EMOTIONAL_TONES.SOFT,
  state = GLIMPS_STATES.DRAFT,
  createdAt,
  softMetadata = {}
} = {}) => ({
  reflection: toTrimmedString(reflection),
  mood: toTrimmedString(mood),
  prompt: toTrimmedString(prompt),
  imageNote: toTrimmedString(imageNote),
  privacy,
  emotionalTone,
  state,
  createdAt: createdAt || new Date().toISOString(),
  softMetadata: normalizeSoftMetadata(softMetadata),
  moderation: { flags: [], status: 'clear' }
})

export const validateGlimps = (glimps = {}) => {
  const errors = []

  if (!isKnownValue(GLIMPS_STATES, glimps.state)) errors.push(GLIMPS_VALIDATION_ERROR.INVALID_STATE)
  if (!isKnownValue(GLIMPS_PRIVACY_LEVELS, glimps.privacy)) errors.push(GLIMPS_VALIDATION_ERROR.INVALID_PRIVACY)
  if (!isKnownValue(GLIMPS_EMOTIONAL_TONES, glimps.emotionalTone)) errors.push(GLIMPS_VALIDATION_ERROR.INVALID_EMOTIONAL_TONE)

  if (!toTrimmedString(glimps.reflection)) errors.push(GLIMPS_VALIDATION_ERROR.REFLECTION_REQUIRED)
  if (toTrimmedString(glimps.reflection).length > GLIMPS_MAX_REFLECTION_LENGTH) errors.push(GLIMPS_VALIDATION_ERROR.REFLECTION_TOO_LONG)
  if (!toTrimmedString(glimps.mood)) errors.push(GLIMPS_VALIDATION_ERROR.MOOD_REQUIRED)
  if (toTrimmedString(glimps.imageNote).length > GLIMPS_MAX_IMAGE_NOTE_LENGTH) errors.push(GLIMPS_VALIDATION_ERROR.IMAGE_NOTE_TOO_LONG)

  const timestamp = Date.parse(glimps.createdAt)
  if (Number.isNaN(timestamp)) errors.push(GLIMPS_VALIDATION_ERROR.INVALID_CREATED_AT)

  return {
    valid: errors.length === 0,
    errors
  }
}

export const getGlimpsExpirationState = ({ glimps, now = new Date().toISOString() } = {}) => {
  // Placeholder for future server-backed expiration windows.
  const createdAtMs = Date.parse(glimps?.createdAt || 0)
  const nowMs = Date.parse(now)

  if (Number.isNaN(createdAtMs) || Number.isNaN(nowMs)) {
    return { shouldExpire: false, reason: 'invalid_timestamp' }
  }

  const ageInHours = Math.max(0, Math.floor((nowMs - createdAtMs) / (1000 * 60 * 60)))
  return {
    shouldExpire: false,
    reason: 'placeholder_policy',
    ageInHours
  }
}

export const evaluateGlimpsSafetyPlaceholder = (glimps = {}) => {
  const reflection = toTrimmedString(glimps.reflection).toLowerCase()
  const flags = []

  if (reflection.includes('hurt myself')) flags.push(GLIMPS_MODERATION_FLAGS.SELF_HARM_SIGNAL)
  if (reflection.includes('you are worthless')) flags.push(GLIMPS_MODERATION_FLAGS.HARASSMENT_SIGNAL)

  return {
    status: flags.length ? 'needs_review' : 'clear',
    flags: flags.length ? [GLIMPS_MODERATION_FLAGS.NEEDS_REVIEW, ...flags] : []
  }
}
