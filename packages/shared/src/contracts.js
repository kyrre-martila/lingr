const toSet = (obj) => new Set(Object.values(obj))
const has = (set, value) => set.has(value)

export const API_RESPONSE_STATUS = Object.freeze({ SUCCESS: 'success', ERROR: 'error' })
export const DOMAIN_ERROR_KIND = Object.freeze({ VALIDATION: 'validation', AUTH: 'auth', PERMISSION: 'permission', ROUTE: 'route', SAFETY: 'safety', MODERATION: 'moderation', DOMAIN: 'domain' })

export const AUTH_SESSION_STATE = Object.freeze({ ANONYMOUS: 'anonymous', AUTHENTICATED: 'authenticated', EXPIRED: 'expired' })
export const ACCOUNT_LIFECYCLE_STATE = Object.freeze({ ONBOARDING: 'onboarding', ACTIVE: 'active', PAUSED: 'paused', DELETED: 'deleted', RESTRICTED: 'restricted' })
export const ROUTE_OUTCOME = Object.freeze({ ALLOW: 'allow', SOFT_BLOCK: 'soft_block', HARD_BLOCK: 'hard_block' })

export const REASON_CODES = Object.freeze({
  AUTH: Object.freeze({ REQUIRES_AUTH: 'auth.requires_auth', SESSION_EXPIRED: 'auth.session_expired', INVALID_SESSION: 'auth.invalid_session' }),
  ROUTE: Object.freeze({ UNKNOWN_ROUTE: 'route.unknown_route', REQUIRES_ONBOARDING: 'route.requires_onboarding', REQUIRES_APP_SESSION: 'route.requires_app_session' }),
  SAFETY: Object.freeze({ PAUSED_FOR_SAFETY: 'safety.paused_for_safety', RESTRICTED_ACCOUNT: 'safety.restricted_account' }),
  MODERATION: Object.freeze({ CONTENT_REVIEW: 'moderation.content_review', CONTENT_RESTRICTED: 'moderation.content_restricted' }),
  VALIDATION: Object.freeze({ INVALID_ID: 'validation.invalid_id', INVALID_TIMESTAMP: 'validation.invalid_timestamp', INVALID_PAYLOAD: 'validation.invalid_payload' }),
  PERMISSION: Object.freeze({ NOT_ALLOWED: 'permission.not_allowed', FEATURE_DISABLED: 'permission.feature_disabled' })
})

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
