import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { APP_INVITE_APP_ID, CONVERSATION_PARTICIPANT_ROLE, CONVERSATION_STATE, DOMAIN_ERROR_KIND, INTERNAL_ID_STRATEGY, MESSAGE_DELIVERY_STATE, MESSAGE_TYPE, MESSAGE_VISIBILITY, PLAYING_NOW_MEDIA_TYPE, REASON_CODES, SPARK_STATE, TRUST_SIGNAL_TYPE, isSupportedMessageType } from '../../../../packages/shared/src/contracts.js'
import { syncLayerAfterMessage, syncLayerAfterTrustSignal } from './layer-service.js'
import { getVisibleProfileForRelationship } from './profile-visibility-service.js'

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const toExternalConversationId = (id) => `${INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX}${id}`
const toExternalMessageId = (id) => `${INTERNAL_ID_STRATEGY.API_MESSAGE_ID_PREFIX}${id}`
const toExternalSparkId = (id) => `${INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX}${id}`
const toExternalUserId = (id) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${id}`
const stripPrefixId = (value, prefix, fieldName) => {
  const normalized = normalize(value)
  if (!normalized || !normalized.startsWith(prefix) || normalized.length <= prefix.length) {
    throw new ApiError({ message: `Invalid ${fieldName}`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  return normalized.slice(prefix.length)
}
const requireViewerId = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}
const toConversationDto = (row, visibleProfile = null) => ({ conversationId: toExternalConversationId(row.id), sparkId: toExternalSparkId(row.sparkId), state: row.state, participantIds: row.participants.map((p) => toExternalUserId(p.userId)), visibleProfile, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() })
const toMessageDto = (row) => ({ messageId: toExternalMessageId(row.id), conversationId: toExternalConversationId(row.conversationId), senderUserId: row.senderUserId ? toExternalUserId(row.senderUserId) : null, type: row.type, visibility: row.visibility, deliveryState: row.deliveryState, content: row.content, metadata: row.metadata ?? null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() })

const includeConversation = { participants: { select: { userId: true, role: true, joinedAt: true } } }
const SYSTEM_ORIGIN_MESSAGE_TYPES = new Set([MESSAGE_TYPE.SYSTEM, MESSAGE_TYPE.LAYER_UNLOCK])

const assertMessagePayload = (type, content) => {
  if (type === MESSAGE_TYPE.TEXT || type === MESSAGE_TYPE.SYSTEM) {
    if (!content || typeof content.text !== 'string' || !content.text.trim()) throw new ApiError({ message: 'Invalid message payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE, statusCode: 400 })
    return
  }
  if (type === MESSAGE_TYPE.LAYER_UNLOCK) {
    if (!content || typeof content.title !== 'string' || !content.title.trim()) throw new ApiError({ message: 'Invalid layer unlock payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE, statusCode: 400 })
    return
  }
  if (type === MESSAGE_TYPE.PLAYING_NOW) {
    if (!content || !Object.values(PLAYING_NOW_MEDIA_TYPE).includes(content.mediaType) || typeof content.title !== 'string' || !content.title.trim()) throw new ApiError({ message: 'Invalid playing now payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE, statusCode: 400 })
    return
  }
  if (type === MESSAGE_TYPE.APP_INVITE) {
    if (!content || !Object.values(APP_INVITE_APP_ID).includes(content.appId)) throw new ApiError({ message: 'Invalid app invite payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.MESSAGE.INVALID_PAYLOAD_BY_TYPE, statusCode: 400 })
  }
}

export const listViewerConversations = async ({ viewer, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const rows = await db.conversation.findMany({ where: { participants: { some: { userId } } }, include: includeConversation, orderBy: { updatedAt: 'desc' } })
  const dtoRows = await Promise.all(rows.map(async (row) => {
    const counterpart = row.participants.find((p) => p.userId !== userId)
    const visibleProfile = counterpart ? await getVisibleProfileForRelationship({ viewerUserId: userId, targetUserId: counterpart.userId, dbClient: db }) : null
    return toConversationDto(row, visibleProfile)
  }))
  return dtoRows
}

export const getViewerConversationById = async ({ viewer, conversationId, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  const row = await db.conversation.findFirst({ where: { id, participants: { some: { userId } } }, include: includeConversation })
  if (!row) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const counterpart = row.participants.find((p) => p.userId !== userId)
  const visibleProfile = counterpart ? await getVisibleProfileForRelationship({ viewerUserId: userId, targetUserId: counterpart.userId, dbClient: db }) : null
  return toConversationDto(row, visibleProfile)
}

export const createConversationFromSpark = async ({ viewer, payload, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const sparkId = stripPrefixId(payload?.sparkId, INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX, 'sparkId')
  const spark = await db.spark.findFirst({ where: { id: sparkId, status: { in: [SPARK_STATE.ACCEPTED, SPARK_STATE.PAUSED] }, OR: [{ initiatorUserId: userId }, { recipientUserId: userId }] } })
  if (!spark) throw new ApiError({ message: 'Invalid Spark for conversation', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.INVALID_SPARK_REFERENCE, statusCode: 404 })
  const existing = await db.conversation.findUnique({ where: { sparkId }, include: includeConversation })
  if (existing) return toConversationDto(existing)
  try {
    const created = await db.conversation.create({ data: { sparkId, state: spark.status === SPARK_STATE.PAUSED ? CONVERSATION_STATE.PAUSED : CONVERSATION_STATE.ACTIVE, participants: { create: [{ userId: spark.initiatorUserId, role: CONVERSATION_PARTICIPANT_ROLE.MEMBER }, { userId: spark.recipientUserId, role: CONVERSATION_PARTICIPANT_ROLE.MEMBER }] } }, include: includeConversation })
    return toConversationDto(created)
  } catch (error) {
    if (error?.code === 'P2002') {
      const raced = await db.conversation.findUnique({ where: { sparkId }, include: includeConversation })
      if (raced) return toConversationDto(raced)
    }
    throw error
  }
}

export const listConversationMessages = async ({ viewer, conversationId, cursor, limit = 30, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  const convo = await db.conversation.findFirst({ where: { id, participants: { some: { userId } } }, select: { id: true } })
  if (!convo) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const take = Math.min(Math.max(Number(limit) || 30, 1), 50)
  const cursorId = cursor ? stripPrefixId(cursor, INTERNAL_ID_STRATEGY.API_MESSAGE_ID_PREFIX, 'cursor') : null
  if (cursorId) {
    const cursorRow = await db.message.findFirst({ where: { id: cursorId, conversationId: id }, select: { id: true } })
    if (!cursorRow) throw new ApiError({ message: 'Invalid cursor for conversation', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  const rows = await db.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' }, take, ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}) })
  const nextCursor = rows.length === take ? toExternalMessageId(rows[rows.length - 1].id) : null
  return { items: rows.map(toMessageDto), page: { limit: take, nextCursor } }
}

export const sendConversationMessage = async ({ viewer, conversationId, payload, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  const convo = await db.conversation.findFirst({ where: { id, participants: { some: { userId } } }, select: { id: true } })
  if (!convo) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const type = normalize(payload?.type)
  if (!isSupportedMessageType(type)) throw new ApiError({ message: 'Invalid message type', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.MESSAGE.INVALID_TYPE, statusCode: 400 })
  if (SYSTEM_ORIGIN_MESSAGE_TYPES.has(type)) throw new ApiError({ message: 'System message types are service-origin only', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: REASON_CODES.PERMISSION.NOT_ALLOWED, statusCode: 403 })
  assertMessagePayload(type, payload?.content)
  const row = await db.message.create({ data: { conversationId: id, senderUserId: userId, type, visibility: MESSAGE_VISIBILITY.CONVERSATION, deliveryState: MESSAGE_DELIVERY_STATE.SENT, content: payload.content, metadata: payload.metadata || null } })
  if (type === MESSAGE_TYPE.TEXT) await syncLayerAfterMessage({ conversationId: id, senderUserId: userId, messageText: payload?.content?.text, dbClient: db })
  if (type === MESSAGE_TYPE.PLAYING_NOW && payload?.content?.title?.trim()) await syncLayerAfterTrustSignal({ conversationId: id, signalType: TRUST_SIGNAL_TYPE.PLAYING_NOW_SHARED, dbClient: db })
  return toMessageDto(row)
}
