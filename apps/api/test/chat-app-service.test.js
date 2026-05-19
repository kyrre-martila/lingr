import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { REASON_CODES } from '../../../packages/shared/src/contracts.js'
import { acceptChatAppInvite, completeChatAppSession, inviteChatApp } from '../src/services/chat-app-service.js'

const now = new Date('2026-05-19T00:00:00.000Z')

const makeDb = () => {
  const store = new Map()
  return {
    conversationParticipant: { findFirst: async ({ where }) => (where.conversationId === 'c1' && ['u1', 'u2'].includes(where.userId) ? { id: 'cp1' } : null) },
    appSession: {
      create: async ({ data }) => {
        const row = { id: 'a1', ...data, acceptedByUserId: null, completedByUserId: null, dismissedByUserId: null, createdAt: now, updatedAt: now }
        store.set('a1', row)
        return row
      },
      findUnique: async ({ where }) => store.get(where.id) || null,
      update: async ({ where, data }) => {
        const row = { ...store.get(where.id), ...data, updatedAt: now }
        store.set(where.id, row)
        return row
      }
    }
  }
}

test('invite requires auth', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAnonymousViewer(), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH)
})

test('invite enforces canonical app ids', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'anything' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.VALIDATION.INVALID_PAYLOAD)
})

test('conversation ownership is required', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u9' }), payload: { conversationId: 'cnv_c1', appId: 'guess_me' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})

test('invite accept complete lifecycle is conversation scoped', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  assert.equal(invited.lifecycle, 'invite')
  const active = await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(active.lifecycle, 'active')
  const complete = await completeChatAppSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(complete.lifecycle, 'complete')
  assert.equal(complete.conversationId, 'cnv_c1')
})

test('app sessions cannot leak across conversations', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: db })
  await assert.rejects(acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u3' }), appSessionId: invited.appSessionId, dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})
