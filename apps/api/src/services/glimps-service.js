import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, GLIMPS_EMOTIONAL_TONE, GLIMPS_PRIVACY_LEVEL, GLIMPS_STATE, INTERNAL_ID_STRATEGY, REASON_CODES } from '../../../../packages/shared/src/contracts.js'

const MAX_REFLECTION = 280
const MAX_MOOD = 80
const MAX_PROMPT = 160
const MAX_IMAGE_NOTE = 160
const MAX_PRIVACY = 40
const MAX_EMOTIONAL_TONE = 40

const GLIMPS_STATES = new Set(Object.values(GLIMPS_STATE))
const GLIMPS_PRIVACY = new Set(Object.values(GLIMPS_PRIVACY_LEVEL))
const GLIMPS_TONES = new Set(Object.values(GLIMPS_EMOTIONAL_TONE))

const toExternalGlimpsId = (internalId) => `${INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX}${internalId}`
const normalize = (value) => (typeof value === 'string' ? value.trim() : '')

const requireAuthenticatedViewer = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required for persistence mutations', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}

const requireLength = (value, field, max, { required = false } = {}) => {
  const normalized = normalize(value)
  if (!normalized && required) {
    throw new ApiError({ message: `${field} is required`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }
  if (normalized.length > max) {
    throw new ApiError({ message: `${field} exceeds ${max} characters`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }
  return normalized || null
}

const toClientGlimps = (row) => ({
  glimpsId: toExternalGlimpsId(row.id),
  userId: `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${row.userId}`,
  reflection: row.reflection,
  mood: row.mood,
  prompt: row.prompt || null,
  imageNote: row.imageNote || null,
  privacy: row.privacy,
  emotionalTone: row.emotionalTone,
  state: row.state,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null
})

const parseInternalGlimpsId = (glimpsId) => {
  const normalized = normalize(glimpsId)
  if (!normalized.startsWith(INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX) || normalized.length <= 4) {
    throw new ApiError({ message: 'Invalid glimpsId', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  return normalized.slice(INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX.length)
}

export const createGlimps = async ({ viewer, payload, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const reflection = requireLength(payload.reflection, 'reflection', MAX_REFLECTION, { required: true })
  const mood = requireLength(payload.mood, 'mood', MAX_MOOD, { required: true })
  const prompt = requireLength(payload.prompt, 'prompt', MAX_PROMPT)
  const imageNote = requireLength(payload.imageNote, 'imageNote', MAX_IMAGE_NOTE)
  const privacy = requireLength(payload.privacy, 'privacy', MAX_PRIVACY, { required: true })
  const emotionalTone = requireLength(payload.emotionalTone, 'emotionalTone', MAX_EMOTIONAL_TONE, { required: true })
  const state = requireLength(payload.state, 'state', 40, { required: true })

  if (!GLIMPS_STATES.has(state) || !GLIMPS_PRIVACY.has(privacy) || !GLIMPS_TONES.has(emotionalTone)) {
    throw new ApiError({ message: 'Invalid Glimps enum value', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }

  const row = await db.glimps.create({ data: { userId, reflection, mood, prompt, imageNote, privacy, emotionalTone, state } })
  return toClientGlimps(row)
}

export const listViewerGlimps = async ({ viewer, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const rows = await db.glimps.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return rows.map(toClientGlimps)
}

export const getViewerGlimpsById = async ({ viewer, glimpsId, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const id = parseInternalGlimpsId(glimpsId)
  const row = await db.glimps.findFirst({ where: { id, userId } })
  if (!row) throw new ApiError({ message: 'Glimps not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.GLIMPS.NOT_FOUND, statusCode: 404 })
  return toClientGlimps(row)
}

export const archiveViewerGlimps = async ({ viewer, glimpsId, dbClient }) => {
  const userId = requireAuthenticatedViewer(viewer)
  const db = dbClient || await getDbClient()
  const id = parseInternalGlimpsId(glimpsId)
  const row = await db.glimps.findFirst({ where: { id, userId } })
  if (!row) throw new ApiError({ message: 'Glimps not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.GLIMPS.NOT_FOUND, statusCode: 404 })
  if (row.state === GLIMPS_STATE.ARCHIVED) return toClientGlimps(row)

  const archivedAt = new Date()
  const updated = await db.glimps.update({ where: { id }, data: { state: GLIMPS_STATE.ARCHIVED, archivedAt } })
  return toClientGlimps(updated)
}
