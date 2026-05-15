import test from 'node:test'
import assert from 'node:assert/strict'
import { ok, fail } from '../src/http/envelope.js'
import { API_RESPONSE_STATUS, DOMAIN_ERROR_KIND, REASON_CODES } from '../../../packages/shared/src/contracts.js'

test('api envelope success shape', () => {
  const env = ok({ status: 'ok' })
  assert.equal(env.status, API_RESPONSE_STATUS.SUCCESS)
  assert.deepEqual(env.data, { status: 'ok' })
})

test('api envelope error taxonomy shape', () => {
  const env = fail({ kind: DOMAIN_ERROR_KIND.ROUTE, reasonCode: REASON_CODES.ROUTE.UNKNOWN_ROUTE, message: 'missing', retryable: false })
  assert.equal(env.status, API_RESPONSE_STATUS.ERROR)
  assert.equal(env.error.kind, DOMAIN_ERROR_KIND.ROUTE)
  assert.equal(env.error.reasonCode, REASON_CODES.ROUTE.UNKNOWN_ROUTE)
  assert.equal(env.error.retryable, false)
})
