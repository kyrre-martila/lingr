import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedViewer } from '../src/auth/viewer.js'
import { DISCOVERY_LIMIT_PER_DAY, DISCOVERY_REASON_CODES, DISCOVERY_STATE } from '../../../packages/shared/src/contracts.js'
import { getDailyDiscovery } from '../src/services/discovery-service.js'

const viewer = createAuthenticatedViewer({ userId: 'u1' })

const baseDb = () => ({
  discoveryDailyTracker: {
    findUnique: async () => null,
    create: async () => ({ id: 't1', viewerUserId: 'u1', dayKey: '2026-05-18', introducedCount: 0 }),
  },
  profile: { findUnique: async () => ({ locationRegion: 'NO-03' }) },
  blockRelation: { findMany: async () => [] },
  discoveryView: { findMany: async () => [] },
  spark: { findMany: async () => [] },
  user: { findMany: async () => [] }
})

test('daily limit reached is enforced deterministically', async () => {
  const db = baseDb()
  db.discoveryDailyTracker.findUnique = async () => ({ id: 't1', viewerUserId: 'u1', dayKey: '2026-05-18', introducedCount: DISCOVERY_LIMIT_PER_DAY })
  const result = await getDailyDiscovery({ viewer, dbClient: db, now: new Date('2026-05-18T00:00:00Z') })
  assert.equal(result.state, DISCOVERY_STATE.LIMIT_REACHED)
  assert.equal(result.reasonCode, DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED)
})

test('self is excluded and only compatible region appears', async () => {
  const db = baseDb()
  db.user.findMany = async () => [{ id: 'u2', status: 'active', profile: { displayName: 'A', locationRegion: 'NO-03' }, glimpses: [] }]
  const result = await getDailyDiscovery({ viewer, dbClient: db })
  assert.equal(result.state, DISCOVERY_STATE.READY)
  assert.equal(result.introductions[0].userId, 'usr_u2')
})

test('existing spark and viewed users are excluded', async () => {
  const db = baseDb()
  db.discoveryView.findMany = async () => [{ discoveredUserId: 'u2' }]
  db.spark.findMany = async () => [{ initiatorUserId: 'u1', recipientUserId: 'u3' }]
  db.user.findMany = async () => [
    { id: 'u2', status: 'active', profile: { displayName: 'A', locationRegion: 'NO-03' }, glimpses: [] },
    { id: 'u3', status: 'active', profile: { displayName: 'B', locationRegion: 'NO-03' }, glimpses: [] }
  ]
  const result = await getDailyDiscovery({ viewer, dbClient: db })
  assert.equal(result.state, DISCOVERY_STATE.EMPTY)
})

test('unavailable region and empty states are returned calmly', async () => {
  const db = baseDb()
  db.profile.findUnique = async () => ({ locationRegion: null })
  const unavailable = await getDailyDiscovery({ viewer, dbClient: db })
  assert.equal(unavailable.state, DISCOVERY_STATE.UNAVAILABLE)
  assert.equal(unavailable.reasonCode, DISCOVERY_REASON_CODES.UNAVAILABLE_REGION)
})
