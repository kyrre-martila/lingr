import { createConversationsMockData, conversationStarters } from '../data/mocks/conversations.js'
import { createDiscoveryMockData } from '../data/mocks/discovery.js'
import { createProfileMockData } from '../data/mocks/profile.js'
import { createGlimpsInitialState } from '../data/mocks/glimps.js'
import { createFailure, createSuccess } from './envelope.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../domain/contracts.js'

const snapshot = {
  profile: createProfileMockData(),
  discovery: createDiscoveryMockData(),
  conversations: createConversationsMockData(),
  glimps: createGlimpsInitialState(),
  spark: { invites: [] },
  window: { state: 'open' },
  compatibility: { snapshots: [] },
  safety: { level: 'none', scope: [] }
}

let glimpsCounter = 0
const viewerGlimps = []

const createMockGlimps = (payload = {}) => {
  glimpsCounter += 1
  const now = new Date().toISOString()
  return {
    glimpsId: `glp_mock_${glimpsCounter}`,
    userId: 'usr_mock_viewer',
    reflection: String(payload.reflection || '').trim(),
    mood: String(payload.mood || '').trim(),
    prompt: String(payload.prompt || '').trim(),
    imageNote: String(payload.imageNote || '').trim(),
    privacy: String(payload.privacy || 'private').trim(),
    emotionalTone: String(payload.emotionalTone || 'soft').trim(),
    state: 'published',
    createdAt: now,
    updatedAt: now,
    archivedAt: null
  }
}

const glimpsCreateHandler = ({ payload }) => {
  const reflection = String(payload?.reflection || '').trim()
  const mood = String(payload?.mood || '').trim()

  if (!reflection || !mood) {
    return createFailure({
      code: REASON_CODES.VALIDATION.INVALID_PAYLOAD,
      message: 'Reflection and mood are required.',
      kind: DOMAIN_ERROR_KIND.VALIDATION,
      retryable: false
    })
  }

  const created = createMockGlimps(payload)
  viewerGlimps.unshift(created)
  return createSuccess(created)
}

const handlers = {
  'profile.get': () => createSuccess(snapshot.profile),
  'discovery.get': () => createSuccess(snapshot.discovery),
  'conversations.list': () => createSuccess(snapshot.conversations),
  'conversations.starters': () => createSuccess(conversationStarters),
  'glimps.draft': () => createSuccess(snapshot.glimps),
  'glimps.create': (input) => glimpsCreateHandler(input),
  'glimps.viewer.list': () => createSuccess([...viewerGlimps]),
  'spark.list': () => createSuccess(snapshot.spark),
  'window.get': () => createSuccess(snapshot.window),
  'compatibility.get': () => createSuccess(snapshot.compatibility),
  'safety.get': () => createSuccess(snapshot.safety)
}

export const createMockTransport = () => ({
  requestSync: ({ operation }) => {
    const handler = handlers[operation]
    if (!handler) {
      return createFailure({
        code: REASON_CODES.ROUTE.UNKNOWN_ROUTE,
        message: `Unknown operation: ${operation}`,
        kind: DOMAIN_ERROR_KIND.ROUTE,
        retryable: false
      })
    }
    return handler()
  },
  request: async ({ operation }) => {
    const handler = handlers[operation]
    if (!handler) {
      return createFailure({
        code: REASON_CODES.ROUTE.UNKNOWN_ROUTE,
        message: `Unknown operation: ${operation}`,
        kind: DOMAIN_ERROR_KIND.ROUTE,
        retryable: false
      })
    }

    try {
      return handler()
    } catch (error) {
      return createFailure({
        code: 'transport.mock_failure',
        message: error instanceof Error ? error.message : 'Mock transport failed',
        kind: DOMAIN_ERROR_KIND.DOMAIN,
        retryable: true
      })
    }
  }
})
