import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpTransport } from '../src/api/http-transport.js'

test('http transport maps conversation list to REST endpoint', async () => {
  let called
  const transport = createHttpTransport({
    baseUrl: 'http://localhost:3333',
    fetchImpl: async (url, init) => {
      called = { url, init }
      return { json: async () => ({ status: 'success', data: [] }) }
    }
  })

  const result = await transport.request({ operation: 'conversations.viewer.list' })
  assert.equal(result.ok, true)
  assert.equal(called.url, 'http://localhost:3333/v1/conversations/viewer')
  assert.equal(called.init.method, 'GET')
})

test('http transport maps send text payload to canonical API body', async () => {
  let body
  const transport = createHttpTransport({
    baseUrl: 'http://localhost:3333',
    fetchImpl: async (_url, init) => {
      body = JSON.parse(init.body)
      return { json: async () => ({ status: 'success', data: { ok: true } }) }
    }
  })

  const result = await transport.request({ operation: 'conversations.messages.send', payload: { conversationId: 'cnv_1', text: 'hey' } })
  assert.equal(result.ok, true)
  assert.deepEqual(body, { type: 'text', content: { text: 'hey' } })
})
