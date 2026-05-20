import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedViewer } from '../src/auth/viewer.js'
import { SPARK_STATE, TRUST_SIGNAL_TYPE } from '../../../packages/shared/src/contracts.js'
import { acceptSpark } from '../src/services/spark-service.js'
import { sendConversationMessage } from '../src/services/conversation-service.js'
import { syncLayerAfterTrustSignal } from '../src/services/layer-service.js'

const now = new Date('2026-05-19T00:00:00.000Z')

const makeDbForLayerSync = ({ relationshipState, trustSignalRule, layerRules, existingUnlockMessage = null }) => {
  const state = { ...relationshipState }
  let createdSystemMessage = null
  const db = {
    $transaction: async (cb) => cb(db),
    conversation: { findFirst: async () => ({ id: 'c1' }), findUnique: async () => ({ id: 'c1', participants: [{ userId: 'u1' }, { userId: 'u2' }] }) },
    trustSignalRule: { findUnique: async ({ where }) => (where.signalType === TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN ? trustSignalRule : null) },
    layerRule: { findMany: async () => layerRules },
    relationshipLayer: {
      upsert: async () => state,
      update: async ({ data }) => {
        if (data.trustScore?.increment) state.trustScore += data.trustScore.increment
        Object.entries(data).forEach(([key, value]) => { if (key !== 'trustScore') state[key] = value })
        return state
      },
      updateMany: async ({ where, data }) => {
        if (where.currentLayer !== undefined && state.currentLayer !== where.currentLayer) return { count: 0 }
        Object.assign(state, data)
        return { count: 1 }
      }
    },
    message: {
      findFirst: async () => existingUnlockMessage,
      create: async ({ data }) => { if (data.senderUserId === null) createdSystemMessage = data; return { id: 'm1', ...data, createdAt: now, updatedAt: now } }
    }
  }

  return { db, state, getCreatedSystemMessage: () => createdSystemMessage }
}

test('mutual spark acceptance unlocks relationship layer 1', async () => {
  let upsertInput
  const db = {
    spark: { findFirst: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.INVITED }), update: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.ACCEPTED, createdAt: now, updatedAt: now }) },
    relationshipLayer: { upsert: async (input) => { upsertInput = input } }
  }
  await acceptSpark({ viewer: createAuthenticatedViewer({ userId: 'u2' }), sparkId: 'spk_s1', dbClient: db })
  assert.equal(upsertInput.create.currentLayer, 1)
})

test('reciprocal quality turns add trust score from trust signal rule', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 3, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })

  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.trustScore, 13)
  assert.equal(state.reciprocalMessageCount, 6)
})

test('invalid turns do not add trust score', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u2', lastCountedMessageAt: new Date(Date.now() - 30_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 3, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })

  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'ok' } }, dbClient: db })
  assert.equal(state.trustScore, 10)
  assert.equal(state.reciprocalMessageCount, 5)
})

test('layer 2 unlocks only when score and time are both satisfied', async () => {
  const { db, state, getCreatedSystemMessage } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 18, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })

  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 2)
  assert.equal(getCreatedSystemMessage()?.type, 'layer_unlock')
})

test('layer 3 unlocks only when score and time are both satisfied', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 2, reciprocalMessageCount: 30, trustScore: 54, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), layer2UnlockedAt: new Date(Date.now() - 17 * 60 * 60 * 1000), layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    layerRules: [{ fromLayer: 2, toLayer: 3, minElapsedMinutes: 960, requiredTrustScore: 55, enabled: true }]
  })

  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 3)
})

test('insufficient score prevents unlock even when time satisfied', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 1, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 1)
})

test('insufficient elapsed time prevents unlock even when score satisfied', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 19, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 1)
})

test('db config changes affect unlock behavior', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 12, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 3, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 60, requiredTrustScore: 15, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 2)
})

test('transaction safety prevents duplicate unlock messages when one already exists', async () => {
  const { db, state, getCreatedSystemMessage } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 18, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 60_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }],
    existingUnlockMessage: { id: 'm_existing' }
  })

  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 2)
  assert.equal(getCreatedSystemMessage(), null)
})


test('layer 3 timing is anchored to layer2UnlockedAt', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 2, reciprocalMessageCount: 30, trustScore: 54, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 90_000), layer1UnlockedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), layer2UnlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    layerRules: [{ fromLayer: 2, toLayer: 3, minElapsedMinutes: 960, requiredTrustScore: 55, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 2)
})

test('message turn pacing requires at least 60 seconds', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 45_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 3, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.trustScore, 10)
})


test('invalid trust signal config (negative points) is safely ignored', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 90_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: -3, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.trustScore, 10)
})

test('invalid layer rule config is ignored', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 25, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 90_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 0, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 3, minElapsedMinutes: -1, requiredTrustScore: -5, enabled: true }]
  })
  await sendConversationMessage({ viewer: createAuthenticatedViewer({ userId: 'u2' }), conversationId: 'cnv_c1', payload: { type: 'text', content: { text: 'I appreciated what you shared earlier.' } }, dbClient: db })
  assert.equal(state.currentLayer, 1)
})


test('concurrent trust signals do not lose increments', async () => {
  const { db, state } = makeDbForLayerSync({
    relationshipState: { id: 'rl1', currentLayer: 1, reciprocalMessageCount: 5, trustScore: 10, lastMessageSenderId: 'u1', lastCountedMessageAt: new Date(Date.now() - 90_000), layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null },
    trustSignalRule: { signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, points: 2, enabled: true },
    layerRules: [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }]
  })
  db.trustSignalRule.findUnique = async ({ where }) => (where.signalType === TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED ? { signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, points: 2, enabled: true } : null)
  await Promise.all([
    syncLayerAfterTrustSignal({ conversationId: 'c1', signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, dbClient: db }),
    syncLayerAfterTrustSignal({ conversationId: 'c1', signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, dbClient: db })
  ])
  assert.equal(state.trustScore, 14)
})
