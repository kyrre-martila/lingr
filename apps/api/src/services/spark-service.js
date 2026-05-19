import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, INTERNAL_ID_STRATEGY, REASON_CODES, SPARK_ACTION, SPARK_ACTIVE_STATES, SPARK_STATE, SPARK_TERMINAL_STATES, SPARK_TRANSITIONS } from '../../../../packages/shared/src/contracts.js'
import { syncLayerAfterMutualSpark } from './layer-service.js'

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const toExternalSparkId = (id) => `${INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX}${id}`
const stripPrefixId = (value, prefix, fieldName) => {
  const normalized = normalize(value)
  if (!normalized || !normalized.startsWith(prefix) || normalized.length <= prefix.length) {
    throw new ApiError({ message: `Invalid ${fieldName}`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  return normalized.slice(prefix.length)
}
const parseInternalSparkId = (sparkId) => stripPrefixId(sparkId, INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX, 'sparkId')
const parseInternalUserId = (userId) => stripPrefixId(userId, INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX, 'recipientUserId')
const parseInternalGlimpsId = (glimpsId) => stripPrefixId(glimpsId, INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX, 'sourceGlimpsId')

const requireAuthenticatedViewer = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required for spark mutations', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}

const assertActionPermission = ({ action, row, actorUserId }) => {
  const isInitiator = row.initiatorUserId === actorUserId
  const isRecipient = row.recipientUserId === actorUserId
  const allow = action === SPARK_ACTION.ACCEPT
    ? isRecipient
    : action === SPARK_ACTION.PAUSE || action === SPARK_ACTION.DECLINE || action === SPARK_ACTION.READ
      ? (isInitiator || isRecipient)
      : false
  if (!allow) throw new ApiError({ message: `Actor cannot ${action} this Spark`, kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: REASON_CODES.PERMISSION.NOT_ALLOWED, statusCode: 403 })
}

const assertTransitionAllowed = (currentStatus, nextStatus) => {
  if (SPARK_TERMINAL_STATES.includes(currentStatus)) {
    throw new ApiError({ message: 'Spark is in terminal state', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.INVALID_STATE_TRANSITION, statusCode: 409 })
  }
  const allowed = SPARK_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(nextStatus)) {
    throw new ApiError({ message: 'Invalid Spark state transition', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.INVALID_STATE_TRANSITION, statusCode: 409 })
  }
}

const toClientSpark = (row) => ({ sparkId: toExternalSparkId(row.id), initiatorUserId: `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${row.initiatorUserId}`, recipientUserId: `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${row.recipientUserId}`, status: row.status, sourceGlimpsId: row.sourceGlimpsId ? `${INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX}${row.sourceGlimpsId}` : null, softResonanceContext: row.softResonanceContext || null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null, pausedAt: row.pausedAt ? row.pausedAt.toISOString() : null, declinedAt: row.declinedAt ? row.declinedAt.toISOString() : null, expiredAt: row.expiredAt ? row.expiredAt.toISOString() : null })

const canonicalPairFor = (leftUserId, rightUserId) => (leftUserId < rightUserId ? [leftUserId, rightUserId] : [rightUserId, leftUserId])

export const createSparkInvitation = async ({ viewer, payload, dbClient }) => {
  const initiatorUserId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  if (!payload?.recipientUserId) throw new ApiError({ message: 'recipientUserId is required', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const recipientUserId = parseInternalUserId(payload.recipientUserId)
  if (recipientUserId === initiatorUserId) throw new ApiError({ message: 'Cannot create Spark with self', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.SPARK.INVALID_SELF_SPARK, statusCode: 400 })

  const recipient = await db.user.findUnique({ where: { id: recipientUserId }, select: { id: true } })
  if (!recipient) throw new ApiError({ message: 'Recipient not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.INVALID_RECIPIENT_REFERENCE, statusCode: 404 })

  const sourceGlimpsId = payload?.sourceGlimpsId ? parseInternalGlimpsId(payload.sourceGlimpsId) : null
  if (sourceGlimpsId) {
    const source = await db.glimps.findUnique({ where: { id: sourceGlimpsId }, select: { id: true, userId: true, privacy: true } })
    if (!source) throw new ApiError({ message: 'Source Glimps not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.INVALID_SOURCE_GLIMPS_REFERENCE, statusCode: 404 })
    const recipientCanUse = source.userId === recipientUserId && source.privacy !== 'private'
    if (!(source.userId === initiatorUserId || recipientCanUse)) {
      throw new ApiError({ message: 'Source Glimps is not visible to actor pair', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: REASON_CODES.SPARK.INVALID_SOURCE_GLIMPS_REFERENCE, statusCode: 403 })
    }
  }

  const [pairMinUserId, pairMaxUserId] = canonicalPairFor(initiatorUserId, recipientUserId)
  const softResonanceContext = normalize(payload.softResonanceContext) || null
  try {
    const row = await db.spark.create({ data: { initiatorUserId, recipientUserId, pairMinUserId, pairMaxUserId, status: SPARK_STATE.INVITED, sourceGlimpsId, softResonanceContext } })
    return toClientSpark(row)
  } catch (error) {
    if (error?.code === 'P2002') throw new ApiError({ message: 'Active Spark already exists between users', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.DUPLICATE_ACTIVE_SPARK, statusCode: 409 })
    throw error
  }
}

export const listViewerSparks = async ({ viewer, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const now = new Date()
  await db.spark.updateMany({ where: { status: SPARK_STATE.INVITED, expiresAt: { lte: now } }, data: { status: SPARK_STATE.EXPIRED, expiredAt: now } })
  const rows = await db.spark.findMany({ where: { OR: [{ initiatorUserId: userId }, { recipientUserId: userId }] }, orderBy: { createdAt: 'desc' } })
  return rows.map(toClientSpark)
}

export const getViewerSparkById = async ({ viewer, sparkId, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const id = parseInternalSparkId(sparkId)
  const row = await db.spark.findFirst({ where: { id, OR: [{ initiatorUserId: userId }, { recipientUserId: userId }] } })
  if (!row) throw new ApiError({ message: 'Spark not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.NOT_FOUND, statusCode: 404 })
  assertActionPermission({ action: SPARK_ACTION.READ, row, actorUserId: userId })
  return toClientSpark(row)
}

const updateSparkStatus = async ({ viewer, sparkId, nextStatus, action, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const id = parseInternalSparkId(sparkId)
  const row = await db.spark.findFirst({ where: { id, OR: [{ initiatorUserId: userId }, { recipientUserId: userId }] } })
  if (!row) throw new ApiError({ message: 'Spark not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.NOT_FOUND, statusCode: 404 })
  assertActionPermission({ action, row, actorUserId: userId })
  if (row.status === nextStatus) return toClientSpark(row)
  assertTransitionAllowed(row.status, nextStatus)

  const now = new Date()
  const data = { status: nextStatus, updatedAt: now }
  if (nextStatus === SPARK_STATE.ACCEPTED) data.respondedAt = now
  if (nextStatus === SPARK_STATE.PAUSED) data.pausedAt = now
  if (nextStatus === SPARK_STATE.DECLINED) data.declinedAt = now
  const updated = await db.spark.update({ where: { id }, data })
  if (nextStatus === SPARK_STATE.ACCEPTED) {
    await syncLayerAfterMutualSpark({ spark: updated, dbClient: db })
  }
  return toClientSpark(updated)
}

export const acceptSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.ACCEPTED, action: SPARK_ACTION.ACCEPT })
export const pauseSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.PAUSED, action: SPARK_ACTION.PAUSE })
export const declineSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.DECLINED, action: SPARK_ACTION.DECLINE })
