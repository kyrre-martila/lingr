import test from 'node:test'
import assert from 'node:assert/strict'
import { getVisibleProfileForRelationship } from '../src/services/profile-visibility-service.js'

const profile = { displayName: 'Noor L', locationRegion: 'US-NY-Brooklyn', layersSummary: 'Ceramics • Walks', pronouns: 'she/her', bio: 'Slow mornings.' }
const glimpses = [{ reflection: 'Tea and quiet', emotionalTone: 'warm', mood: 'calm', prompt: 'Morning?', imageNote: 'Window light' }]

const createDb = (layer) => ({
  relationshipLayer: { findUnique: async () => (layer === null ? null : { currentLayer: layer }) },
  profile: { findUnique: async () => profile },
  glimps: { findMany: async () => glimpses }
})

test('Layer 0 keeps profile anonymous', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(0) })
  assert.equal(visible.profile.firstName, null)
  assert.equal(visible.profile.exactRegion, null)
  assert.equal(visible.profile.intro, null)
})

test('Layer 1 reveals first name and broad region', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(1) })
  assert.equal(visible.profile.firstName, 'Noor')
  assert.equal(visible.profile.broadRegion, 'US-NY')
  assert.equal(visible.profile.intro, 'Ceramics • Walks')
  assert.equal(visible.profile.fullerBio, null)
})

test('Layer 2 reveals expanded interests and glimpse context', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(2) })
  assert.deepEqual(visible.profile.interests, ['Ceramics', 'Walks'])
  assert.equal(visible.profile.glimpses[0].imageNote, 'Window light')
})

test('Layer 3 reveals fuller profile visibility', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(3) })
  assert.equal(visible.profile.exactRegion, 'US-NY-Brooklyn')
  assert.equal(visible.profile.pronouns, 'she/her')
  assert.equal(visible.profile.fullerBio, 'Slow mornings.')
})

test('no cross-relationship leakage and consistent pair canonicalization', async () => {
  const calls = []
  const db = {
    relationshipLayer: { findUnique: async ({ where }) => { calls.push(where.primaryUserId_secondaryUserId); return { currentLayer: 1 } } },
    profile: { findUnique: async () => profile },
    glimps: { findMany: async () => glimpses }
  }
  await getVisibleProfileForRelationship({ viewerUserId: 'u9', targetUserId: 'u2', dbClient: db })
  await getVisibleProfileForRelationship({ viewerUserId: 'u2', targetUserId: 'u9', dbClient: db })
  assert.deepEqual(calls[0], calls[1])
})
