import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createConversationsMockData } from '../src/data/mocks/conversations.js'
import { createMockTransport } from '../src/api/mock-transport.js'

const PRESSURE_KEYS = new Set(['updatedAt', 'unread', 'time', 'nextPromptAt', 'messageIntervalHours', 'preferredResponseWindowHours'])

test('active conversation mock data excludes pressure mechanics fields', () => {
  const data = createConversationsMockData()
  for (const conversation of data) {
    for (const key of Object.keys(conversation)) assert.equal(PRESSURE_KEYS.has(key), false)
    for (const message of conversation.messages) {
      for (const key of Object.keys(message)) assert.equal(PRESSURE_KEYS.has(key), false)
    }
  }
})

test('mock transport maps system-originated messages with null senderUserId', async () => {
  const transport = createMockTransport()
  const response = await transport.request({ operation: 'conversations.messages.list', payload: { conversationId: 'cnv_c1' } })
  assert.equal(response.status, 'success')
  const layerUnlock = response.data.items.find((item) => item.type === 'layer_unlock')
  assert.equal(layerUnlock?.senderUserId, null)
})

test('mock transport does not persist placeholder:// poster URLs', async () => {
  const transport = createMockTransport()
  const response = await transport.request({ operation: 'conversations.messages.send', payload: { conversationId: 'cnv_c1', type: 'playing_now', content: { mediaType: 'song', title: 'Blue' } } })
  assert.equal(response.status, 'success')
  assert.equal(response.data.content.posterUrl, null)
})

test('layer unlock CTA affordance is rendered as an actionable link when route exists', () => {
  const source = fs.readFileSync(new URL('../src/components/conversations/index.js', import.meta.url), 'utf8')
  assert.equal(source.includes('layer-unlock-banner__cta" href="${ctaRoute}"'), true)
})
