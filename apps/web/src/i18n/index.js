import commonEn from './common/en.js'
import commonNb from './common/nb-NO.js'
import authEn from './auth/en.js'
import authNb from './auth/nb-NO.js'
import chatEn from './chat/en.js'
import chatNb from './chat/nb-NO.js'
import discoveryEn from './discovery/en.js'
import discoveryNb from './discovery/nb-NO.js'
import onboardingEn from './onboarding/en.js'
import onboardingNb from './onboarding/nb-NO.js'
import errorsEn from './errors/en.js'
import errorsNb from './errors/nb-NO.js'
import regionsEn from './regions/en.js'
import regionsNb from './regions/nb-NO.js'

const SUPPORTED = ['en', 'nb-NO']
const FALLBACK_LOCALE = 'en'

const NAMESPACES = {
  common: { en: commonEn, 'nb-NO': commonNb },
  auth: { en: authEn, 'nb-NO': authNb },
  chat: { en: chatEn, 'nb-NO': chatNb },
  discovery: { en: discoveryEn, 'nb-NO': discoveryNb },
  onboarding: { en: onboardingEn, 'nb-NO': onboardingNb },
  errors: { en: errorsEn, 'nb-NO': errorsNb },
  regions: { en: regionsEn, 'nb-NO': regionsNb }
}

const resolveLocale = (raw) => SUPPORTED.find((locale) => locale.toLowerCase() === String(raw || '').toLowerCase()) || FALLBACK_LOCALE
export const detectBrowserLocale = () => resolveLocale(globalThis.navigator?.language)
export const getLocale = () => resolveLocale(globalThis.localStorage?.getItem('lingr.locale') || detectBrowserLocale())
export const setLocale = (locale) => globalThis.localStorage?.setItem('lingr.locale', resolveLocale(locale))

const getByPath = (obj, path) => path.split('.').reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : undefined), obj)
export const t = (key, { locale = getLocale() } = {}) => {
  const [namespace, ...rest] = key.split('.')
  const path = rest.join('.')
  const selected = NAMESPACES[namespace]?.[resolveLocale(locale)]
  const fallback = NAMESPACES[namespace]?.[FALLBACK_LOCALE]
  return getByPath(selected, path) ?? getByPath(fallback, path) ?? key
}

export const applyTranslations = (root = document, locale = getLocale()) => {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n, { locale })
  })
  root.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel, { locale }))
  })
}

export const mapReasonCodeToKey = (reasonCode) => `errors.${reasonCode}`
export const i18nConfig = { SUPPORTED, FALLBACK_LOCALE, NAMESPACES }
