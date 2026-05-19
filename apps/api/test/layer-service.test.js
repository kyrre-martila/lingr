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

test('low-effort ping-pong does not advance reciprocal progression', async () => {
  let relationshipState = { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null }
  const db = {
    conversation: { findFirst: async () => ({ id: 'c1' }), findUnique: async () => ({ id: 'c1', participants: [{ userId: 'u1' }, { userId: 'u2' }] }) },
    message: { create: async ({ data }) => ({ id: 'm1', ...data, createdAt: now, updatedAt: now }) },
    relationshipLayer: { upsert: async () => relationshipState, update: async ({ data }) => { relationshipState = { ...relationshipState, ...data }; return relationshipState } }
  }
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'ok' } }, dbClient: db })
  assert.equal(relationshipState.currentLayer, 1)
  assert.equal(relationshipState.reciprocalMessageCount, 5)
})

test('reciprocal quality + pacing unlocks layer 2', async () => {
  let relationshipState = { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null }
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
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(relationshipState.currentLayer, 2)
  assert.equal(createdSystemMessage.type, 'layer_unlock')
})
