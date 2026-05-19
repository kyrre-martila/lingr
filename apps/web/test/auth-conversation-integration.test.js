import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport } from '../src/api/http-transport.js'

const ok = (data = {}) => ({ status: 'success', data })

test('auth + conversation integration uses cookie credentials for sessioned calls', async () => {
  const calls = []

  const transport = createHttpTransport({
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options })
      if (url.endsWith('/v1/auth/register')) return { json: async () => ok({ userId: 'usr_1', lifecycleState: 'onboarding' }) }
      if (url.endsWith('/v1/auth/login')) return { json: async () => ok({ userId: 'usr_1', lifecycleState: 'active' }) }
      if (url.endsWith('/v1/auth/logout')) return { json: async () => ok({ loggedOut: true }) }
      if (url.endsWith('/v1/conversations/viewer')) return { json: async () => ok({ items: [{ conversationId: 'cnv_1' }], page: { nextCursor: null } }) }
      if (url.includes('/messages') && options.method === 'GET') return { json: async () => ok({ items: [], page: { nextCursor: null } }) }
      if (url.includes('/messages')) return { json: async () => ok({ messageId: 'msg_1' }) }
      return { json: async () => ok({}) }
    }
  })

  assert.equal((await transport.request({ operation: 'auth.register', payload: { email: 'x@y.com', password: 'password123' } })).ok, true)
  assert.equal((await transport.request({ operation: 'auth.login', payload: { email: 'x@y.com', password: 'password123' } })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.viewer.list', payload: {} })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.messages.list', payload: { conversationId: 'cnv_1' } })).ok, true)
  assert.equal((await transport.request({ operation: 'conversations.messages.send', payload: { conversationId: 'cnv_1', text: 'Hi' } })).ok, true)
  assert.equal((await transport.request({ operation: 'auth.logout', payload: {} })).ok, true)

  assert.ok(calls.every((call) => call.options.credentials === 'include'))
  assert.ok(calls.every((call) => !call.options.headers.authorization))
})
