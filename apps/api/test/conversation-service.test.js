import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { createConversationFromSpark, listConversationMessages, sendConversationMessage } from '../src/services/conversation-service.js'
import { REASON_CODES, SPARK_STATE } from '../../../packages/shared/src/contracts.js'

const now = new Date('2026-05-15T00:00:00.000Z')

test('anonymous cannot create conversation', async () => {
  await assert.rejects(createConversationFromSpark({ viewer: createAnonymousViewer(), payload: { sparkId: 'spk_s1' } }), (e) => e.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH)
})

test('conversation requires valid spark relationship for actor', async () => {
  const db = { spark: { findFirst: async () => null } }
  await assert.rejects(createConversationFromSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { sparkId: 'spk_missing' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.INVALID_SPARK_REFERENCE)
})

test('send rejects invalid message type with canonical reason', async () => {
  const db = { conversation: { findFirst: async () => ({ id: 'c1' }) } }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'unknown', content: {} }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.MESSAGE.INVALID_TYPE)
})

test('send validates playing_now payload', async () => {
  const db = { conversation: { findFirst: async () => ({ id: 'c1' }) } }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'playing_now', content: { mediaType: 'podcast', title: 'x' } }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE)
})

test('send persists participant message as dto', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    message: { create: async ({ data }) => ({ id: 'm1', conversationId: data.conversationId, senderUserId: data.senderUserId, type: data.type, visibility: data.visibility, deliveryState: data.deliveryState, content: data.content, metadata: data.metadata, createdAt: now, updatedAt: now }) }
  }
  const result = await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'playing_now', content: { mediaType: 'song', title: 'Blue' } }, dbClient: db })
  assert.equal(result.messageId, 'msg_m1')
  assert.equal(result.type, 'playing_now')
})

test('list messages returns pagination-ready structure', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    message: { findMany: async () => ([{ id: 'm2', conversationId: 'c1', senderUserId: 'u1', type: 'text', visibility: 'conversation', deliveryState: 'sent', content: { text: 'hey' }, metadata: null, createdAt: now, updatedAt: now }]) }
  }
  const result = await listConversationMessages({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', dbClient: db })
  assert.equal(Array.isArray(result.items), true)
  assert.equal(result.page.limit, 30)
})

test('create conversation maps accepted spark participants', async () => {
  const db = {
    spark: { findFirst: async () => ({ id: 's1', status: SPARK_STATE.ACCEPTED, initiatorUserId: 'u1', recipientUserId: 'u2' }) },
    conversation: {
      findUnique: async () => null,
      create: async () => ({ id: 'c1', sparkId: 's1', state: 'active', participants: [{ userId: 'u1' }, { userId: 'u2' }], createdAt: now, updatedAt: now })
    }
  }
  const result = await createConversationFromSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { sparkId: 'spk_s1' }, dbClient: db })
  assert.equal(result.conversationId, 'cnv_c1')
  assert.equal(result.participantIds.length, 2)
})
