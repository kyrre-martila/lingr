import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { ACCOUNT_LIFECYCLE_STATE, DISCOVERY_LIMIT_PER_DAY, DISCOVERY_REASON_CODES, DISCOVERY_STATE, DOMAIN_ERROR_KIND, INTERNAL_ID_STRATEGY, REASON_CODES, SPARK_ACTIVE_STATES } from '../../../../packages/shared/src/contracts.js'
import { createSparkInvitation } from './spark-service.js'

const toExternalUserId = (id) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${id}`
const utcDayKey = (date = new Date()) => date.toISOString().slice(0, 10)
const DISCOVERY_NOT_NOW_COOLDOWN_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000
const requireViewerId = (viewer) => {
  const userId = viewer?.identity?.userId
  if (!userId) throw new ApiError({ message: 'Authentication required for discovery', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}

const assertViewerReadiness = (viewer) => {
  if (viewer?.lifecycleState === ACCOUNT_LIFECYCLE_STATE.ONBOARDING) throw new ApiError({ message: 'Onboarding is required', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: DISCOVERY_REASON_CODES.ONBOARDING_REQUIRED, statusCode: 403 })
  if (viewer?.lifecycleState !== ACCOUNT_LIFECYCLE_STATE.ACTIVE) throw new ApiError({ message: 'Discovery unavailable', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: DISCOVERY_REASON_CODES.PROFILE_INCOMPLETE, statusCode: 403 })
}

const toDiscoveryDto = (row) => ({
  userId: toExternalUserId(row.id),
  displayName: row.profile?.displayName || 'Someone nearby',
  locationRegion: row.profile?.locationRegion || null,
  layersSummary: row.profile?.layersSummary || null,
  bio: row.profile?.bio || null,
  glimpses: row.glimpses.slice(0, 2).map((g) => ({ glimpsId: `${INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX}${g.id}`, reflection: g.reflection, mood: g.mood, prompt: g.prompt || null, emotionalTone: g.emotionalTone }))
})

const getTodayTracker = async ({ db, viewerUserId, dayKey }) => {
  const found = await db.discoveryDailyTracker.findUnique({ where: { viewerUserId_dayKey: { viewerUserId, dayKey } } })
  if (found) return found
  return db.discoveryDailyTracker.create({ data: { viewerUserId, dayKey, introducedCount: 0 } })
}

export const getRemainingDiscoveryCount = async ({ viewer, dbClient, now = new Date() }) => {
  const viewerUserId = requireViewerId(viewer)
  assertViewerReadiness(viewer)
  const db = dbClient || await getDbClient()
  const tracker = await getTodayTracker({ db, viewerUserId, dayKey: utcDayKey(now) })
  return Math.max(DISCOVERY_LIMIT_PER_DAY - tracker.introducedCount, 0)
}

export const getDailyDiscovery = async ({ viewer, dbClient, now = new Date() }) => {
  const viewerUserId = requireViewerId(viewer)
  assertViewerReadiness(viewer)
  const db = dbClient || await getDbClient()
  const dayKey = utcDayKey(now)
  const tracker = await getTodayTracker({ db, viewerUserId, dayKey })
  const remaining = Math.max(DISCOVERY_LIMIT_PER_DAY - tracker.introducedCount, 0)
  if (remaining <= 0) return { state: DISCOVERY_STATE.LIMIT_REACHED, reasonCode: DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED, limitPerDay: DISCOVERY_LIMIT_PER_DAY, remaining, introductions: [] }

  const viewerProfile = await db.profile.findUnique({ where: { userId: viewerUserId }, select: { locationRegion: true } })
  const region = viewerProfile?.locationRegion || null
  if (!region) return { state: DISCOVERY_STATE.UNAVAILABLE, reasonCode: DISCOVERY_REASON_CODES.UNAVAILABLE_REGION, limitPerDay: DISCOVERY_LIMIT_PER_DAY, remaining, introductions: [] }

  const blocked = await db.blockRelation.findMany({ where: { OR: [{ blockerUserId: viewerUserId }, { blockedUserId: viewerUserId }] }, select: { blockerUserId: true, blockedUserId: true } })
  const blockedSet = new Set(blocked.map((b) => (b.blockerUserId === viewerUserId ? b.blockedUserId : b.blockerUserId)))
  const seen = await db.discoveryView.findMany({ where: { viewerUserId }, select: { discoveredUserId: true, createdAt: true } })
  const seenSet = new Set(seen.filter((s) => now.getTime() - new Date(s.createdAt).getTime() < (DISCOVERY_NOT_NOW_COOLDOWN_DAYS * DAY_MS)).map((s) => s.discoveredUserId))
  const sparkRows = await db.spark.findMany({ where: { status: { in: SPARK_ACTIVE_STATES }, OR: [{ initiatorUserId: viewerUserId }, { recipientUserId: viewerUserId }] }, select: { initiatorUserId: true, recipientUserId: true } })
  const sparkSet = new Set(sparkRows.map((s) => (s.initiatorUserId === viewerUserId ? s.recipientUserId : s.initiatorUserId)))

  const people = await db.user.findMany({
    where: {
      id: { not: viewerUserId },
      status: 'active',
      profile: { is: { locationRegion: region } }
    },
    include: { profile: true, glimpses: { where: { state: 'published' }, orderBy: { createdAt: 'desc' }, take: 2 } },
    orderBy: { createdAt: 'asc' },
    take: 20
  })

  const filtered = people.filter((p) => !blockedSet.has(p.id) && !sparkSet.has(p.id) && !seenSet.has(p.id)).slice(0, remaining)
  if (!filtered.length) return { state: DISCOVERY_STATE.EMPTY, reasonCode: DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE, limitPerDay: DISCOVERY_LIMIT_PER_DAY, remaining, introductions: [] }

  return { state: DISCOVERY_STATE.READY, reasonCode: null, limitPerDay: DISCOVERY_LIMIT_PER_DAY, remaining, notNowCooldownDays: DISCOVERY_NOT_NOW_COOLDOWN_DAYS, introductions: filtered.map(toDiscoveryDto) }
}

export const dismissIntroduction = async ({ viewer, discoveredUserId, dbClient, now = new Date() }) => {
  const viewerUserId = requireViewerId(viewer)
  assertViewerReadiness(viewer)
  const db = dbClient || await getDbClient()
  const dayKey = utcDayKey(now)
  const tracker = await getTodayTracker({ db, viewerUserId, dayKey })
  if (tracker.introducedCount >= DISCOVERY_LIMIT_PER_DAY) throw new ApiError({ message: 'Daily discovery limit reached', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED, statusCode: 403 })
  await db.discoveryView.upsert({ where: { viewerUserId_discoveredUserId: { viewerUserId, discoveredUserId } }, create: { viewerUserId, discoveredUserId, firstSeenDayKey: dayKey }, update: {} })
  await db.discoveryDailyTracker.update({ where: { id: tracker.id }, data: { introducedCount: { increment: 1 } } })
  return { ok: true }
}

export const createSparkFromDiscovery = async ({ viewer, discoveredUserId, dbClient, now = new Date() }) => {
  const db = dbClient || await getDbClient()
  await dismissIntroduction({ viewer, discoveredUserId, dbClient: db, now })
  try {
    return { spark: await createSparkInvitation({ viewer, payload: { recipientUserId: toExternalUserId(discoveredUserId) }, dbClient: db }), state: 'sent' }
  } catch (error) {
    if (!(error instanceof ApiError) || error.reasonCode !== REASON_CODES.SPARK.DUPLICATE_ACTIVE_SPARK) throw error
    return { spark: null, state: 'already_exists' }
  }
}
