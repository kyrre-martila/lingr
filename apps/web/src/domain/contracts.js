export * from '../../../../packages/shared/src/contracts.js'

const toSet = (obj) => new Set(Object.values(obj))

export const ID_PREFIX = Object.freeze({
  USER: 'usr_',
  PROFILE: 'prf_',
  GLIMPS: 'glp_',
  SPARK: 'spk_',
  CONVERSATION: 'cnv_',
  WINDOW: 'cwin_',
  MESSAGE: 'msg_',
  SESSION: 'ses_',
  SAFETY_EVENT: 'sae_',
  COMPATIBILITY: 'cmp_'
})

export const isIsoTimestamp = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)
export const isIdWithPrefix = (value, prefix) => typeof value === 'string' && value.startsWith(prefix) && value.length > prefix.length

export const SAFETY_SEVERITY = Object.freeze({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' })
export const MODERATION_STATE = Object.freeze({ CLEAR: 'clear', NEEDS_REVIEW: 'needs_review', RESTRICTED: 'restricted' })
export const VISIBILITY_LEVEL = Object.freeze({ PUBLIC_DISCOVERY: 'public_discovery', MATCHED_ONLY: 'matched_only', PRIVATE: 'private', DISCOVERABLE: 'discoverable', LIMITED: 'limited', HIDDEN: 'hidden' })

export const SPARK_STATE = Object.freeze({ PENDING: 'pending', ACCEPTED: 'accepted', DECLINED: 'declined', EXPIRED: 'expired', REVOKED: 'revoked' })
export const WINDOW_STATE = Object.freeze({ OPEN: 'open', SOFT_PAUSED: 'soft_paused', PAUSED: 'paused' })
export const GLIMPS_STATE = Object.freeze({ DRAFT: 'draft', PUBLISHED: 'published', EXPIRED: 'expired', ARCHIVED: 'archived' })

export const resolvePolicyOutcome = ({ authState, lifecycleState, safetyBlocked, featureAllowed, routeAllowed }) => {
  if (authState !== AUTH_SESSION_STATE.AUTHENTICATED) return { outcome: ROUTE_OUTCOME.HARD_BLOCK, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH }
  if ([ACCOUNT_LIFECYCLE_STATE.DELETED, ACCOUNT_LIFECYCLE_STATE.RESTRICTED].includes(lifecycleState)) return { outcome: ROUTE_OUTCOME.HARD_BLOCK, reasonCode: REASON_CODES.SAFETY.RESTRICTED_ACCOUNT }
  if (safetyBlocked) return { outcome: ROUTE_OUTCOME.SOFT_BLOCK, reasonCode: REASON_CODES.SAFETY.PAUSED_FOR_SAFETY }
  if (!featureAllowed) return { outcome: ROUTE_OUTCOME.SOFT_BLOCK, reasonCode: REASON_CODES.PERMISSION.NOT_ALLOWED }
  if (!routeAllowed) return { outcome: ROUTE_OUTCOME.SOFT_BLOCK, reasonCode: REASON_CODES.ROUTE.REQUIRES_ONBOARDING }
  return { outcome: ROUTE_OUTCOME.ALLOW, reasonCode: null }
}

export const RHYTHM_LEVELS = Object.freeze({ GENTLE: 'gentle', NORMAL: 'normal', REFLECTIVE: 'reflective' })
export const READINESS_LEVELS = Object.freeze({ LOW: 'low', EMERGING: 'emerging', READY: 'ready' })
export const INTERVENTION_URGENCY = Object.freeze({ LIGHT: 'light', MODERATE: 'moderate', HIGH: 'high' })
export const RECOMMENDATION_TYPES = Object.freeze({ PACING: 'pacing', SAFETY: 'safety', COMPATIBILITY: 'compatibility', REFLECTION: 'reflection' })

export const CONTRACT_REGISTRIES = Object.freeze({
  reasonCodes: toSet(Object.values(REASON_CODES).flatMap((group) => Object.values(group)))
})
