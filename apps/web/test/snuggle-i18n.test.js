import test from 'node:test'
import assert from 'node:assert/strict'
import chatEn from '../src/i18n/chat/en.js'
import chatNb from '../src/i18n/chat/nb-NO.js'

test('snuggle localization keys exist in en and nb-NO', () => {
  const keys = ['invited', 'accept', 'decline', 'holding_label', 'together', 'quiet', 'passed', 'invite_declined']
  keys.forEach((key) => {
    assert.equal(typeof chatEn.snuggle?.[key], 'string')
    assert.equal(typeof chatNb.snuggle?.[key], 'string')
  })
})

test('snuggle copy avoids pressure language and presence leakage', () => {
  const blocked = ['online', 'last seen', 'left', 'missed your snuggle', 'timer', 'score', 'streak', 'winner', 'loser']
  const text = JSON.stringify(chatEn.snuggle).toLowerCase()
  blocked.forEach((term) => assert.equal(text.includes(term), false))
})
