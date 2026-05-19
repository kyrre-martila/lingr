import { LAYER_LEVEL, MESSAGE_DELIVERY_STATE, MESSAGE_TYPE, MESSAGE_VISIBILITY } from '../../../../packages/shared/src/contracts.js'

const LAYER_2_RECIPROCAL_THRESHOLD = 6
const LAYER_3_RECIPROCAL_THRESHOLD = 12

const canonicalPairFor = (leftUserId, rightUserId) => (leftUserId < rightUserId ? [leftUserId, rightUserId] : [rightUserId, leftUserId])

const buildSystemMessage = (layerLevel, profileName = 'this person') => {
  if (layerLevel === LAYER_LEVEL.MUTUAL_SPARK) return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `You've come to know a little more about ${profileName}.`, subtitle: 'Something new is now visible.' } }
  if (layerLevel === LAYER_LEVEL.MEANINGFUL_CONVERSATION) return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `You're slowly getting to know ${profileName}.`, subtitle: 'A little more context is now visible.' } }
  return { type: MESSAGE_TYPE.LAYER_UNLOCK, content: { title: `Another layer is now visible with ${profileName}.`, subtitle: 'Some things unfold naturally.' } }
}

export const syncLayerAfterMutualSpark = async ({ spark, dbClient }) => {
  const [primaryUserId, secondaryUserId] = canonicalPairFor(spark.initiatorUserId, spark.recipientUserId)
  const now = new Date()
  await dbClient.relationshipLayer.upsert({
    where: { primaryUserId_secondaryUserId: { primaryUserId, secondaryUserId } },
    create: { primaryUserId, secondaryUserId, currentLayer: LAYER_LEVEL.MUTUAL_SPARK, layer1UnlockedAt: now },
    update: { currentLayer: { set: LAYER_LEVEL.MUTUAL_SPARK }, layer1UnlockedAt: now }
  })
}

export const syncLayerAfterMessage = async ({ conversationId, senderUserId, dbClient }) => {
  const conversation = await dbClient.conversation.findUnique({ where: { id: conversationId }, include: { participants: { select: { userId: true } } } })
  if (!conversation || conversation.participants.length < 2) return null
  const [first, second] = conversation.participants.map((p) => p.userId)
  const [primaryUserId, secondaryUserId] = canonicalPairFor(first, second)
  const now = new Date()
  const state = await dbClient.relationshipLayer.upsert({
    where: { primaryUserId_secondaryUserId: { primaryUserId, secondaryUserId } },
    create: { primaryUserId, secondaryUserId, currentLayer: LAYER_LEVEL.MUTUAL_SPARK, reciprocalMessageCount: 0, lastMessageSenderId: senderUserId, layer1UnlockedAt: now },
    update: {}
  })

  const reciprocalIncrement = state.lastMessageSenderId && state.lastMessageSenderId !== senderUserId ? 1 : 0
  const reciprocalMessageCount = state.reciprocalMessageCount + reciprocalIncrement
  let nextLayer = state.currentLayer
  if (reciprocalMessageCount >= LAYER_3_RECIPROCAL_THRESHOLD) nextLayer = LAYER_LEVEL.DEEPER_TRUST
  else if (reciprocalMessageCount >= LAYER_2_RECIPROCAL_THRESHOLD) nextLayer = LAYER_LEVEL.MEANINGFUL_CONVERSATION
  const unlockedLayer = nextLayer > state.currentLayer ? nextLayer : null

  await dbClient.relationshipLayer.update({
    where: { id: state.id },
    data: {
      reciprocalMessageCount,
      lastMessageSenderId: senderUserId,
      currentLayer: nextLayer,
      layer2UnlockedAt: unlockedLayer === LAYER_LEVEL.MEANINGFUL_CONVERSATION ? now : state.layer2UnlockedAt,
      layer3UnlockedAt: unlockedLayer === LAYER_LEVEL.DEEPER_TRUST ? now : state.layer3UnlockedAt
    }
  })
  if (!unlockedLayer) return null
  const systemMessage = buildSystemMessage(unlockedLayer)
  await dbClient.message.create({ data: { conversationId, senderUserId: null, type: MESSAGE_TYPE.LAYER_UNLOCK, visibility: MESSAGE_VISIBILITY.CONVERSATION, deliveryState: MESSAGE_DELIVERY_STATE.SENT, content: systemMessage.content, metadata: { source: 'layer_progression', layerLevel: unlockedLayer } } })
  return unlockedLayer
}
