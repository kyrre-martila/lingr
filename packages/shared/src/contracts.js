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
  AUTH: Object.freeze({ REQUIRES_AUTH: 'auth.requires_auth', SESSION_EXPIRED: 'auth.session_expired', INVALID_SESSION: 'auth.invalid_session', INVALID_CREDENTIALS: 'auth.invalid_credentials' }),
  ROUTE: Object.freeze({ UNKNOWN_ROUTE: 'route.unknown_route', REQUIRES_ONBOARDING: 'route.requires_onboarding', REQUIRES_PROFILE_COMPLETION: 'route.requires_profile_completion', REQUIRES_APP_SESSION: 'route.requires_app_session' }),
  SAFETY: Object.freeze({ PAUSED_FOR_SAFETY: 'safety.paused_for_safety', RESTRICTED_ACCOUNT: 'safety.restricted_account' }),
  MODERATION: Object.freeze({ CONTENT_REVIEW: 'moderation.content_review', CONTENT_RESTRICTED: 'moderation.content_restricted' }),
  VALIDATION: Object.freeze({ INVALID_ID: 'validation.invalid_id', INVALID_TIMESTAMP: 'validation.invalid_timestamp', INVALID_PAYLOAD: 'validation.invalid_payload' }),
  PERMISSION: Object.freeze({ NOT_ALLOWED: 'permission.not_allowed', FEATURE_DISABLED: 'permission.feature_disabled' }),
  GLIMPS: Object.freeze({ NOT_FOUND: 'glimps.not_found', INVALID_STATE_TRANSITION: 'glimps.invalid_state_transition' }),
  SPARK: Object.freeze({ NOT_FOUND: 'spark.not_found', INVALID_STATE_TRANSITION: 'spark.invalid_state_transition', INVALID_SELF_SPARK: 'spark.invalid_self_spark', DUPLICATE_ACTIVE_SPARK: 'spark.duplicate_active_spark', INVALID_RECIPIENT_REFERENCE: 'spark.invalid_recipient_reference', INVALID_SOURCE_GLIMPS_REFERENCE: 'spark.invalid_source_glimps_reference' }),
  CONVERSATION: Object.freeze({ NOT_FOUND: 'conversation.not_found', INVALID_SPARK_REFERENCE: 'conversation.invalid_spark_reference' }),
  MESSAGE: Object.freeze({ INVALID_TYPE: 'message.invalid_type', INVALID_PAYLOAD_BY_TYPE: 'message.invalid_payload_by_type' }),
  DISCOVERY: Object.freeze({ DAILY_LIMIT_REACHED: 'discovery.daily_limit_reached', NO_AVAILABLE_PEOPLE: 'discovery.no_available_people', UNAVAILABLE_REGION: 'discovery.unavailable_region', ONBOARDING_REQUIRED: 'discovery.onboarding_required', PROFILE_INCOMPLETE: 'discovery.profile_incomplete' })
})

export const INTERNAL_ID_STRATEGY = Object.freeze({
  DATABASE_ID: 'prisma_cuid',
  API_USER_ID_PREFIX: 'usr_',
  API_PROFILE_ID_PREFIX: 'prf_',
  API_GLIMPS_ID_PREFIX: 'glp_',
  API_SPARK_ID_PREFIX: 'spk_',
  API_CONVERSATION_ID_PREFIX: 'cnv_',
  API_MESSAGE_ID_PREFIX: 'msg_',
  API_APP_SESSION_ID_PREFIX: 'aps_'
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



export const DISCOVERY_LIMIT_PER_DAY = 3
export const DISCOVERY_STATE = Object.freeze({
  READY: 'ready',
  LIMIT_REACHED: 'limit_reached',
  EMPTY: 'empty',
  UNAVAILABLE: 'unavailable'
})

export const DISCOVERY_REASON_CODES = Object.freeze({
  DAILY_LIMIT_REACHED: 'discovery.daily_limit_reached',
  NO_AVAILABLE_PEOPLE: 'discovery.no_available_people',
  UNAVAILABLE_REGION: 'discovery.unavailable_region',
  ONBOARDING_REQUIRED: 'discovery.onboarding_required',
  PROFILE_INCOMPLETE: 'discovery.profile_incomplete'
})

export const REGION_LAUNCH_STATUS = Object.freeze({ CLOSED: 'closed', WAITLIST: 'waitlist', OPEN: 'open', PAUSED: 'paused' })
export const REGION_REASON_CODES = Object.freeze({ CLOSED: 'region.closed', WAITLIST: 'region.waitlist', OPEN: 'region.open', INVALID: 'region.invalid' })

const DISCOVERY_STATE_VALUES = toSet(DISCOVERY_STATE)
export const isSupportedDiscoveryState = (value) => has(DISCOVERY_STATE_VALUES, value)
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


export const CONVERSATION_STATE = Object.freeze({ ACTIVE: 'active', PAUSED: 'paused', CLOSED: 'closed' })
export const CONVERSATION_PARTICIPANT_ROLE = Object.freeze({ MEMBER: 'member', SYSTEM: 'system' })

export const MESSAGE_TYPE = Object.freeze({
  TEXT: 'text',
  SYSTEM: 'system',
  LAYER_UNLOCK: 'layer_unlock',
  PLAYING_NOW: 'playing_now',
  APP_INVITE: 'app_invite'
})

export const MESSAGE_VISIBILITY = Object.freeze({ CONVERSATION: 'conversation', SOFT_BANNER: 'soft_banner' })
export const MESSAGE_DELIVERY_STATE = Object.freeze({ QUEUED: 'queued', SENT: 'sent', FAILED: 'failed' })

export const PLAYING_NOW_MEDIA_TYPE = Object.freeze({ SONG: 'song', MOVIE: 'movie', TV_SERIES: 'tv_series' })

export const APP_ID = Object.freeze({ MATCH_CARDS: 'match_cards', GUESS_ME: 'guess_me', SNUGGLE: 'snuggle', PLAYING_NOW: 'playing_now' })
export const APP_INVITE_APP_ID = Object.freeze({ MATCH_CARDS: APP_ID.MATCH_CARDS, GUESS_ME: APP_ID.GUESS_ME, SNUGGLE: APP_ID.SNUGGLE })
export const APP_LIFECYCLE_STATE = Object.freeze({ INVITE: 'invite', ACCEPT: 'accept', ACTIVE: 'active', COMPLETE: 'complete', DISMISSED: 'dismissed' })
export const LAYER_LEVEL = Object.freeze({ DISCOVERY: 0, MUTUAL_SPARK: 1, MEANINGFUL_CONVERSATION: 2, DEEPER_TRUST: 3 })

export const MESSAGE_PAYLOAD_KIND = Object.freeze({
  TEXT: 'text_payload',
  SYSTEM: 'system_payload',
  LAYER_UNLOCK: 'layer_unlock_payload',
  PLAYING_NOW: 'playing_now_payload',
  APP_INVITE: 'app_invite_payload'
})

export const PLAYING_NOW_DTO_SHAPE = Object.freeze({
  mediaType: 'song | movie | tv_series',
  title: 'string',
  creator: 'string? (artist, band, director, creator)',
  posterUrl: 'string? (cover/poster placeholder URL)',
  context: 'string? (short optional note)'
})

export const LAYER_UNLOCK_DTO_SHAPE = Object.freeze({
  title: 'string',
  subtitle: 'string? (soft encouragement text)',
  ctaLabel: 'string? (optional banner CTA)',
  ctaRoute: 'string? (optional in-app route)'
})

export const MESSAGE_DTO_FIELDS = Object.freeze({
  messageId: 'msg_* string',
  conversationId: 'cnv_* string',
  senderUserId: 'usr_* string | null for system',
  type: 'text | system | layer_unlock | playing_now | app_invite',
  visibility: 'conversation | soft_banner',
  deliveryState: 'queued | sent | failed',
  content: 'canonical payload object based on message type',
  metadata: 'object? (optional client-safe metadata)',
  createdAt: 'ISO-8601 string',
  updatedAt: 'ISO-8601 string'
})

export const CONVERSATION_DTO_FIELDS = Object.freeze({
  conversationId: 'cnv_* string',
  sparkId: 'spk_* string',
  state: 'active | paused | closed',
  participantIds: 'usr_* string[]',
  createdAt: 'ISO-8601 string',
  updatedAt: 'ISO-8601 string'
})

export const CONVERSATION_PARTICIPANT_DTO_FIELDS = Object.freeze({
  conversationId: 'cnv_* string',
  userId: 'usr_* string',
  role: 'member | system',
  joinedAt: 'ISO-8601 string'
})

export const CLIENT_SAFE_MESSAGE_METADATA = Object.freeze({
  source: 'string? (system origin hint)',
  correlationId: 'string? (optional client tracing)',
  locale: 'string?'
})

const MESSAGE_TYPE_VALUES = toSet(MESSAGE_TYPE)
const MESSAGE_VISIBILITY_VALUES = toSet(MESSAGE_VISIBILITY)
const MESSAGE_DELIVERY_STATE_VALUES = toSet(MESSAGE_DELIVERY_STATE)
const PLAYING_NOW_MEDIA_TYPE_VALUES = toSet(PLAYING_NOW_MEDIA_TYPE)

export const isSupportedMessageType = (value) => has(MESSAGE_TYPE_VALUES, value)
export const isSupportedMessageVisibility = (value) => has(MESSAGE_VISIBILITY_VALUES, value)
export const isSupportedMessageDeliveryState = (value) => has(MESSAGE_DELIVERY_STATE_VALUES, value)
export const isSupportedPlayingNowMediaType = (value) => has(PLAYING_NOW_MEDIA_TYPE_VALUES, value)
