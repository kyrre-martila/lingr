import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, REGION_LAUNCH_STATUS, REGION_REASON_CODES, REASON_CODES } from '../../../../packages/shared/src/contracts.js'

const normalizeCode = (value) => String(value || '').trim().toUpperCase()
const normalizeLocale = (value) => String(value || 'en').trim() || 'en'

export const listCountries = async ({ dbClient } = {}) => {
  const db = dbClient || await getDbClient()
  const countries = await db.country.findMany({ where: { enabled: true }, orderBy: { name: 'asc' } })
  return { countries: countries.map((c) => ({ id: c.id, isoCode: c.isoCode, name: c.name, enabled: c.enabled })) }
}

export const listRegionsByCountry = async ({ countryCode, locale = 'en', dbClient }) => {
  const db = dbClient || await getDbClient()
  const isoCode = normalizeCode(countryCode)
  const country = await db.country.findUnique({ where: { isoCode } })
  if (!country) throw new ApiError({ message: 'Invalid country code', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 404 })
  const regions = await db.region.findMany({ where: { countryId: country.id }, orderBy: { name: 'asc' } })
  return {
    country: { isoCode: country.isoCode, name: country.name, enabled: country.enabled },
    locale: normalizeLocale(locale),
    regions: regions.map((r) => ({ id: r.id, slug: r.slug, name: r.name, launchStatus: r.launchStatus, launchDate: r.launchDate?.toISOString() || null, isOpen: r.isOpen, voteCount: r.voteCount }))
  }
}

export const checkRegionAvailability = async ({ countryCode, regionSlug, dbClient }) => {
  const db = dbClient || await getDbClient()
  const isoCode = normalizeCode(countryCode)
  const slug = String(regionSlug || '').trim().toLowerCase()
  const region = await db.region.findFirst({ where: { slug, country: { isoCode } }, include: { country: true } })
  if (!region) return { canRegister: false, reasonCode: REGION_REASON_CODES.INVALID }
  const reasonCode = region.launchStatus === REGION_LAUNCH_STATUS.OPEN ? REGION_REASON_CODES.OPEN : (region.launchStatus === REGION_LAUNCH_STATUS.WAITLIST ? REGION_REASON_CODES.WAITLIST : REGION_REASON_CODES.CLOSED)
  return { canRegister: region.launchStatus === REGION_LAUNCH_STATUS.OPEN && region.isOpen, reasonCode, region: { id: region.id, slug: region.slug, name: region.name, launchStatus: region.launchStatus } }
}

export const voteForRegion = async ({ countryCode, regionSlug, email, firstName, locale = 'en', dbClient }) => {
  const db = dbClient || await getDbClient()
  const availability = await checkRegionAvailability({ countryCode, regionSlug, dbClient: db })
  if (!availability.region) throw new ApiError({ message: 'Invalid region', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REGION_REASON_CODES.INVALID, statusCode: 404 })
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail.includes('@')) throw new ApiError({ message: 'Invalid email', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })

  const vote = await db.regionInterestVote.upsert({
    where: { regionId_email: { regionId: availability.region.id, email: normalizedEmail } },
    create: { regionId: availability.region.id, email: normalizedEmail, firstName: firstName ? String(firstName).trim().slice(0, 120) : null, locale: normalizeLocale(locale) },
    update: { firstName: firstName ? String(firstName).trim().slice(0, 120) : null, locale: normalizeLocale(locale) }
  })

  await db.region.update({ where: { id: availability.region.id }, data: { voteCount: await db.regionInterestVote.count({ where: { regionId: availability.region.id } }) } })
  return { ok: true, voteId: vote.id, reasonCode: availability.reasonCode }
}
