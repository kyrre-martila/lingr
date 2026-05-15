import test from 'node:test'
import assert from 'node:assert/strict'
import { createFailure, createSuccess } from '../src/api/envelope.js'
import { API_RESPONSE_STATUS, DOMAIN_ERROR_KIND, REASON_CODES } from '../src/domain/contracts.js'

test('web transport success envelope aligns status taxonomy', () => {
  const env = createSuccess({ ok: true })
  assert.equal(env.status, API_RESPONSE_STATUS.SUCCESS)
  assert.equal(env.ok, true)
})

test('web transport error envelope aligns kind/reasonCode', () => {
  const env = createFailure({ code: REASON_CODES.ROUTE.UNKNOWN_ROUTE, message: 'x', kind: DOMAIN_ERROR_KIND.ROUTE })
  assert.equal(env.status, API_RESPONSE_STATUS.ERROR)
  assert.equal(env.error.kind, DOMAIN_ERROR_KIND.ROUTE)
  assert.equal(env.error.reasonCode, REASON_CODES.ROUTE.UNKNOWN_ROUTE)
})
