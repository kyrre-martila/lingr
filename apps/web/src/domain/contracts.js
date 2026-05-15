const toSet = (obj) => new Set(Object.values(obj))
const has = (set, value) => set.has(value)

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

export const API_RESPONSE_STATUS = Object.freeze({ SUCCESS: 'success', ERROR: 'error' })
export const DOMAIN_ERROR_KIND = Object.freeze({ VALIDATION: 'validation', AUTH: 'auth', PERMISSION: 'permission', ROUTE: 'route', SAFETY: 'safety', MODERATION: 'moderation', DOMAIN: 'domain' })

export const AUTH_SESSION_STATE = Object.freeze({ ANONYMOUS: 'anonymous', AUTHENTICATED: 'authenticated', EXPIRED: 'expired' })
export const ACCOUNT_LIFECYCLE_STATE = Object.freeze({ ONBOARDING: 'onboarding', ACTIVE: 'active', PAUSED: 'paused', DELETED: 'deleted', RESTRICTED: 'restricted' })

export const ROUTE_OUTCOME = Object.freeze({ ALLOW: 'allow', SOFT_BLOCK: 'soft_block', HARD_BLOCK: 'hard_block' })

export const SAFETY_SEVERITY = Object.freeze({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' })
export const MODERATION_STATE = Object.freeze({ CLEAR: 'clear', NEEDS_REVIEW: 'needs_review', RESTRICTED: 'restricted' })
export const VISIBILITY_LEVEL = Object.freeze({ PUBLIC_DISCOVERY: 'public_discovery', MATCHED_ONLY: 'matched_only', PRIVATE: 'private', DISCOVERABLE: 'discoverable', LIMITED: 'limited', HIDDEN: 'hidden' })

export const SPARK_STATE = Object.freeze({ PENDING: 'pending', ACCEPTED: 'accepted', DECLINED: 'declined', EXPIRED: 'expired', REVOKED: 'revoked' })
export const WINDOW_STATE = Object.freeze({ OPEN: 'open', SOFT_PAUSED: 'soft_paused', PAUSED: 'paused' })
export const GLIMPS_STATE = Object.freeze({ DRAFT: 'draft', PUBLISHED: 'published', EXPIRED: 'expired', ARCHIVED: 'archived' })

export const REASON_CODES = Object.freeze({
  AUTH: Object.freeze({ REQUIRES_AUTH: 'auth.requires_auth', SESSION_EXPIRED: 'auth.session_expired', INVALID_SESSION: 'auth.invalid_session' }),
  ROUTE: Object.freeze({ UNKNOWN_ROUTE: 'route.unknown_route', REQUIRES_ONBOARDING: 'route.requires_onboarding', REQUIRES_APP_SESSION: 'route.requires_app_session' }),
  SAFETY: Object.freeze({ PAUSED_FOR_SAFETY: 'safety.paused_for_safety', RESTRICTED_ACCOUNT: 'safety.restricted_account' }),
  MODERATION: Object.freeze({ CONTENT_REVIEW: 'moderation.content_review', CONTENT_RESTRICTED: 'moderation.content_restricted' }),
  VALIDATION: Object.freeze({ INVALID_ID: 'validation.invalid_id', INVALID_TIMESTAMP: 'validation.invalid_timestamp', INVALID_PAYLOAD: 'validation.invalid_payload' }),
  PERMISSION: Object.freeze({ NOT_ALLOWED: 'permission.not_allowed', FEATURE_DISABLED: 'permission.feature_disabled' })
})

const STATUS_VALUES = toSet(API_RESPONSE_STATUS)
const ERROR_KIND_VALUES = toSet(DOMAIN_ERROR_KIND)

export const isApiSuccessEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.SUCCESS && 'data' in value)
export const isApiErrorEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.ERROR && value.error && has(ERROR_KIND_VALUES, value.error.kind) && typeof value.error.reasonCode === 'string')

export const POLICY_PRECEDENCE = Object.freeze([
  'auth_validity',
  'account_lifecycle',
  'safety_overlay',
  'feature_permissions',
  'route_outcome'
])

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
