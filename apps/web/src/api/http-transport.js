import { DOMAIN_ERROR_KIND, REASON_CODES } from '../domain/contracts.js'
import { createFailure } from './envelope.js'

const DEFAULT_BASE_URL = 'http://localhost:3000'

const normalizeBaseUrl = (value) => String(value || DEFAULT_BASE_URL).replace(/\/$/, '')

const operationMap = Object.freeze({
  'auth.register': { method: 'POST', path: '/v1/auth/register', body: ({ email, password, countryCode, regionSlug }) => ({ email, password, countryCode, regionSlug }) },
  'auth.login': { method: 'POST', path: '/v1/auth/login', body: ({ email, password }) => ({ email, password }) },
  'auth.logout': { method: 'POST', path: '/v1/auth/logout' },
  'profile.get': { method: 'GET', path: '/v1/profile/viewer' },
  'profile.completeness': { method: 'GET', path: '/v1/profile/completeness' },
  'discovery.get': { method: 'GET', path: '/v1/discovery/daily' },
  'discovery.not_now': { method: 'POST', path: '/v1/discovery/not-now', body: ({ discoveredUserId }) => ({ discoveredUserId }) },
  'discovery.spark': { method: 'POST', path: '/v1/discovery/spark', body: ({ discoveredUserId }) => ({ discoveredUserId }) },
  'feedback.emotional': { method: 'POST', path: '/v1/feedback/emotional', body: ({ tag, note }) => ({ tag, ...(note ? { note } : {}) }) },
  'spark.create': { method: 'POST', path: '/v1/sparks', body: ({ recipientUserId, sourceGlimpsId, softResonanceContext }) => ({ recipientUserId, ...(sourceGlimpsId ? { sourceGlimpsId } : {}), ...(softResonanceContext ? { softResonanceContext } : {}) }) },
  'conversations.viewer.list': { method: 'GET', path: '/v1/conversations/viewer' },
  'conversations.messages.list': { method: 'GET', path: ({ conversationId }) => `/v1/conversations/${encodeURIComponent(conversationId)}/messages` },
  'conversations.messages.send': { method: 'POST', path: ({ conversationId }) => `/v1/conversations/${encodeURIComponent(conversationId)}/messages`, body: ({ text, ...rest }) => ({
    ...(rest.type ? { type: rest.type } : { type: 'text' }),
    ...(rest.content ? { content: rest.content } : { content: { text } }),
    ...(rest.metadata ? { metadata: rest.metadata } : {})
  }) }
})

const createUnknownRouteFailure = (operation) => createFailure({
  code: REASON_CODES.ROUTE.UNKNOWN_ROUTE,
  message: `Unknown operation: ${operation}`,
  kind: DOMAIN_ERROR_KIND.ROUTE,
  retryable: false
})

export const createHttpTransport = ({ baseUrl = DEFAULT_BASE_URL, fetchImpl = globalThis.fetch } = {}) => ({
  requestSync: ({ operation }) => createUnknownRouteFailure(operation),
  request: async ({ operation, payload }) => {
    const route = operationMap[operation]
    if (!route) return createUnknownRouteFailure(operation)
    if (typeof fetchImpl !== 'function') {
      return createFailure({ code: 'transport.http_unavailable', message: 'Fetch is unavailable in this runtime.', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true })
    }

    const path = typeof route.path === 'function' ? route.path(payload || {}) : route.path
    const url = `${normalizeBaseUrl(baseUrl)}${path}`
    const body = route.body ? JSON.stringify(route.body(payload || {})) : null

    try {
      const response = await fetchImpl(url, { method: route.method, credentials: 'include', headers: { 'content-type': 'application/json' }, ...(body ? { body } : {}) })
      const envelope = await response.json()
      if (!envelope || (envelope.status !== 'success' && envelope.status !== 'error')) {
        return createFailure({ code: 'transport.http_invalid_envelope', message: 'Invalid envelope from API.', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true })
      }
      return { ok: envelope.status === 'success', ...envelope }
    } catch (error) {
      return createFailure({ code: 'transport.http_unreachable', message: error instanceof Error ? error.message : 'HTTP transport failed', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true })
    }
  }
})
