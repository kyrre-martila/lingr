import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import {
  APP_ID,
  APP_LIFECYCLE_STATE,
  DOMAIN_ERROR_KIND,
  INTERNAL_ID_STRATEGY,
  REASON_CODES
} from '../../../../packages/shared/src/contracts.js'

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
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
const toExternalSessionId = (id) => `${INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX}${id}`
const toExternalConversationId = (id) => `${INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX}${id}`
const toExternalUserId = (id) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${id}`

const assertAppId = (appId) => {
  if (!Object.values(APP_ID).includes(appId)) {
    throw new ApiError({ message: 'Invalid appId', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }
}

const assertConversationParticipant = async ({ db, conversationId, userId }) => {
  const participant = await db.conversationParticipant.findFirst({ where: { conversationId, userId }, select: { id: true } })
  if (!participant) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
}

const toDto = (row) => ({
  appSessionId: toExternalSessionId(row.id),
  conversationId: toExternalConversationId(row.conversationId),
  appId: row.appId,
  lifecycle: row.lifecycle,
  invitedByUserId: toExternalUserId(row.invitedByUserId),
  acceptedByUserId: row.acceptedByUserId ? toExternalUserId(row.acceptedByUserId) : null,
  completedByUserId: row.completedByUserId ? toExternalUserId(row.completedByUserId) : null,
  dismissedByUserId: row.dismissedByUserId ? toExternalUserId(row.dismissedByUserId) : null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
})

export const inviteChatApp = async ({ viewer, payload, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const conversationId = stripPrefixId(payload?.conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  assertAppId(payload?.appId)
  await assertConversationParticipant({ db, conversationId, userId })
  const row = await db.appSession.create({ data: { conversationId, appId: payload.appId, lifecycle: APP_LIFECYCLE_STATE.INVITE, invitedByUserId: userId } })
  return toDto(row)
}

const transition = async ({ viewer, appSessionId, nextState, fieldName, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const existing = await db.appSession.findUnique({ where: { id } })
  if (!existing) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: existing.conversationId, userId })
  const row = await db.appSession.update({ where: { id }, data: { lifecycle: nextState, [fieldName]: userId } })
  return toDto(row)
}

export const acceptChatAppInvite = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.ACTIVE, fieldName: 'acceptedByUserId', dbClient })
export const completeChatAppSession = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.COMPLETE, fieldName: 'completedByUserId', dbClient })
export const dismissChatAppSession = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.DISMISSED, fieldName: 'dismissedByUserId', dbClient })
