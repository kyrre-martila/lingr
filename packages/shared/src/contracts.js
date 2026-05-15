const toSet = (obj) => new Set(Object.values(obj))
const has = (set, value) => set.has(value)

export const API_RESPONSE_STATUS = Object.freeze({ SUCCESS: 'success', ERROR: 'error' })
export const DOMAIN_ERROR_KIND = Object.freeze({ VALIDATION: 'validation', AUTH: 'auth', PERMISSION: 'permission', ROUTE: 'route', SAFETY: 'safety', MODERATION: 'moderation', DOMAIN: 'domain' })

const STATUS_VALUES = toSet(API_RESPONSE_STATUS)
const ERROR_KIND_VALUES = toSet(DOMAIN_ERROR_KIND)

export const isApiSuccessEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.SUCCESS && 'data' in value)
export const isApiErrorEnvelope = (value) => Boolean(value && has(STATUS_VALUES, value.status) && value.status === API_RESPONSE_STATUS.ERROR && value.error && has(ERROR_KIND_VALUES, value.error.kind) && typeof value.error.reasonCode === 'string')
