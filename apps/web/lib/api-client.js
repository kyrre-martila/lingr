import { API_RESPONSE_STATUS, REASON_CODES } from '@lingr/shared/contracts'

const DEFAULT_LOCAL_API_BASE = 'http://localhost:4000'

const normalizeBaseUrl = (value) => String(value || DEFAULT_LOCAL_API_BASE).trim().replace(/\/$/, '')

export const resolveApiBaseUrl = () => normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE)

const isSuccessEnvelope = (payload) => payload && payload.status === API_RESPONSE_STATUS.SUCCESS && 'data' in payload
const isErrorEnvelope = (payload) => payload && payload.status === API_RESPONSE_STATUS.ERROR && payload.error && typeof payload.error.reasonCode === 'string'

export class ApiError extends Error {
  constructor(message, { status, reasonCode, kind, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? 0
    this.reasonCode = reasonCode || REASON_CODES.DOMAIN.UNKNOWN_ERROR
    this.kind = kind || null
    this.details = details ?? null
  }
}

const createRequestInit = ({ method = 'GET', body, headers }) => {
  const hasBody = body !== undefined
  return {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(hasBody ? { 'content-type': 'application/json' } : {}),
      ...(headers || {})
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {})
  }
}

export async function apiRequest(path, options = {}) {
  const baseUrl = resolveApiBaseUrl()
  const response = await fetch(`${baseUrl}${path}`, createRequestInit(options))

  const payload = await response.json().catch(() => null)

  if (isSuccessEnvelope(payload)) return payload.data

  if (isErrorEnvelope(payload)) {
    throw new ApiError(`Request failed: ${path}`, {
      status: response.status,
      reasonCode: payload.error.reasonCode,
      kind: payload.error.kind,
      details: payload.error
    })
  }

  if (!response.ok) {
    throw new ApiError(`Request failed: ${path}`, {
      status: response.status,
      reasonCode: REASON_CODES.DOMAIN.UNKNOWN_ERROR,
      details: payload
    })
  }

  throw new ApiError(`Invalid API response envelope: ${path}`, {
    status: response.status,
    reasonCode: 'transport.http_invalid_envelope',
    details: payload
  })
}

export const apiClient = Object.freeze({
  register: ({ email, password, countryCode, regionSlug }) => apiRequest('/v1/auth/register', { method: 'POST', body: { email, password, countryCode, regionSlug } }),
  login: ({ email, password }) => apiRequest('/v1/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiRequest('/v1/auth/logout', { method: 'POST' }),
  getProfile: () => apiRequest('/v1/profile/viewer'),
  updateProfile: (payload) => apiRequest('/v1/profile/viewer', { method: 'PATCH', body: payload }),
  getProfileCompleteness: () => apiRequest('/v1/profile/completeness'),
  listCountries: () => apiRequest('/v1/regions/countries'),
  listRegionsByCountry: ({ countryCode, locale } = {}) => {
    const params = new URLSearchParams()
    if (locale) params.set('locale', String(locale))
    const query = params.toString()
    return apiRequest(`/v1/regions/${encodeURIComponent(countryCode || '')}${query ? `?${query}` : ''}`)
  },
  checkRegionAvailability: ({ countryCode, regionSlug }) => {
    const params = new URLSearchParams()
    if (countryCode) params.set('countryCode', String(countryCode))
    if (regionSlug) params.set('regionSlug', String(regionSlug))
    const query = params.toString()
    return apiRequest(`/v1/regions/check${query ? `?${query}` : ''}`)
  },
  getDiscoveryDaily: () => apiRequest('/v1/discovery/daily'),
  sendDiscoverySpark: ({ discoveredUserId }) => apiRequest('/v1/discovery/spark', { method: 'POST', body: { discoveredUserId } }),
  sendDiscoveryNotNow: ({ discoveredUserId }) => apiRequest('/v1/discovery/not-now', { method: 'POST', body: { discoveredUserId } }),
  listViewerConversations: () => apiRequest('/v1/conversations/viewer'),
  getConversationById: ({ conversationId }) => apiRequest(`/v1/conversations/${encodeURIComponent(conversationId)}`),
  listConversationMessages: ({ conversationId, cursor, limit } = {}) => {
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', String(cursor))
    if (limit) params.set('limit', String(limit))
    const query = params.toString()
    return apiRequest(`/v1/conversations/${encodeURIComponent(conversationId)}/messages${query ? `?${query}` : ''}`)
  }
})

export const createApiClient = ({ enableMock = false, mockClient } = {}) => {
  if (enableMock && mockClient) return mockClient
  return apiClient
}
