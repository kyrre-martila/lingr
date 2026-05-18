import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient } from '../src/api/client.js'
import { createSuccess, createFailure } from '../src/api/envelope.js'
import { DOMAIN_ERROR_KIND, DISCOVERY_REASON_CODES } from '../src/domain/contracts.js'

test('authenticated discovery flow maps daily, spark, and not-now operations', async () => {
  const seen = []
  const client = createApiClient({
    requestSync: () => createSuccess({}),
    request: async ({ operation, payload }) => {
      seen.push({ operation, payload })
      if (operation === 'discovery.get') return createSuccess({ state: 'ready', remaining: 1, limitPerDay: 3, introductions: [{ userId: 'usr_2' }] })
      if (operation === 'discovery.spark') return createSuccess({ state: 'sent' })
      if (operation === 'discovery.not_now') return createSuccess({ ok: true })
      return createFailure({ code: 'route.unknown_route', message: 'x', kind: DOMAIN_ERROR_KIND.ROUTE })
    }
  })

  await client.call('discovery.get')
  await client.call('discovery.spark', { discoveredUserId: 'usr_2' })
  await client.call('discovery.not_now', { discoveredUserId: 'usr_2' })

  assert.deepEqual(seen.map((x) => x.operation), ['discovery.get', 'discovery.spark', 'discovery.not_now'])
})

test('discovery handles empty and limit reason codes', () => {
  const empty = createSuccess({ state: 'empty', reasonCode: DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE })
  const limit = createSuccess({ state: 'limit_reached', reasonCode: DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED })
  assert.equal(empty.data.reasonCode, 'discovery.no_available_people')
  assert.equal(limit.data.reasonCode, 'discovery.daily_limit_reached')
})
