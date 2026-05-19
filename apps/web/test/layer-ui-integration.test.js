import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import discoveryEn from '../src/i18n/discovery/en.js'
import discoveryNb from '../src/i18n/discovery/nb-NO.js'
import chatEn from '../src/i18n/chat/en.js'
import chatNb from '../src/i18n/chat/nb-NO.js'

test('discovery remains anonymous Layer 0 in UI', () => {
  const source = readFileSync(new URL('../src/components/discovery.js', import.meta.url), 'utf8')
  assert.match(source, /discovery\.introduction\.anonymous_name/)
  assert.doesNotMatch(source, /displayName|locationRegion|createdAt|updatedAt|lastSeen|online/i)
})

test('chat layer unlock renders calm fallback text and cta link only when actionable', () => {
  const source = readFileSync(new URL('../src/components/conversations/index.js', import.meta.url), 'utf8')
  assert.match(source, /chat\.layer_unlock\.title/)
  assert.match(source, /ctaLabel && ctaRoute/)
  assert.match(source, /ctaLabel && !ctaRoute/)
})

test('layer UI avoids gamified language', () => {
  const aggregate = JSON.stringify({ discoveryEn, discoveryNb, chatEn, chatNb }).toLowerCase()
  for (const banned of ['locked', 'unlock profile', 'reach next layer', 'xp', 'streak', 'badge', 'achievement', 'progress bar', 'next layer in']) {
    assert.equal(aggregate.includes(banned), false)
  }
})

test('layer hint localization keys exist in en and nb-NO', () => {
  assert.equal(typeof discoveryEn.layer_hint, 'string')
  assert.equal(typeof discoveryNb.layer_hint, 'string')
  assert.equal(typeof chatEn.layer_unlock.title, 'string')
  assert.equal(typeof chatNb.layer_unlock.title, 'string')
})
