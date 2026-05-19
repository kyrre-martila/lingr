import test from 'node:test'
import assert from 'node:assert/strict'
import chatEn from '../src/i18n/chat/en.js'
import chatNb from '../src/i18n/chat/nb-NO.js'

test('guess me localization keys exist in en and nb-NO', () => {
  const keys = ['started', 'prompt_label', 'saved_wait', 'reveal_gentle_well', 'reveal_gentle_diff']
  keys.forEach((key) => {
    assert.equal(typeof chatEn.guess_me?.[key], 'string')
    assert.equal(typeof chatNb.guess_me?.[key], 'string')
  })
})

test('guess me copy avoids scoring and winner language', () => {
  const blocked = ['score', 'winner', 'loser', 'points', 'streak', 'ranking', 'correct', 'wrong']
  const text = JSON.stringify(chatEn.guess_me).toLowerCase()
  blocked.forEach((term) => assert.equal(text.includes(term), false))
})
