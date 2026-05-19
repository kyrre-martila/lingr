import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const discoverySource = readFileSync(new URL('../src/components/discovery.js', import.meta.url), 'utf8')

test('discovery keeps calm action labels', () => {
  assert.match(discoverySource, /discovery\.spark/)
  assert.match(discoverySource, /discovery\.not_now/)
  assert.doesNotMatch(discoverySource, /Pass quietly|Send spark/)
})

test('discovery region unavailable copy and waitlist CTA are present', () => {
  assert.match(discoverySource, /discovery\.empty\.unavailable_region/)
  assert.match(discoverySource, /discovery\.unavailable\.cta/)
})

test('discovery avoids urgency or gamified vocabulary', () => {
  assert.doesNotMatch(discoverySource, /daily limit reached|Try again|Boost|More profiles|Out of likes/i)
})
