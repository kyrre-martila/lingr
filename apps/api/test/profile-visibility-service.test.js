import test from 'node:test'
import assert from 'node:assert/strict'
import { getVisibleProfileForRelationship } from '../src/services/profile-visibility-service.js'

const profile = { displayName: 'Noor L', broadRegion: 'US-Northeast', locationRegion: 'US-NY-Brooklyn', layersSummary: 'Ceramics • Walks', revealInterests: ['Ceramics', 'Walks'], revealEmotionalValues: ['Gentleness', 'Honesty'], pronouns: 'she/her', bio: 'Slow mornings.' }
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
  assert.equal(visible.hiddenHint, 'Getting to know someone takes time.')
})

test('Layer 1 reveals first name and broad region', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(1) })
  assert.equal(visible.profile.firstName, 'Noor')
  assert.equal(visible.profile.broadRegion, 'US-Northeast')
  assert.equal(visible.profile.intro, 'Ceramics • Walks')
  assert.equal(visible.profile.fullerBio, null)
})

test('Layer 2 reveals structured interests and glimpse context', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(2) })
  assert.deepEqual(visible.profile.interests, ['Ceramics', 'Walks'])
  assert.equal(visible.profile.glimpses[0].imageNote, 'Window light')
})

test('Layer 3 reveals fuller profile visibility', async () => {
  const visible = await getVisibleProfileForRelationship({ viewerUserId: 'u1', targetUserId: 'u2', dbClient: createDb(3) })
  assert.equal(visible.profile.exactRegion, 'US-NY-Brooklyn')
  assert.equal(visible.profile.pronouns, 'she/her')
  assert.deepEqual(visible.profile.emotionalValues, ['Gentleness', 'Honesty'])
  assert.equal(visible.profile.fullerBio, 'Slow mornings.')
})
