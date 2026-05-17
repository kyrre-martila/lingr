import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport } from '../src/api/http-transport.js'

const ok = (data = {}) => ({ status: 'success', data })
const fail = (reasonCode) => ({ status: 'error', error: { kind: 'auth', reasonCode, retryable: false } })

test('auth + conversation integration flow semantics', async () => {
  let activeToken = null
  let expiredToken = null
  const calls = []

  const transport = createHttpTransport({
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options })
      const auth = options.headers?.authorization || ''
      if (url.endsWith('/v1/auth/register')) return { json: async () => ok({ userId: 'usr_1', sessionToken: 'sess_reg', lifecycleState: 'onboarding' }) }
      if (url.endsWith('/v1/auth/login')) {
        activeToken = 'sess_live'
        expiredToken = 'sess_expired'
        return { json: async () => ok({ userId: 'usr_1', sessionToken: activeToken, lifecycleState: 'active' }) }
      }
      if (url.endsWith('/v1/auth/logout')) {
        if (auth === `Bearer ${activeToken}`) activeToken = null
        return { json: async () => ok({ loggedOut: true }) }
      }
      if (url.endsWith('/v1/profile/viewer') || url.endsWith('/v1/profile/completeness')) {
        if (!auth) return { json: async () => fail('auth.requires_auth') }
        if (auth === `Bearer ${expiredToken}`) return { json: async () => fail('auth.session_expired') }
        return { json: async () => ok({}) }
      }
      if (url.endsWith('/v1/conversations/viewer') || url.includes('/messages')) {
        if (!auth || auth === 'Bearer null') return { json: async () => fail('auth.requires_auth') }
        if (auth === `Bearer ${expiredToken}`) return { json: async () => fail('auth.session_expired') }
        if (url.endsWith('/v1/conversations/viewer')) return { json: async () => ok({ items: [{ conversationId: 'cnv_1' }], page: { nextCursor: null } }) }
        if (options.method === 'GET') return { json: async () => ok({ items: [], page: { nextCursor: null } }) }
        return { json: async () => ok({ messageId: 'msg_1' }) }
      }
      return { json: async () => ok({}) }
    },
    getSessionToken: () => activeToken
  })

  const register = await transport.request({ operation: 'auth.register', payload: { email: 'x@y.com', password: 'password123' } })
  assert.equal(register.ok, true)

  const login = await transport.request({ operation: 'auth.login', payload: { email: 'x@y.com', password: 'password123' } })
  assert.equal(login.ok, true)

  assert.equal((await transport.request({ operation: 'profile.get', payload: {} })).ok, true)
  assert.equal((await transport.request({ operation: 'profile.completeness', payload: {} })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.viewer.list', payload: {} })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.messages.list', payload: { conversationId: 'cnv_1' } })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.messages.send', payload: { conversationId: 'cnv_1', text: 'Hi' } })).ok, true)

  assert.equal((await transport.request({ operation: 'auth.logout', payload: {} })).ok, true)
  const denied = await transport.request({ operation: 'conversations.viewer.list', payload: {} })
  assert.equal(denied.ok, false)
  assert.equal(denied.error.reasonCode, 'auth.requires_auth')

  activeToken = expiredToken
  const expired = await transport.request({ operation: 'conversations.viewer.list', payload: {} })
  assert.equal(expired.ok, false)
  assert.equal(expired.error.reasonCode, 'auth.session_expired')

  activeToken = null
  const anonProfile = await transport.request({ operation: 'profile.get', payload: {} })
  assert.equal(anonProfile.ok, false)
  assert.equal(anonProfile.error.reasonCode, 'auth.requires_auth')

  assert.ok(calls.length >= 8)
})
