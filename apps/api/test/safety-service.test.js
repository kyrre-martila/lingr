import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedViewer } from '../src/auth/viewer.js'
import { assertConversationInteractive, assertNoUserInteractionBlock, blockUser, pauseConversation, reportUser } from '../src/services/safety-service.js'
import { REASON_CODES } from '../../../packages/shared/src/contracts.js'

const viewer = createAuthenticatedViewer({ userId: 'u1' })

test('duplicate block is idempotent', async () => {
  const db = { blockRelation: { upsert: async () => ({}) }, conversation: { findMany: async () => [] }, moderationEvent: { create: async () => ({}) } }
  const out = await blockUser({ viewer, payload: { targetUserId: 'usr_u2' }, dbClient: db })
  assert.equal(out.status, 'blocked')
})

test('report creation persists and logs moderation event', async () => {
  let eventType
  const db = { userReport: { create: async () => ({ id: 'r1', createdAt: new Date('2026-05-20T00:00:00.000Z') }) }, moderationEvent: { create: async ({ data }) => { eventType = data.type } } }
  const out = await reportUser({ viewer, payload: { reportedUserId: 'usr_u2', category: 'harassment' }, dbClient: db })
  assert.equal(out.reportId, 'r1')
  assert.equal(eventType, 'user_reported')
})

test('paused conversation restricts messaging/actions', async () => {
  await assert.rejects(assertConversationInteractive({ db: { conversationSafetyState: { findUnique: async () => ({ isPaused: true }) } }, conversationId: 'c1' }), (e) => e.reasonCode === REASON_CODES.SAFETY.CONVERSATION_PAUSED)
})

test('blocking user prevents interaction', async () => {
  await assert.rejects(assertNoUserInteractionBlock({ db: { blockRelation: { findFirst: async () => ({ id: 'b1' }) } }, actorUserId: 'u1', targetUserId: 'u2' }), (e) => e.reasonCode === REASON_CODES.SAFETY.INTERACTION_RESTRICTED)
})

test('pause conversation requires participant permission', async () => {
  const db = { conversation: { findFirst: async () => null } }
  await assert.rejects(pauseConversation({ viewer, conversationId: 'cnv_c1', payload: {}, dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})
