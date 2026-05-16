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
let messageCounter = 1000
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

const toConversationDto = (conversation) => ({
  conversationId: `cnv_${conversation.id}`,
  sparkId: 'spk_mock_1',
  state: conversation.paused ? 'paused' : 'active',
  participantIds: ['usr_mock_viewer', `usr_mock_${conversation.id}`],
  profile: { name: conversation.name, mood: conversation.mood, preview: conversation.preview }
})

const toMessageDto = (conversation, message) => ({
  messageId: `msg_${message.id}`,
  conversationId: `cnv_${conversation.id}`,
  senderUserId: message.sender === 'me' ? 'usr_mock_viewer' : `usr_mock_${conversation.id}`,
  type: 'text',
  visibility: 'conversation',
  deliveryState: 'sent',
  content: { text: message.text },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const findConversationByDtoId = (conversationId) => snapshot.conversations.find((item) => `cnv_${item.id}` === conversationId)

const conversationViewerListHandler = () => createSuccess(snapshot.conversations.map(toConversationDto))

const conversationMessagesListHandler = ({ payload }) => {
  const conversation = findConversationByDtoId(String(payload?.conversationId || ''))
  if (!conversation) {
    return createFailure({ code: REASON_CODES.CONVERSATION.NOT_FOUND, message: 'Conversation not found.', kind: DOMAIN_ERROR_KIND.PERMISSION, retryable: false })
  }

  if (conversation.id === 'c3') {
    return createFailure({ code: REASON_CODES.PERMISSION.NOT_ALLOWED, message: 'Conversation is temporarily unavailable.', kind: DOMAIN_ERROR_KIND.PERMISSION, retryable: false })
  }

  return createSuccess({ items: conversation.messages.map((message) => toMessageDto(conversation, message)), page: { nextCursor: null } })
}

const conversationSendMessageHandler = ({ payload }) => {
  const conversation = findConversationByDtoId(String(payload?.conversationId || ''))
  if (!conversation) {
    return createFailure({ code: REASON_CODES.CONVERSATION.NOT_FOUND, message: 'Conversation not found.', kind: DOMAIN_ERROR_KIND.PERMISSION, retryable: false })
  }

  if (conversation.paused) {
    return createFailure({ code: REASON_CODES.PERMISSION.NOT_ALLOWED, message: 'Conversation is paused.', kind: DOMAIN_ERROR_KIND.PERMISSION, retryable: false })
  }

  const text = String(payload?.text || '').trim()
  if (!text) {
    return createFailure({ code: REASON_CODES.VALIDATION.INVALID_PAYLOAD, message: 'Message text is required.', kind: DOMAIN_ERROR_KIND.VALIDATION, retryable: false, fieldErrors: [{ field: 'text', reason: 'required' }] })
  }

  if (text.toLowerCase().includes('[retryable-error]')) {
    return createFailure({ code: 'transport.mock_retryable', message: 'Temporary send issue.', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true })
  }

  messageCounter += 1
  const created = { id: `m${messageCounter}`, sender: 'me', text, time: 'now' }
  conversation.messages.push(created)
  conversation.preview = text
  return createSuccess(toMessageDto(conversation, created))
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
  'conversations.viewer.list': () => conversationViewerListHandler(),
  'conversations.messages.list': (input) => conversationMessagesListHandler(input),
  'conversations.messages.send': (input) => conversationSendMessageHandler(input),
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
  request: async ({ operation, payload }) => {
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
      return handler({ payload })
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
