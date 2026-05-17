import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport } from '../src/api/http-transport.js'
import { evaluateRouteGuard, GUARD_MODES } from '../src/state/route-access.js'
import { SESSION_STATES, resolveSessionStateFromFlags } from '../src/state/session.js'

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

test('unauthenticated users are redirected to onboarding when accessing app routes', () => {
  const result = evaluateRouteGuard({ path: '/discovery', sessionState: SESSION_STATES.ANONYMOUS, mode: GUARD_MODES.ENFORCED })
  assert.equal(result.blocked, true)
  assert.equal(result.suggestedRedirectTarget, '/onboarding')
  assert.equal(result.blockedReasonCode, 'auth.requires_auth')
})

test('authenticated users with incomplete onboarding are routed to onboarding', () => {
  const result = evaluateRouteGuard({ path: '/profile', sessionState: SESSION_STATES.ONBOARDING, mode: GUARD_MODES.ENFORCED })
  assert.equal(result.allowed, false)
  assert.equal(result.suggestedRedirectTarget, '/onboarding')
  assert.equal(result.blockedReasonCode, 'route.requires_onboarding')
})

test('authenticated users with incomplete profile are routed to profile completion', () => {
  const blocked = evaluateRouteGuard({ path: '/conversations', sessionState: SESSION_STATES.INCOMPLETE_PROFILE, mode: GUARD_MODES.ENFORCED })
  const allowed = evaluateRouteGuard({ path: '/profile', sessionState: SESSION_STATES.INCOMPLETE_PROFILE, mode: GUARD_MODES.ENFORCED })
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.suggestedRedirectTarget, '/profile')
  assert.equal(blocked.blockedReasonCode, 'route.requires_profile_completion')
  assert.equal(allowed.allowed, true)
})



test('incomplete users trying discovery are redirected directly to their required flow', () => {
  const onboarding = evaluateRouteGuard({ path: '/discovery', sessionState: SESSION_STATES.ONBOARDING, mode: GUARD_MODES.ENFORCED })
  const incompleteProfile = evaluateRouteGuard({ path: '/discovery', sessionState: SESSION_STATES.INCOMPLETE_PROFILE, mode: GUARD_MODES.ENFORCED })
  assert.equal(onboarding.allowed, false)
  assert.equal(onboarding.suggestedRedirectTarget, '/onboarding')
  assert.equal(onboarding.blockedReasonCode, 'route.requires_onboarding')
  assert.equal(incompleteProfile.allowed, false)
  assert.equal(incompleteProfile.suggestedRedirectTarget, '/profile')
  assert.equal(incompleteProfile.blockedReasonCode, 'route.requires_profile_completion')
})

test('authenticated users with complete profile can access app routes', () => {
  const result = evaluateRouteGuard({ path: '/conversations', sessionState: SESSION_STATES.SIGNED_IN, mode: GUARD_MODES.ENFORCED })
  assert.equal(result.allowed, true)
  assert.equal(result.blocked, false)
})

test('session state resolves from onboarding and profile completion flags', () => {
  assert.equal(resolveSessionStateFromFlags({ isAuthenticated: false, onboardingComplete: false, profileComplete: false }), SESSION_STATES.ANONYMOUS)
  assert.equal(resolveSessionStateFromFlags({ isAuthenticated: true, onboardingComplete: false, profileComplete: false }), SESSION_STATES.ONBOARDING)
  assert.equal(resolveSessionStateFromFlags({ isAuthenticated: true, onboardingComplete: true, profileComplete: false }), SESSION_STATES.INCOMPLETE_PROFILE)
  assert.equal(resolveSessionStateFromFlags({ isAuthenticated: true, onboardingComplete: true, profileComplete: true }), SESSION_STATES.SIGNED_IN)
})
