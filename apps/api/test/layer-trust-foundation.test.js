import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_LAYER_RULES, DEFAULT_TRUST_SIGNAL_RULES, ensureLayerTrustRules } from '../src/config/layer-trust-rules.js'
import { LAYER_LEVEL, TRUST_SIGNAL_TYPE } from '../../../packages/shared/src/contracts.js'

test('layer trust foundation defaults include expected layer rule thresholds', () => {
  assert.deepEqual(DEFAULT_LAYER_RULES, [
    { fromLayer: LAYER_LEVEL.MUTUAL_SPARK, toLayer: LAYER_LEVEL.MEANINGFUL_CONVERSATION, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true },
    { fromLayer: LAYER_LEVEL.MEANINGFUL_CONVERSATION, toLayer: LAYER_LEVEL.DEEPER_TRUST, minElapsedMinutes: 960, requiredTrustScore: 55, enabled: true }
  ])
})

test('prisma schema includes trust foundation models and trustScore default', () => {
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'apps/api/prisma/schema.prisma'), 'utf8')
  assert.match(schema, /model RelationshipLayer[\s\S]*trustScore\s+Int\s+@default\(0\)/)
  assert.match(schema, /model LayerRule/)
  assert.match(schema, /model TrustSignalRule/)
})

test('layer trust foundation defaults include canonical signal points', () => {
  assert.deepEqual(DEFAULT_TRUST_SIGNAL_RULES, [
    { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true },
    { signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, points: 8, enabled: true },
    { signalType: TRUST_SIGNAL_TYPE.GUESS_ME_COMPLETED, points: 6, enabled: true },
    { signalType: TRUST_SIGNAL_TYPE.SNUGGLE_SHARED, points: 5, enabled: true },
    { signalType: TRUST_SIGNAL_TYPE.PLAYING_NOW_SHARED, points: 2, enabled: true }
  ])
})

test('canonical trust signal types stay consistent with defaults', () => {
  const canonicalSignalTypes = Object.values(TRUST_SIGNAL_TYPE).sort()
  const seededSignalTypes = DEFAULT_TRUST_SIGNAL_RULES.map((entry) => entry.signalType).sort()
  assert.deepEqual(seededSignalTypes, canonicalSignalTypes)
})

test('ensureLayerTrustRules bootstraps default config through upserts', async () => {
  const calls = { layerRule: [], trustSignalRule: [] }
  const db = {
    layerRule: { upsert: async (input) => calls.layerRule.push(input) },
    trustSignalRule: { upsert: async (input) => calls.trustSignalRule.push(input) }
  }

  await ensureLayerTrustRules({ dbClient: db })

  assert.equal(calls.layerRule.length, 2)
  assert.equal(calls.trustSignalRule.length, 5)
  assert.deepEqual(calls.layerRule[0].create, DEFAULT_LAYER_RULES[0])
  assert.deepEqual(calls.trustSignalRule[0].create, DEFAULT_TRUST_SIGNAL_RULES[0])
})

test('relationship layer create payload keeps trustScore default at zero', () => {
  const relationshipCreatePayload = { currentLayer: LAYER_LEVEL.MUTUAL_SPARK, trustScore: 0 }
  assert.equal(relationshipCreatePayload.trustScore, 0)
})
