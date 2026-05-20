import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { Prisma } from '@prisma/client'
import { DOMAIN_ERROR_KIND, REASON_CODES, ACCOUNT_LIFECYCLE_STATE, INTERNAL_ID_STRATEGY } from '../../../../packages/shared/src/contracts.js'

const toLifecycleState = (status) => {
  if (status === 'paused') return ACCOUNT_LIFECYCLE_STATE.PAUSED
  if (status === 'deleted') return ACCOUNT_LIFECYCLE_STATE.DELETED
  if (status === 'restricted') return ACCOUNT_LIFECYCLE_STATE.RESTRICTED
  return ACCOUNT_LIFECYCLE_STATE.ACTIVE
}

const toExternalUserId = (internalId) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${internalId}`
const toExternalProfileId = (internalId) => `${INTERNAL_ID_STRATEGY.API_PROFILE_ID_PREFIX}${internalId}`

const toClientProfile = (user, profile) => ({
  userId: toExternalUserId(user.id),
  lifecycleState: toLifecycleState(user.status),
  profile: {
    profileId: toExternalProfileId(profile.id),
    displayName: profile.displayName,
    pronouns: profile.pronouns || null,
    ageRange: profile.ageRange || null,
    bio: profile.bio || null,
    layersSummary: profile.layersSummary || null,
    locationRegion: profile.locationRegion || null,
    avatarUrl: profile.avatarAssetId ? `/assets/${profile.avatarAssetId}` : null,
    profileCompleteness: profile.profileCompleteness,
    visibility: profile.visibility,
    updatedAt: profile.updatedAt.toISOString()
  }
})

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const nullable = (value, max) => {
  const v = normalize(value)
  if (!v) return null
  if (v.length > max) {
    throw new ApiError({ message: `Field exceeds ${max} characters`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }
  return v
}

const computeCompleteness = (profile) => {
  const fields = [profile.displayName, profile.bio, profile.pronouns, profile.ageRange, profile.layersSummary, profile.locationRegion, profile.avatarAssetId]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export const getViewerUserId = (viewer) => viewer?.identity?.userId || null
const requireAuthenticatedViewer = (viewer) => {
  const userId = getViewerUserId(viewer)
  if (!userId) throw new ApiError({ message: 'Authentication required for persistence mutations', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}

export const getViewerProfile = async ({ viewer }) => {
  const userId = getViewerUserId(viewer)
  if (!userId) return null
  const db = await getDbClient()
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return null
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return null
  return toClientProfile(user, profile)
}

export const updateViewerProfileBasics = async ({ viewer, payload }) => {
  const db = await getDbClient()
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError({ message: 'Profile payload must be a JSON object', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }

  const displayName = normalize(payload.displayName)
  if (!displayName || displayName.length > 80) {
    throw new ApiError({ message: 'displayName is required and must be <= 80 chars', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }

  const userId = requireAuthenticatedViewer(viewer)
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError({ message: 'Viewer user does not exist', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.INVALID_SESSION, statusCode: 401 })
  const profileData = {
    displayName,
    pronouns: nullable(payload.pronouns, 50),
    ageRange: nullable(payload.ageRange, 20),
    bio: nullable(payload.bio, 300),
    layersSummary: nullable(payload.layersSummary, 300),
    locationRegion: nullable(payload.locationRegion, 120),
    avatarAssetId: nullable(payload.avatarAssetId, 120)
  }
  const profileCompleteness = computeCompleteness(profileData)

  try {
    const profile = await db.profile.upsert({
      where: { userId: user.id },
      update: { ...profileData, profileCompleteness },
      create: { userId: user.id, ...profileData, visibility: 'discoverable', profileCompleteness }
    })

    return toClientProfile(user, profile)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ApiError({ message: 'Invalid profile update payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError({ message: 'Profile update failed due to invalid profile data', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
    }
    throw error
  }
}

export const getViewerProfileCompleteness = async ({ viewer }) => {
  const profileResponse = await getViewerProfile({ viewer })
  if (!profileResponse) {
    throw new ApiError({
      message: 'Profile onboarding is incomplete',
      kind: DOMAIN_ERROR_KIND.DOMAIN,
      reasonCode: REASON_CODES.DISCOVERY.PROFILE_INCOMPLETE,
      statusCode: 403,
      details: { missing: ['displayName', 'bio', 'pronouns', 'ageRange', 'layersSummary', 'locationRegion', 'avatarAssetId'] }
    })
  }

  const requiredFields = ['displayName', 'bio', 'pronouns', 'ageRange', 'layersSummary', 'locationRegion', 'avatarUrl']
  const missingFields = requiredFields.filter((field) => {
    const value = profileResponse.profile[field]
    return !value
  })

  const isComplete = missingFields.length === 0
  return {
    userId: profileResponse.userId,
    lifecycleState: profileResponse.lifecycleState,
    profileCompleteness: profileResponse.profile.profileCompleteness,
    isComplete,
    reasonCode: isComplete ? null : REASON_CODES.DISCOVERY.PROFILE_INCOMPLETE,
    requiredFields,
    missingFields,
    updatedAt: profileResponse.profile.updatedAt
  }
}
