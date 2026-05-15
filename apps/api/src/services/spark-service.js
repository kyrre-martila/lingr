import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, INTERNAL_ID_STRATEGY, REASON_CODES, SPARK_STATE } from '../../../../packages/shared/src/contracts.js'

const SPARK_STATES = new Set(Object.values(SPARK_STATE))
const ACTIVE_STATES = new Set([SPARK_STATE.INVITED, SPARK_STATE.ACCEPTED, SPARK_STATE.PAUSED])
const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const toExternalSparkId = (id) => `${INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX}${id}`

const requireAuthenticatedViewer = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required for spark mutations', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}

const parseInternalSparkId = (sparkId) => {
  const normalized = normalize(sparkId)
  if (!normalized.startsWith(INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX) || normalized.length <= INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX.length) {
    throw new ApiError({ message: 'Invalid sparkId', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  return normalized.slice(INTERNAL_ID_STRATEGY.API_SPARK_ID_PREFIX.length)
}

const toClientSpark = (row) => ({
  sparkId: toExternalSparkId(row.id),
  initiatorUserId: `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${row.initiatorUserId}`,
  recipientUserId: `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${row.recipientUserId}`,
  status: row.status,
  sourceGlimpsId: row.sourceGlimpsId ? `${INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX}${row.sourceGlimpsId}` : null,
  softResonanceContext: row.softResonanceContext || null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null,
  pausedAt: row.pausedAt ? row.pausedAt.toISOString() : null,
  declinedAt: row.declinedAt ? row.declinedAt.toISOString() : null,
  expiredAt: row.expiredAt ? row.expiredAt.toISOString() : null
})

export const createSparkInvitation = async ({ viewer, payload, dbClient }) => {
  const initiatorUserId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const recipientUserId = normalize(payload.recipientUserId)
  if (!recipientUserId) throw new ApiError({ message: 'recipientUserId is required', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  if (recipientUserId === initiatorUserId) throw new ApiError({ message: 'Cannot create Spark with self', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.SPARK.INVALID_SELF_SPARK, statusCode: 400 })

  const existing = await db.spark.findFirst({
    where: {
      OR: [
        { initiatorUserId, recipientUserId },
        { initiatorUserId: recipientUserId, recipientUserId: initiatorUserId }
      ],
      status: { in: Array.from(ACTIVE_STATES) }
    }
  })
  if (existing) throw new ApiError({ message: 'Active Spark already exists between users', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.DUPLICATE_ACTIVE_SPARK, statusCode: 409 })

  const sourceGlimpsId = normalize(payload.sourceGlimpsId) || null
  const softResonanceContext = normalize(payload.softResonanceContext) || null
  const row = await db.spark.create({ data: { initiatorUserId, recipientUserId, status: SPARK_STATE.INVITED, sourceGlimpsId, softResonanceContext } })
  return toClientSpark(row)
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
  return toClientSpark(row)
}

const updateSparkStatus = async ({ viewer, sparkId, nextStatus, allowRecipientOnly = false, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const id = parseInternalSparkId(sparkId)
  const row = await db.spark.findFirst({ where: { id, OR: [{ initiatorUserId: userId }, { recipientUserId: userId }] } })
  if (!row) throw new ApiError({ message: 'Spark not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.NOT_FOUND, statusCode: 404 })
  if (allowRecipientOnly && row.recipientUserId !== userId) throw new ApiError({ message: 'Only recipient can accept Spark', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: REASON_CODES.PERMISSION.NOT_ALLOWED, statusCode: 403 })
  if (!SPARK_STATES.has(row.status) || [SPARK_STATE.DECLINED, SPARK_STATE.EXPIRED].includes(row.status)) throw new ApiError({ message: 'Invalid Spark state transition', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.SPARK.INVALID_STATE_TRANSITION, statusCode: 409 })
  if (row.status === nextStatus) return toClientSpark(row)

  const now = new Date()
  const data = { status: nextStatus, updatedAt: now }
  if (nextStatus === SPARK_STATE.ACCEPTED) data.respondedAt = now
  if (nextStatus === SPARK_STATE.PAUSED) data.pausedAt = now
  if (nextStatus === SPARK_STATE.DECLINED) data.declinedAt = now
  const updated = await db.spark.update({ where: { id }, data })
  return toClientSpark(updated)
}

export const acceptSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.ACCEPTED, allowRecipientOnly: true })
export const pauseSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.PAUSED })
export const declineSpark = (args) => updateSparkStatus({ ...args, nextStatus: SPARK_STATE.DECLINED })
