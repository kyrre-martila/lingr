import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { CONVERSATION_SAFETY_REASON, DOMAIN_ERROR_KIND, INTERNAL_ID_STRATEGY, MODERATION_EVENT_TYPE, REASON_CODES, USER_REPORT_CATEGORY } from '../../../../packages/shared/src/contracts.js'

const normalize = (v) => typeof v === 'string' ? v.trim() : ''
const stripPrefixId = (value, prefix, fieldName) => {
  const n = normalize(value)
  if (!n || !n.startsWith(prefix) || n.length <= prefix.length) throw new ApiError({ message: `Invalid ${fieldName}`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  return n.slice(prefix.length)
}
const requireViewerId = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}
export const assertNoUserInteractionBlock = async ({ db, actorUserId, targetUserId }) => {
  if (!db?.blockRelation?.findFirst) return
  const blocked = await db.blockRelation.findFirst({ where: { OR: [{ blockerUserId: actorUserId, blockedUserId: targetUserId }, { blockerUserId: targetUserId, blockedUserId: actorUserId }] }, select: { id: true } })
  if (blocked) throw new ApiError({ message: 'Interaction unavailable', kind: DOMAIN_ERROR_KIND.SAFETY, reasonCode: REASON_CODES.BLOCK.USER_BLOCKED, statusCode: 403 })
}
export const assertConversationInteractive = async ({ db, conversationId }) => {
  if (!db?.conversationSafetyState?.findUnique) return
  const state = await db.conversationSafetyState.findUnique({ where: { conversationId } })
  if (state?.isPaused) throw new ApiError({ message: 'Conversation is paused', kind: DOMAIN_ERROR_KIND.SAFETY, reasonCode: REASON_CODES.SAFETY.PAUSED_FOR_SAFETY, statusCode: 403 })
}

export const blockUser = async ({ viewer, payload, dbClient }) => {
  const actorUserId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const targetUserId = stripPrefixId(payload?.targetUserId, INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX, 'targetUserId')
  if (targetUserId === actorUserId) throw new ApiError({ message: 'Invalid targetUserId', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  await db.blockRelation.upsert({ where: { blockerUserId_blockedUserId: { blockerUserId: actorUserId, blockedUserId: targetUserId } }, create: { blockerUserId: actorUserId, blockedUserId: targetUserId }, update: {} })
  const conversations = await db.conversation.findMany({ where: { participants: { some: { userId: actorUserId } }, spark: { OR: [{ initiatorUserId: targetUserId }, { recipientUserId: targetUserId }] } }, select: { id: true } })
  for (const c of conversations) {
    await db.conversation.update({ where: { id: c.id }, data: { state: 'paused' } })
    await db.conversationSafetyState.upsert({ where: { conversationId: c.id }, create: { conversationId: c.id, isPaused: true, initiatedByUserId: actorUserId, reason: CONVERSATION_SAFETY_REASON.BLOCKED_USER, pausedAt: new Date() }, update: { isPaused: true, initiatedByUserId: actorUserId, reason: CONVERSATION_SAFETY_REASON.BLOCKED_USER, pausedAt: new Date() } })
  }
  await db.moderationEvent.create({ data: { type: MODERATION_EVENT_TYPE.USER_BLOCKED, actorUserId, targetUserId, metadata: { source: 'user_action' } } })
  return { blockedUserId: payload.targetUserId, status: 'blocked' }
}

export const reportUser = async ({ viewer, payload, dbClient }) => {
  const reporterUserId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const reportedUserId = stripPrefixId(payload?.reportedUserId, INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX, 'reportedUserId')
  const category = normalize(payload?.category)
  if (!Object.values(USER_REPORT_CATEGORY).includes(category)) throw new ApiError({ message: 'Invalid report category', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const conversationId = payload?.conversationId ? stripPrefixId(payload.conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId') : null
  const note = normalize(payload?.note) || null
  const report = await db.userReport.create({ data: { reporterUserId, reportedUserId, conversationId, category, note } })
  await db.moderationEvent.create({ data: { type: MODERATION_EVENT_TYPE.USER_REPORTED, actorUserId: reporterUserId, targetUserId: reportedUserId, conversationId, metadata: { category } } })
  return { reportId: report.id, createdAt: report.createdAt.toISOString() }
}

export const pauseConversation = async ({ viewer, conversationId, payload, dbClient }) => {
  const actorUserId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  const convo = await db.conversation.findFirst({ where: { id, participants: { some: { userId: actorUserId } } }, select: { id: true } })
  if (!convo) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const reason = normalize(payload?.reason) || CONVERSATION_SAFETY_REASON.USER_PAUSED
  await db.conversation.update({ where: { id }, data: { state: 'paused' } })
  const pausedAt = new Date()
  await db.conversationSafetyState.upsert({ where: { conversationId: id }, create: { conversationId: id, isPaused: true, initiatedByUserId: actorUserId, reason, pausedAt }, update: { isPaused: true, initiatedByUserId: actorUserId, reason, pausedAt } })
  await db.moderationEvent.create({ data: { type: MODERATION_EVENT_TYPE.CONVERSATION_PAUSED, actorUserId, conversationId: id, metadata: { reason } } })
  return { conversationId, state: 'paused', reason }
}
