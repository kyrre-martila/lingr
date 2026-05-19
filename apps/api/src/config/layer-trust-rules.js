import { LAYER_LEVEL, TRUST_SIGNAL_TYPE } from '../../../../packages/shared/src/contracts.js'

export const DEFAULT_LAYER_RULES = Object.freeze([
  Object.freeze({ fromLayer: LAYER_LEVEL.MUTUAL_SPARK, toLayer: LAYER_LEVEL.MEANINGFUL_CONVERSATION, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }),
  Object.freeze({ fromLayer: LAYER_LEVEL.MEANINGFUL_CONVERSATION, toLayer: LAYER_LEVEL.DEEPER_TRUST, minElapsedMinutes: 960, requiredTrustScore: 55, enabled: true })
])

export const DEFAULT_TRUST_SIGNAL_RULES = Object.freeze([
  Object.freeze({ signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN, points: 2, enabled: true }),
  Object.freeze({ signalType: TRUST_SIGNAL_TYPE.MATCH_CARDS_COMPLETED, points: 8, enabled: true }),
  Object.freeze({ signalType: TRUST_SIGNAL_TYPE.GUESS_ME_COMPLETED, points: 6, enabled: true }),
  Object.freeze({ signalType: TRUST_SIGNAL_TYPE.SNUGGLE_SHARED, points: 5, enabled: true }),
  Object.freeze({ signalType: TRUST_SIGNAL_TYPE.PLAYING_NOW_SHARED, points: 2, enabled: true })
])

export const ensureLayerTrustRules = async ({ dbClient }) => {
  for (const rule of DEFAULT_LAYER_RULES) {
    await dbClient.layerRule.upsert({
      where: { fromLayer_toLayer: { fromLayer: rule.fromLayer, toLayer: rule.toLayer } },
      create: rule,
      update: {}
    })
  }

  for (const signalRule of DEFAULT_TRUST_SIGNAL_RULES) {
    await dbClient.trustSignalRule.upsert({
      where: { signalType: signalRule.signalType },
      create: signalRule,
      update: {}
    })
  }
}
