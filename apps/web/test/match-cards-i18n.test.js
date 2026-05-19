import test from 'node:test'
import assert from 'node:assert/strict'
import chatEn from '../src/i18n/chat/en.js'
import chatNb from '../src/i18n/chat/nb-NO.js'

test('match cards localization keys exist in en and nb-NO', () => {
  const keys = ['started', 'question_label', 'waiting', 'revealed']
  keys.forEach((key) => {
    assert.equal(typeof chatEn.match_cards?.[key], 'string')
    assert.equal(typeof chatNb.match_cards?.[key], 'string')
  })
})
