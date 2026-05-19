import { getDbClient } from '../db/client.js'
import { INTERNAL_ID_STRATEGY } from '../../../../packages/shared/src/contracts.js'

const toExternalUserId = (internalId) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${internalId}`
const canonicalPairFor = (leftUserId, rightUserId) => (leftUserId < rightUserId ? [leftUserId, rightUserId] : [rightUserId, leftUserId])

const HIDDEN_TEXT = 'Getting to know someone takes time.'

const buildVisibleProfile = ({ userId, profile, glimpses, layerLevel }) => {
  const base = {
    userId: toExternalUserId(userId),
    layerLevel,
    revealState: `layer_${layerLevel}`,
    hiddenHint: HIDDEN_TEXT,
    profile: {
      firstName: null,
      broadRegion: null,
      exactRegion: null,
      intro: null,
      pronouns: null,
      interests: [],
      fullerBio: null,
      emotionalValues: [],
      glimpses: glimpses.map((g) => ({ reflection: g.reflection, emotionalTone: g.emotionalTone, energyTag: g.mood, prompt: null, imageNote: null }))
    }
  }

  if (layerLevel >= 1) {
    base.profile.firstName = profile?.displayName?.trim()?.split(/\s+/)[0] || null
    base.profile.broadRegion = profile?.locationRegion ? profile.locationRegion.slice(0, 5) : null
    base.profile.intro = profile?.layersSummary || null
    base.profile.glimpses = glimpses.map((g) => ({ reflection: g.reflection, emotionalTone: g.emotionalTone, energyTag: g.mood, prompt: g.prompt || null, imageNote: null }))
  }
  if (layerLevel >= 2) {
    base.profile.interests = profile?.layersSummary ? profile.layersSummary.split(/[•,]/).map((item) => item.trim()).filter(Boolean) : []
    base.profile.glimpses = glimpses.map((g) => ({ reflection: g.reflection, emotionalTone: g.emotionalTone, energyTag: g.mood, prompt: g.prompt || null, imageNote: g.imageNote || null }))
  }
  if (layerLevel >= 3) {
    base.profile.exactRegion = profile?.locationRegion || null
    base.profile.pronouns = profile?.pronouns || null
    base.profile.fullerBio = profile?.bio || null
    base.profile.emotionalValues = profile?.layersSummary ? profile.layersSummary.split(/[•,]/).map((item) => item.trim()).filter(Boolean) : []
  }

  return base
}

export const getVisibleProfileForRelationship = async ({ viewerUserId, targetUserId, dbClient }) => {
  const db = dbClient || await getDbClient()
  const [primaryUserId, secondaryUserId] = canonicalPairFor(viewerUserId, targetUserId)
  const [layerState, profile, glimpses] = await Promise.all([
    db.relationshipLayer.findUnique({ where: { primaryUserId_secondaryUserId: { primaryUserId, secondaryUserId } }, select: { currentLayer: true } }),
    db.profile.findUnique({ where: { userId: targetUserId } }),
    db.glimps.findMany({ where: { userId: targetUserId, state: 'published' }, orderBy: { createdAt: 'desc' }, take: 4 })
  ])
  const layerLevel = Math.max(0, Math.min(3, layerState?.currentLayer || 0))
  return buildVisibleProfile({ userId: targetUserId, profile, glimpses, layerLevel })
}
