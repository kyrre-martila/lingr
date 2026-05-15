import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { acceptSpark, createSparkInvitation, declineSpark, listViewerSparks } from '../src/services/spark-service.js'
import { REASON_CODES, SPARK_STATE } from '../../../packages/shared/src/contracts.js'

test('anonymous viewer cannot create spark', async () => {
  await assert.rejects(createSparkInvitation({ viewer: createAnonymousViewer(), payload: {} }), (e) => e.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH)
})

test('cannot create self spark', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'u1' }, dbClient: { spark: { findFirst: async () => null } } }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_SELF_SPARK)
})

test('duplicate active spark rejected', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  const db = { spark: { findFirst: async () => ({ id: 's1' }) } }
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'u2' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.DUPLICATE_ACTIVE_SPARK)
})

test('accept requires recipient', async () => {
  const db = { spark: { findFirst: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.INVITED }) } }
  await assert.rejects(acceptSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), sparkId: 'spk_s1', dbClient: db }), (e) => e.reasonCode === REASON_CODES.PERMISSION.NOT_ALLOWED)
})

test('list marks expired invitations with placeholder logic', async () => {
  const now = new Date()
  const db = { spark: {
    updateMany: async () => ({ count: 1 }),
    findMany: async () => [{ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.EXPIRED, sourceGlimpsId: null, softResonanceContext: null, createdAt: now, updatedAt: now, respondedAt: null, pausedAt: null, declinedAt: null, expiredAt: now }]
  } }
  const result = await listViewerSparks({ viewer: createAuthenticatedViewer({ userId: 'u1' }), dbClient: db })
  assert.equal(result[0].status, SPARK_STATE.EXPIRED)
})

test('decline disallows terminal transition changes', async () => {
  const db = { spark: { findFirst: async () => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status: SPARK_STATE.EXPIRED }) } }
  await assert.rejects(declineSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), sparkId: 'spk_s1', dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_STATE_TRANSITION)
})
