import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { acceptSpark, createSparkInvitation, declineSpark, listViewerSparks, pauseSpark } from '../src/services/spark-service.js'
import { REASON_CODES, SPARK_STATE } from '../../../packages/shared/src/contracts.js'

const now = new Date('2026-05-15T00:00:00.000Z')
const row = (status = SPARK_STATE.INVITED) => ({ id: 's1', initiatorUserId: 'u1', recipientUserId: 'u2', status, sourceGlimpsId: null, softResonanceContext: null, createdAt: now, updatedAt: now, respondedAt: null, pausedAt: null, declinedAt: null, expiredAt: null })

test('anonymous viewer cannot create spark', async () => {
  await assert.rejects(createSparkInvitation({ viewer: createAnonymousViewer(), payload: {} }), (e) => e.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH)
})

test('create requires prefixed recipient ID', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  const db = { user: { findUnique: async () => ({ id: 'u2' }) }, spark: { create: async () => row() } }
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'u2' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.VALIDATION.INVALID_ID)
})

test('cannot create self spark', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'usr_u1' }, dbClient: { user: { findUnique: async () => ({ id: 'u1' }) }, spark: { create: async () => row() } } }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_SELF_SPARK)
})

test('duplicate active spark unique violation is mapped', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  const db = { user: { findUnique: async () => ({ id: 'u2' }) }, spark: { create: async () => { const err = new Error('dup'); err.code = 'P2002'; throw err } } }
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'usr_u2' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.DUPLICATE_ACTIVE_SPARK)
})

test('invalid recipient reference rejected', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  const db = { user: { findUnique: async () => null }, spark: { create: async () => row() } }
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'usr_missing' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_RECIPIENT_REFERENCE)
})

test('invalid source glimps reference rejected', async () => {
  const viewer = createAuthenticatedViewer({ userId: 'u1' })
  const db = { user: { findUnique: async () => ({ id: 'u2' }) }, glimps: { findUnique: async () => null }, spark: { create: async () => row() } }
  await assert.rejects(createSparkInvitation({ viewer, payload: { recipientUserId: 'usr_u2', sourceGlimpsId: 'glp_missing' }, dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_SOURCE_GLIMPS_REFERENCE)
})

test('accept requires recipient actor', async () => {
  const db = { spark: { findFirst: async () => row() } }
  await assert.rejects(acceptSpark({ viewer: createAuthenticatedViewer({ userId: 'u1' }), sparkId: 'spk_s1', dbClient: db }), (e) => e.reasonCode === REASON_CODES.PERMISSION.NOT_ALLOWED)
})

test('pause allows participant actors', async () => {
  const db = { spark: { findFirst: async () => row(SPARK_STATE.ACCEPTED), update: async () => row(SPARK_STATE.PAUSED) } }
  const result = await pauseSpark({ viewer: createAuthenticatedViewer({ userId: 'u2' }), sparkId: 'spk_s1', dbClient: db })
  assert.equal(result.status, SPARK_STATE.PAUSED)
})

test('decline disallows accepted->declined transition', async () => {
  const db = { spark: { findFirst: async () => row(SPARK_STATE.ACCEPTED) } }
  await assert.rejects(declineSpark({ viewer: createAuthenticatedViewer({ userId: 'u2' }), sparkId: 'spk_s1', dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_STATE_TRANSITION)
})

test('terminal states remain terminal', async () => {
  const db = { spark: { findFirst: async () => row(SPARK_STATE.EXPIRED) } }
  await assert.rejects(acceptSpark({ viewer: createAuthenticatedViewer({ userId: 'u2' }), sparkId: 'spk_s1', dbClient: db }), (e) => e.reasonCode === REASON_CODES.SPARK.INVALID_STATE_TRANSITION)
})

test('list marks expired invitations with placeholder logic', async () => {
  const db = { spark: { updateMany: async () => ({ count: 1 }), findMany: async () => [row(SPARK_STATE.EXPIRED)] } }
  const result = await listViewerSparks({ viewer: createAuthenticatedViewer({ userId: 'u1' }), dbClient: db })
  assert.equal(result[0].status, SPARK_STATE.EXPIRED)
})
