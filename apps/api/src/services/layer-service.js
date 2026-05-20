import { LAYER_LEVEL, MESSAGE_DELIVERY_STATE, MESSAGE_TYPE, MESSAGE_VISIBILITY, TRUST_SIGNAL_TYPE } from '../../../../packages/shared/src/contracts.js'

const MIN_QUALITY_TEXT_LENGTH = 12
const MIN_SECONDS_BETWEEN_COUNTED_TURNS = 20

const canonicalPairFor = (leftUserId, rightUserId) => (leftUserId < rightUserId ? [leftUserId, rightUserId] : [rightUserId, leftUserId])

const buildSystemMessage = (layerLevel, profileName = 'this person') => {
  if (layerLevel === LAYER_LEVEL.MUTUAL_SPARK) return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `You've come to know a little more about ${profileName}.`, subtitle: 'Something new is now visible.' } }
  if (layerLevel === LAYER_LEVEL.MEANINGFUL_CONVERSATION) return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `You're slowly getting to know ${profileName}.`, subtitle: 'A little more context is now visible.' } }
  return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `Another layer is now visible with ${profileName}.`, subtitle: 'Some things unfold naturally.' } }
}
const meetsQualityHeuristic = (messageText) => typeof messageText === 'string' && messageText.trim().length >= MIN_QUALITY_TEXT_LENGTH
const hasMinimumPacingSinceLastCountedTurn = ({ now, lastCountedAt }) => !lastCountedAt || ((now.getTime() - lastCountedAt.getTime()) / 1000) >= MIN_SECONDS_BETWEEN_COUNTED_TURNS
const hasMinimumRelationshipAgeForRule = ({ now, layer1UnlockedAt, minElapsedMinutes }) => !!layer1UnlockedAt && ((now.getTime() - layer1UnlockedAt.getTime()) / (60 * 1000)) >= minElapsedMinutes
const nextLayerFor = ({ currentLayer, trustScore, now, layer1UnlockedAt, layerRules }) => {
  const matchingRule = layerRules.find((rule) => rule.fromLayer === currentLayer && rule.enabled)
  if (!matchingRule) return null
  if (!hasMinimumRelationshipAgeForRule({ now, layer1UnlockedAt, minElapsedMinutes: matchingRule.minElapsedMinutes })) return null
  if (trustScore < matchingRule.requiredTrustScore) return null
  return matchingRule.toLayer
}

const maybeApplyTrustSignal = async ({ tx, conversationId, state, trustDelta }) => {
  if (!trustDelta) return null
  const now = new Date()
  const trustScore = state.trustScore + trustDelta
  const layerRules = await tx.layerRule.findMany({ where: { enabled: true }, orderBy: [{ fromLayer: 'asc' }, { toLayer: 'asc' }] })
  const unlockedLayer = nextLayerFor({ currentLayer: state.currentLayer, trustScore, now, layer1UnlockedAt: state.layer1UnlockedAt, layerRules })
  await tx.relationshipLayer.update({ where: { id: state.id }, data: { trustScore, currentLayer: unlockedLayer || state.currentLayer, layer2UnlockedAt: unlockedLayer === LAYER_LEVEL.MEANINGFUL_CONVERSATION ? now : state.layer2UnlockedAt, layer3UnlockedAt: unlockedLayer === LAYER_LEVEL.DEEPER_TRUST ? now : state.layer3UnlockedAt } })
  if (!unlockedLayer) return null
  const existingUnlockMessage = await tx.message.findFirst({ where: { conversationId, senderUserId: null, type: MESSAGE_TYPE.LAYER_UNLOCK, metadata: { path: ['layerLevel'], equals: unlockedLayer } } })
  if (!existingUnlockMessage) {
    const systemMessage = buildSystemMessage(unlockedLayer)
    await tx.message.create({ data: { conversationId, senderUserId: null, type: MESSAGE_TYPE.LAYER_UNLOCK, visibility: MESSAGE_VISIBILITY.CONVERSATION, deliveryState: MESSAGE_DELIVERY_STATE.SENT, content: systemMessage.content, metadata: { source: 'layer_progression', layerLevel: unlockedLayer } } })
  }
  return unlockedLayer
}

const getRelationshipStateForConversation = async ({ tx, conversationId }) => {
  const conversation = await tx.conversation.findUnique({ where: { id: conversationId }, include: { participants: { select: { userId: true } } } })
  if (!conversation || conversation.participants.length < 2) return null
  const [first, second] = conversation.participants.map((p) => p.userId)
  const [primaryUserId, secondaryUserId] = canonicalPairFor(first, second)
  const now = new Date()
  const state = await tx.relationshipLayer.upsert({ where: { primaryUserId_secondaryUserId: { primaryUserId, secondaryUserId } }, create: { primaryUserId, secondaryUserId, currentLayer: LAYER_LEVEL.MUTUAL_SPARK, reciprocalMessageCount: 0, trustScore: 0, lastMessageSenderId: null, layer1UnlockedAt: now, lastCountedMessageAt: null }, update: {} })
  return state
}

export const syncLayerAfterMutualSpark = async ({ spark, dbClient }) => {
  const [primaryUserId, secondaryUserId] = canonicalPairFor(spark.initiatorUserId, spark.recipientUserId)
  const now = new Date()
  await dbClient.relationshipLayer.upsert({ where: { primaryUserId_secondaryUserId: { primaryUserId, secondaryUserId } }, create: { primaryUserId, secondaryUserId, currentLayer: LAYER_LEVEL.MUTUAL_SPARK, reciprocalMessageCount: 0, layer1UnlockedAt: now }, update: { currentLayer: { set: LAYER_LEVEL.MUTUAL_SPARK }, layer1UnlockedAt: now } })
}

export const syncLayerAfterMessage = async ({ conversationId, senderUserId, messageText, dbClient }) => dbClient.$transaction(async (tx) => {
  const state = await getRelationshipStateForConversation({ tx, conversationId })
  if (!state) return null
  const now = new Date()
  const shouldCountTurn = meetsQualityHeuristic(messageText) && Boolean(state.lastMessageSenderId) && state.lastMessageSenderId !== senderUserId && hasMinimumPacingSinceLastCountedTurn({ now, lastCountedAt: state.lastCountedMessageAt || null })
  await tx.relationshipLayer.update({ where: { id: state.id }, data: { reciprocalMessageCount: state.reciprocalMessageCount + (shouldCountTurn ? 1 : 0), lastMessageSenderId: senderUserId, lastCountedMessageAt: shouldCountTurn ? now : state.lastCountedMessageAt } })
  if (!shouldCountTurn) return null
  const signalRule = await tx.trustSignalRule.findUnique({ where: { signalType: TRUST_SIGNAL_TYPE.QUALITY_MESSAGE_TURN } })
  const trustDelta = signalRule && signalRule.enabled ? signalRule.points : 0
  return maybeApplyTrustSignal({ tx, conversationId, state, trustDelta })
})

export const syncLayerAfterTrustSignal = async ({ conversationId, signalType, dbClient }) => dbClient.$transaction(async (tx) => {
  const state = await getRelationshipStateForConversation({ tx, conversationId })
  if (!state) return null
  const signalRule = await tx.trustSignalRule.findUnique({ where: { signalType } })
  const trustDelta = signalRule && signalRule.enabled ? signalRule.points : 0
  return maybeApplyTrustSignal({ tx, conversationId, state, trustDelta })
})
