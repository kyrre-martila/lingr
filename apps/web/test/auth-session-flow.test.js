import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport } from '../src/api/http-transport.js'
import { evaluateRouteGuard, GUARD_MODES } from '../src/state/route-access.js'
import { SESSION_STATES } from '../src/state/session.js'

test('register/login/logout operations are mapped and include bearer token when available', async () => {
  const calls = []
  const transport = createHttpTransport({
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return { json: async () => ({ status: 'success', data: {} }) }
    },
    getSessionToken: () => 'sess_abc'
  })

  await transport.request({ operation: 'auth.register', payload: { email: 'a@b.com', password: 'password123' } })
  await transport.request({ operation: 'auth.login', payload: { email: 'a@b.com', password: 'password123' } })
  await transport.request({ operation: 'auth.logout', payload: {} })
  assert.equal(calls.length, 3)
  assert.equal(calls[0].options.headers.authorization, 'Bearer sess_abc')
  assert.equal(calls[0].options.method, 'POST')
})

test('expired session returns auth error envelope from protected conversations route', async () => {
  const transport = createHttpTransport({
    fetchImpl: async () => ({ json: async () => ({ status: 'error', error: { kind: 'auth', reasonCode: 'auth.session_expired', retryable: false } }) }),
    getSessionToken: () => 'expired_token'
  })
  const envelope = await transport.request({ operation: 'conversations.viewer.list', payload: {} })
  assert.equal(envelope.ok, false)
  assert.equal(envelope.error.reasonCode, 'auth.session_expired')
})

test('route gating keeps onboarding-only routes blocked for signed-in users in enforced mode', () => {
  const result = evaluateRouteGuard({ path: '/onboarding', sessionState: SESSION_STATES.SIGNED_IN, mode: GUARD_MODES.ENFORCED })
  assert.equal(result.blocked, true)
  assert.equal(result.blockedReason, 'requires_onboarding')
})
