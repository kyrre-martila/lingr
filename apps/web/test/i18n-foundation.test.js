import test from 'node:test'
import assert from 'node:assert/strict'
import { detectBrowserLocale, getLocale, i18nConfig, t } from '../src/i18n/index.js'

test('loads configured namespaces for both locales', () => {
  assert.deepEqual(i18nConfig.SUPPORTED, ['en', 'nb-NO'])
  for (const ns of ['common', 'auth', 'chat', 'discovery', 'onboarding', 'errors', 'regions']) {
    assert.ok(i18nConfig.NAMESPACES[ns].en)
    assert.ok(i18nConfig.NAMESPACES[ns]['nb-NO'])
  }
})

test('resolves translation keys for supported locales', () => {
  assert.equal(t('discovery.spark', { locale: 'en' }), 'Spark')
  assert.equal(t('discovery.not_now', { locale: 'nb-NO' }), 'Ikke nå')
})

test('falls back to english when locale is unknown', () => {
  assert.equal(t('chat.send', { locale: 'fr-FR' }), 'Send')
})

test('falls back to key when translation key is missing', () => {
  assert.equal(t('chat.this_key_does_not_exist', { locale: 'en' }), 'chat.this_key_does_not_exist')
})

test('detects browser locale and persists override preference', () => {
  globalThis.navigator = { language: 'nb-NO' }
  const store = new Map()
  globalThis.localStorage = { getItem: (k) => store.get(k) || null, setItem: (k, v) => store.set(k, v) }
  assert.equal(detectBrowserLocale(), 'nb-NO')
  assert.equal(getLocale(), 'nb-NO')
})
