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

const isValidDefaultLayerRule = (rule) => Number.isInteger(rule.fromLayer) && Number.isInteger(rule.toLayer) && Number.isInteger(rule.minElapsedMinutes) && Number.isInteger(rule.requiredTrustScore) && rule.minElapsedMinutes >= 0 && rule.requiredTrustScore >= 0 && rule.toLayer === rule.fromLayer + 1
const isValidDefaultSignalRule = (rule) => Number.isInteger(rule.points) && rule.points >= 0

const ensureDefaultRulesHealth = () => {
  for (const rule of DEFAULT_LAYER_RULES) {
    if (!isValidDefaultLayerRule(rule)) throw new Error(`Invalid default layer rule: ${JSON.stringify(rule)}`)
  }
  for (const rule of DEFAULT_TRUST_SIGNAL_RULES) {
    if (!isValidDefaultSignalRule(rule)) throw new Error(`Invalid default trust signal rule: ${JSON.stringify(rule)}`)
  }
}

export const ensureLayerTrustRules = async ({ dbClient }) => {
  ensureDefaultRulesHealth()

  for (const rule of DEFAULT_LAYER_RULES) {
    await dbClient.layerRule.upsert({
      where: { fromLayer_toLayer: { fromLayer: rule.fromLayer, toLayer: rule.toLayer } },
      create: rule,
      update: {
        minElapsedMinutes: rule.minElapsedMinutes < 0 ? 0 : undefined,
        requiredTrustScore: rule.requiredTrustScore < 0 ? 0 : undefined
      }
    })
  }

  for (const signalRule of DEFAULT_TRUST_SIGNAL_RULES) {
    await dbClient.trustSignalRule.upsert({
      where: { signalType: signalRule.signalType },
      create: signalRule,
      update: {
        points: signalRule.points < 0 ? 0 : undefined
      }
    })
  }
}
