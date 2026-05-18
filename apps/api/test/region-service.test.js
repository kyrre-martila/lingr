import test from 'node:test'
import assert from 'node:assert/strict'
import { REGION_REASON_CODES } from '../../../packages/shared/src/contracts.js'
import { checkRegionAvailability, listRegionsByCountry, voteForRegion } from '../src/services/region-service.js'

const mockDb = () => ({
  country: {
    findMany: async () => [],
    findUnique: async ({ where }) => where.isoCode === 'NO' ? { id: 'c1', isoCode: 'NO', name: 'Norway', enabled: true } : null
  },
  region: {
    findMany: async () => [{ id: 'r1', slug: 'trondelag', name: 'Trøndelag', launchStatus: 'open', launchDate: null, isOpen: true, voteCount: 2 }],
    findFirst: async ({ where }) => (where.slug === 'trondelag' ? { id: 'r1', slug: 'trondelag', name: 'Trøndelag', launchStatus: 'open', isOpen: true, country: { isoCode: 'NO' } } : null),
    update: async () => ({})
  },
  regionInterestVote: {
    upsert: async () => ({ id: 'v1' }),
    count: async () => 3
  }
})

test('open region path allows registration', async () => {
  const result = await checkRegionAvailability({ countryCode: 'NO', regionSlug: 'trondelag', dbClient: mockDb() })
  assert.equal(result.canRegister, true)
  assert.equal(result.reasonCode, REGION_REASON_CODES.OPEN)
})

test('unavailable region path returns invalid reason', async () => {
  const result = await checkRegionAvailability({ countryCode: 'NO', regionSlug: 'unknown', dbClient: mockDb() })
  assert.equal(result.canRegister, false)
  assert.equal(result.reasonCode, REGION_REASON_CODES.INVALID)
})

test('vote persistence supports dedupe key and locale-safe region loading', async () => {
  const db = mockDb()
  const result = await voteForRegion({ countryCode: 'NO', regionSlug: 'trondelag', email: 'person@example.com', locale: 'nb-NO', dbClient: db })
  assert.equal(result.ok, true)
  const list = await listRegionsByCountry({ countryCode: 'NO', locale: 'nb-NO', dbClient: db })
  assert.equal(list.locale, 'nb-NO')
  assert.equal(list.regions[0].slug, 'trondelag')
})
