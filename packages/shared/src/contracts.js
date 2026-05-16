const toSet = (obj) => new Set(Object.values(obj))
const has = (set, value) => set.has(value)

export const API_RESPONSE_STATUS = Object.freeze({ SUCCESS: 'success', ERROR: 'error' })
export const DOMAIN_ERROR_KIND = Object.freeze({ VALIDATION: 'validation', AUTH: 'auth', PERMISSION: 'permission', ROUTE: 'route', SAFETY: 'safety', MODERATION: 'moderation', DOMAIN: 'domain' })
export const ERROR_RETRYABILITY = Object.freeze({
  [DOMAIN_ERROR_KIND.VALIDATION]: false,
  [DOMAIN_ERROR_KIND.AUTH]: false,
  [DOMAIN_ERROR_KIND.PERMISSION]: false,
  [DOMAIN_ERROR_KIND.ROUTE]: false,
  [DOMAIN_ERROR_KIND.SAFETY]: false,
  [DOMAIN_ERROR_KIND.MODERATION]: false,
  [DOMAIN_ERROR_KIND.DOMAIN]: true
})

export const AUTH_SESSION_STATE = Object.freeze({ ANONYMOUS: 'anonymous', AUTHENTICATED: 'authenticated', EXPIRED: 'expired' })
export const ACCOUNT_LIFECYCLE_STATE = Object.freeze({ ONBOARDING: 'onboarding', ACTIVE: 'active', PAUSED: 'paused', DELETED: 'deleted', RESTRICTED: 'restricted' })
export const ROUTE_OUTCOME = Object.freeze({ ALLOW: 'allow', SOFT_BLOCK: 'soft_block', HARD_BLOCK: 'hard_block' })

export const REASON_CODES = Object.freeze({
  AUTH: Object.freeze({ REQUIRES_AUTH: 'auth.requires_auth', SESSION_EXPIRED: 'auth.session_expired', INVALID_SESSION: 'auth.invalid_session' }),
  ROUTE: Object.freeze({ UNKNOWN_ROUTE: 'route.unknown_route', REQUIRES_ONBOARDING: 'route.requires_onboarding', REQUIRES_APP_SESSION: 'route.requires_app_session' }),
  SAFETY: Object.freeze({ PAUSED_FOR_SAFETY: 'safety.paused_for_safety', RESTRICTED_ACCOUNT: 'safety.restricted_account' }),
  MODERATION: Object.freeze({ CONTENT_REVIEW: 'moderation.content_review', CONTENT_RESTRICTED: 'moderation.content_restricted' }),
  VALIDATION: Object.freeze({ INVALID_ID: 'validation.invalid_id', INVALID_TIMESTAMP: 'validation.invalid_timestamp', INVALID_PAYLOAD: 'validation.invalid_payload' }),
  PERMISSION: Object.freeze({ NOT_ALLOWED: 'permission.not_allowed', FEATURE_DISABLED: 'permission.feature_disabled' }),
  GLIMPS: Object.freeze({ NOT_FOUND: 'glimps.not_found', INVALID_STATE_TRANSITION: 'glimps.invalid_state_transition' }),
  SPARK: Object.freeze({ NOT_FOUND: 'spark.not_found', INVALID_STATE_TRANSITION: 'spark.invalid_state_transition', INVALID_SELF_SPARK: 'spark.invalid_self_spark', DUPLICATE_ACTIVE_SPARK: 'spark.duplicate_active_spark', INVALID_RECIPIENT_REFERENCE: 'spark.invalid_recipient_reference', INVALID_SOURCE_GLIMPS_REFERENCE: 'spark.invalid_source_glimps_reference' })
})

export const INTERNAL_ID_STRATEGY = Object.freeze({
  DATABASE_ID: 'prisma_cuid',
  API_USER_ID_PREFIX: 'usr_',
  API_PROFILE_ID_PREFIX: 'prf_',
  API_GLIMPS_ID_PREFIX: 'glp_',
  API_SPARK_ID_PREFIX: 'spk_'
})

export const GLIMPS_STATE = Object.freeze({ DRAFT: 'draft', PUBLISHED: 'published', EXPIRED: 'expired', ARCHIVED: 'archived' })
export const GLIMPS_PRIVACY_LEVEL = Object.freeze({ PRIVATE: 'private', CONNECTION_ONLY: 'connection_only', VISIBLE_FOR_MATCHING: 'visible_for_matching' })
export const GLIMPS_EMOTIONAL_TONE = Object.freeze({ SOFT: 'soft', OPEN: 'open', TENDER: 'tender', GROUNDED: 'grounded', UNCERTAIN: 'uncertain' })

export const POLICY_PRECEDENCE = Object.freeze([
  'auth_validity',
  'account_lifecycle',
  'safety_overlay',
  'feature_permissions',
  'route_outcome'
])

const STATUS_VALUES = toSet(API_RESPONSE_STATUS)
const ERROR_KIND_VALUES = toSet(DOMAIN_ERROR_KIND)

export const isApiSuccessEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.SUCCESS && 'data' in value)
export const isApiErrorEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.ERROR && value.error && has(ERROR_KIND_VALUES, value.error.kind) && typeof value.error.reasonCode === 'string')

export const SPARK_STATE = Object.freeze({ POTENTIAL: 'potential', INVITED: 'invited', ACCEPTED: 'accepted', PAUSED: 'paused', DECLINED: 'declined', EXPIRED: 'expired' })
export const SPARK_ACTION = Object.freeze({ CREATE: 'create', ACCEPT: 'accept', PAUSE: 'pause', DECLINE: 'decline', EXPIRE: 'expire', READ: 'read' })
export const SPARK_TERMINAL_STATES = Object.freeze([SPARK_STATE.DECLINED, SPARK_STATE.EXPIRED])
export const SPARK_ACTIVE_STATES = Object.freeze([SPARK_STATE.INVITED, SPARK_STATE.ACCEPTED, SPARK_STATE.PAUSED])
export const SPARK_TRANSITIONS = Object.freeze({
  [SPARK_STATE.POTENTIAL]: Object.freeze([SPARK_STATE.INVITED]),
  [SPARK_STATE.INVITED]: Object.freeze([SPARK_STATE.ACCEPTED, SPARK_STATE.PAUSED, SPARK_STATE.DECLINED, SPARK_STATE.EXPIRED]),
  [SPARK_STATE.PAUSED]: Object.freeze([SPARK_STATE.ACCEPTED, SPARK_STATE.DECLINED]),
  [SPARK_STATE.ACCEPTED]: Object.freeze([SPARK_STATE.PAUSED]),
  [SPARK_STATE.DECLINED]: Object.freeze([]),
  [SPARK_STATE.EXPIRED]: Object.freeze([])
})

