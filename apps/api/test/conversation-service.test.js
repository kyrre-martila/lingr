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

test('send validates app_invite appId enum', async () => {
  const db = { conversation: { findFirst: async () => ({ id: 'c1' }) } }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'app_invite', content: { appId: 'any-string' } }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE)
})

test('send rejects system-originated message types for viewer sends', async () => {
  const db = { conversation: { findFirst: async () => ({ id: 'c1' }) } }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'system', content: { text: 'hi' } }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.PERMISSION.NOT_ALLOWED)
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

test('block prevents message sending', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    conversationParticipant: { findMany: async () => [{ userId: 'u1' }, { userId: 'u2' }] },
    blockRelation: { findFirst: async () => ({ id: 'b1' }) }
  }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'hi' } }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SAFETY.INTERACTION_RESTRICTED)
})

test('paused conversation still allows message history retrieval', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    message: { findMany: async () => [] }
  }
  const out = await listConversationMessages({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', dbClient: db })
  assert.equal(Array.isArray(out.items), true)
})

test('pause prevents message sending', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    conversationSafetyState: { findUnique: async () => ({ isPaused: true }) }
  }
  await assert.rejects(sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'hi' } }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SAFETY.CONVERSATION_PAUSED)
})

test('list messages returns pagination-ready structure', async () => {
  let query
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    message: { findMany: async (args) => { query = args; return [{ id: 'm2', conversationId: 'c1', senderUserId: 'u1', type: 'text', visibility: 'conversation', deliveryState: 'sent', content: { text: 'hey' }, metadata: null, createdAt: now, updatedAt: now }] } }
  }
  const result = await listConversationMessages({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', dbClient: db })
  assert.equal(Array.isArray(result.items), true)
  assert.equal(result.page.limit, 30)
  assert.deepEqual(query.orderBy, { createdAt: 'asc' })
})

test('list messages rejects cursor from another conversation', async () => {
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }) },
    message: { findFirst: async () => null }
  }
  await assert.rejects(listConversationMessages({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', cursor: 'msg_other', dbClient: db }), (e) => e.reasonCode === REASON_CODES.VALIDATION.INVALID_ID)
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

test('create conversation maps unique conflict to existing conversation deterministically', async () => {
  const db = {
    spark: { findFirst: async () => ({ id: 's1', status: SPARK_STATE.ACCEPTED, initiatorUserId: 'u1', recipientUserId: 'u2' }) },
    conversation: {
      findUnique: async ({ where }) => where.sparkId === 's1' ? ({ id: 'c1', sparkId: 's1', state: 'active', participants: [{ userId: 'u1' }, { userId: 'u2' }], createdAt: now, updatedAt: now }) : null,
      create: async () => { const err = new Error('duplicate'); err.code = 'P2002'; throw err }
    }
  }
  const result = await createConversationFromSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { sparkId: 'spk_s1' }, dbClient: db })
  assert.equal(result.conversationId, 'cnv_c1')
})
