import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient } from '../src/api/client.js'
import { createSuccess, createFailure } from '../src/api/envelope.js'
import { DOMAIN_ERROR_KIND, DISCOVERY_REASON_CODES } from '../src/domain/contracts.js'

test('discovery service integration maps daily fetch and spark send', async () => {
  const seen = []
  const client = createApiClient({
    requestSync: () => createSuccess({}),
    request: async ({ operation, payload }) => {
      seen.push({ operation, payload })
      if (operation === 'discovery.get') return createSuccess({ state: 'ready', remaining: 1, limitPerDay: 3, introductions: [{ userId: 'usr_2' }] })
      if (operation === 'spark.create') return createSuccess({ sparkId: 'spk_1' })
      return createFailure({ code: 'route.unknown_route', message: 'x', kind: DOMAIN_ERROR_KIND.ROUTE })
    }
  })

  const daily = await client.call('discovery.get')
  const spark = await client.call('spark.create', { recipientUserId: 'usr_2' })

  assert.equal(daily.status, 'success')
  assert.equal(spark.status, 'success')
  assert.deepEqual(seen.map((x) => x.operation), ['discovery.get', 'spark.create'])
})

test('discovery handles empty and limit reason codes', () => {
  const empty = createSuccess({ state: 'empty', reasonCode: DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE })
  const limit = createSuccess({ state: 'limit_reached', reasonCode: DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED })
  assert.equal(empty.data.reasonCode, 'discovery.no_available_people')
  assert.equal(limit.data.reasonCode, 'discovery.daily_limit_reached')
})

test('discovery error handling keeps retryable envelope', async () => {
  const client = createApiClient({
    requestSync: () => createSuccess({}),
    request: async () => createFailure({ code: 'transport.http_unreachable', message: 'offline', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true })
  })
  const res = await client.call('discovery.get')
  assert.equal(res.status, 'error')
  assert.equal(res.error.retryable, true)
})
