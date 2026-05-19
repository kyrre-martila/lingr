import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedViewer } from '../src/auth/viewer.js'
import { SPARK_STATE } from '../../../packages/shared/src/contracts.js'
import { acceptSpark } from '../src/services/spark-service.js'
import { sendConversationMessage } from '../src/services/conversation-service.js'

const now = new Date('2026-05-19T00:00:00.000Z')

test('mutual spark acceptance unlocks relationship layer 1', async () => {
  let upsertInput
  const db = {
    spark: { findFirst: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.INVITED }), update: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.ACCEPTED, createdAt: now, updatedAt: now }) },
    relationshipLayer: { upsert: async (input) => { upsertInput = input } }
  }
  await acceptSpark({ viewer: createAuthenticatedViewer({ userId: 'u2' }), sparkId: 'spk_s1', dbClient: db })
  assert.equal(upsertInput.create.currentLayer, 1)
})

test('message progression unlocks layer 2 and creates system message', async () => {
  let relationshipState = { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, lastMessageSenderId: 'u1', layer2UnlockedAt: null, layer3UnlockedAt: null }
  let createdSystemMessage = null
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }), findUnique: async () => ({ id: 'c1', participants: [{ userId: 'u1' }, { userId: 'u2' }] }) },
    message: {
      create: async ({ data }) => {
        if (data.senderUserId === null) createdSystemMessage = data
        return { id: 'm1', conversationId: 'c1', senderUserId: data.senderUserId, type: data.type, visibility: data.visibility, deliveryState: data.deliveryState, content: data.content, metadata: data.metadata, createdAt: now, updatedAt: now }
      }
    },
    relationshipLayer: {
      upsert: async () => relationshipState,
      update: async ({ data }) => { relationshipState = { ...relationshipState, ...data }; return relationshipState }
    }
  }
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'hello' } }, dbClient: db })
  assert.equal(relationshipState.currentLayer, 2)
  assert.equal(createdSystemMessage.type, 'layer_unlock')
  assert.equal(createdSystemMessage.senderUserId, null)
  assert.match((createdSystemMessage.content?.title || '').toLowerCase(), /little more|slowly getting to know|another layer/)
})

test('layers are relationship-owned and not global across pairs', async () => {
  const calls = []
  const db = {
    conversation: { findFirst: async ({ where }) => ({ id: where.id }), findUnique: async ({ where }) => where.id === 'c1' ? ({ id: 'c1', participants: [{ userId: 'u1' }, { userId: 'u2' }] }) : ({ id: 'c2', participants: [{ userId: 'u1' }, { userId: 'u3' }] }) },
    message: { create: async ({ data }) => ({ id: data.conversationId === 'c1' ? 'm1' : 'm2', conversationId: data.conversationId, senderUserId: data.senderUserId, type: data.type, visibility: data.visibility, deliveryState: data.deliveryState, content: data.content, metadata: data.metadata, createdAt: now, updatedAt: now }) },
    relationshipLayer: {
      upsert: async ({ where }) => { calls.push(where.primaryUserId_secondaryUserId); return { id: 'r', currentLayer: 1, reciprocalMessageCount: 0, lastMessageSenderId: null } },
      update: async () => ({})
    }
  }
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'a' } }, dbClient: db })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u1' }), conversationId: 'cnv_c2', payload: { type: 'text', content: { text: 'b' } }, dbClient: db })
  assert.notDeepEqual(calls[0], calls[1])
})
