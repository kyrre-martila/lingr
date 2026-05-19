import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedViewer } from '../src/auth/viewer.js'
import { DISCOVERY_LIMIT_PER_DAY, DISCOVERY_REASON_CODES, DISCOVERY_STATE } from '../../../packages/shared/src/contracts.js'
import { createSparkFromDiscovery, dismissIntroduction, getDailyDiscovery } from '../src/services/discovery-service.js'

const viewer = createAuthenticatedViewer({ userId: 'u1' })

const baseDb = () => ({
  discoveryDailyTracker: {
    findUnique: async () => null,
    create: async () => ({ id: 't1', viewerUserId: 'u1', dayKey: '2026-05-18', introducedCount: 0 }),
    update: async () => ({})
  },
  profile: { findUnique: async () => ({ locationRegion: 'NO-03' }) },
  blockRelation: { findMany: async () => [] },
  discoveryView: { findMany: async () => [], upsert: async () => ({}) },
  spark: { findMany: async () => [] },
  user: { findMany: async () => [], findUnique: async () => ({ id: 'u2' }) }
})

test('daily limit reached is enforced deterministically', async () => {
  const db = baseDb()
  db.discoveryDailyTracker.findUnique = async () => ({ id: 't1', viewerUserId: 'u1', dayKey: '2026-05-18', introducedCount: DISCOVERY_LIMIT_PER_DAY })
  const result = await getDailyDiscovery({ viewer, dbClient: db, now: new Date('2026-05-18T00:00:00Z') })
  assert.equal(result.state, DISCOVERY_STATE.LIMIT_REACHED)
  assert.equal(result.reasonCode, DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED)
})

test('viewed people are hidden only during not-now cooldown window', async () => {
  const db = baseDb()
  db.discoveryView.findMany = async () => [{ discoveredUserId: 'u2', createdAt: new Date('2026-05-01T00:00:00Z') }]
  db.user.findMany = async () => [{ id: 'u2', status: 'active', profile: { displayName: 'A', locationRegion: 'NO-03' }, glimpses: [] }]
  const result = await getDailyDiscovery({ viewer, dbClient: db, now: new Date('2026-05-18T00:00:00Z') })
  assert.equal(result.state, DISCOVERY_STATE.READY)
})

test('existing spark and fresh viewed users are excluded', async () => {
  const db = baseDb()
  db.discoveryView.findMany = async () => [{ discoveredUserId: 'u2', createdAt: new Date('2026-05-10T00:00:00Z') }]
  db.spark.findMany = async () => [{ initiatorUserId: 'u1', recipientUserId: 'u3' }]
  db.user.findMany = async () => [
    { id: 'u2', status: 'active', profile: { displayName: 'A', locationRegion: 'NO-03' }, glimpses: [] },
    { id: 'u3', status: 'active', profile: { displayName: 'B', locationRegion: 'NO-03' }, glimpses: [] }
  ]
  const result = await getDailyDiscovery({ viewer, dbClient: db, now: new Date('2026-05-18T00:00:00Z') })
  assert.equal(result.state, DISCOVERY_STATE.EMPTY)
})

test('unavailable region state is returned', async () => {
  const db = baseDb()
  db.profile.findUnique = async () => ({ locationRegion: null })
  const unavailable = await getDailyDiscovery({ viewer, dbClient: db })
  assert.equal(unavailable.state, DISCOVERY_STATE.UNAVAILABLE)
  assert.equal(unavailable.reasonCode, DISCOVERY_REASON_CODES.UNAVAILABLE_REGION)
})

test('not-now marks view and increments daily tracking', async () => {
  let upserted = false
  let updated = false
  const db = baseDb()
  db.discoveryView.upsert = async () => { upserted = true; return {} }
  db.discoveryDailyTracker.update = async () => { updated = true; return {} }
  const result = await dismissIntroduction({ viewer, discoveredUserId: 'u2', dbClient: db })
  assert.equal(result.ok, true)
  assert.equal(upserted, true)
  assert.equal(updated, true)
})

test('duplicate spark from discovery is calm and non-duplicating', async () => {
  const db = baseDb()
  db.spark.create = async () => { const e = new Error('unique'); e.code = 'P2002'; throw e }
  const result = await createSparkFromDiscovery({ viewer, discoveredUserId: 'u2', dbClient: db })
  assert.equal(result.state, 'already_exists')
})


test('layer 0 discovery payload excludes direct identity and timestamps', async () => {
  const db = baseDb()
  db.user.findMany = async () => [{
    id: 'u2',
    status: 'active',
    profile: { displayName: 'Sofia', locationRegion: 'NO-03', layersSummary: 'calm • curious', bio: 'Quiet walk by the sea' },
    glimpses: [{ id: 'g1', reflection: 'Evening tea and sketchbook', mood: 'calm', prompt: 'What grounded you today?', emotionalTone: 'warm', createdAt: new Date('2026-05-01T00:00:00Z') }]
  }]
  const result = await getDailyDiscovery({ viewer, dbClient: db, now: new Date('2026-05-18T00:00:00Z') })
  assert.equal(result.state, DISCOVERY_STATE.READY)
  const intro = result.introductions[0]
  assert.ok(intro.userId)
  assert.equal(Object.hasOwn(intro, 'displayName'), false)
  assert.equal(Object.hasOwn(intro, 'locationRegion'), false)
  assert.equal(Object.hasOwn(intro, 'createdAt'), false)
  assert.equal(Object.hasOwn(intro.glimpses[0], 'createdAt'), false)
})
