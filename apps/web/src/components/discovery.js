import { getDailyDiscovery, sendDiscoveryNotNow, sendDiscoverySpark } from '../services/discovery-service.js'
import { DISCOVERY_REASON_CODES, DISCOVERY_STATE } from '../domain/contracts.js'

const COPY = Object.freeze({
  eyebrow: 'discovery.eyebrow',
  title: 'discovery.title',
  subtitle: 'discovery.subtitle',
  loading: 'discovery.loading',
  sent: 'discovery.spark_sent',
  send: 'discovery.spark',
  pass: 'discovery.not_now',
  unavailableCta: 'discovery.unavailable.cta',
  glimpseLabel: 'discovery.glimpse',
  reflectionLabel: 'discovery.reflection',
  layersLabel: 'discovery.layers',
  anonymousName: 'discovery.introduction.anonymous_name',
  sparkAria: 'discovery.aria.spark',
  notNowAria: 'discovery.aria.not_now',
  waitlistAria: 'discovery.aria.waitlist'
})

const EMPTY_REASON_COPY = Object.freeze({
  [DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE]: 'discovery.empty.no_available_people',
  [DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED]: 'discovery.empty.daily_limit_reached',
  [DISCOVERY_REASON_CODES.UNAVAILABLE_REGION]: 'discovery.empty.unavailable_region',
  [DISCOVERY_REASON_CODES.ONBOARDING_REQUIRED]: 'discovery.empty.onboarding_required',
  [DISCOVERY_REASON_CODES.PROFILE_INCOMPLETE]: 'discovery.empty.profile_incomplete'
})

const readDismissed = () => {
  try { return new Set(JSON.parse(globalThis.sessionStorage?.getItem('lingr.discovery.dismissed') || '[]')) } catch { return new Set() }
}
const writeDismissed = (set) => globalThis.sessionStorage?.setItem('lingr.discovery.dismissed', JSON.stringify([...set]))

const createTag = (text) => {
  const li = document.createElement('li')
  li.className = 'discovery-tag'
  li.textContent = text
  return li
}

const renderEmpty = (host, reasonCode) => {
  const panel = document.createElement('section')
  panel.className = 'discovery-empty soft-panel'
  panel.setAttribute('aria-live', 'polite')
  panel.dataset.i18n = EMPTY_REASON_COPY[reasonCode] || EMPTY_REASON_COPY[DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE]
  if (reasonCode === DISCOVERY_REASON_CODES.UNAVAILABLE_REGION) {
    const cta = document.createElement('button')
    cta.className = 'button button--ghost discovery-empty__cta'
    cta.type = 'button'
    cta.dataset.i18n = COPY.unavailableCta
    cta.setAttribute('data-i18n-aria-label', COPY.waitlistAria)
    panel.append(cta)
  }
  host.replaceChildren(panel)
}

const introCard = (intro, onSpark, onPass) => {
  const card = document.createElement('article')
  card.className = 'discovery-card soft-panel'
  card.tabIndex = 0
  const glimpse = intro.glimpses?.[0]
  const interestTokens = String(intro.layersSummary || '').split(/[•,]/).map((v) => v.trim()).filter(Boolean).slice(0, 3)
  card.innerHTML = `<p class="discovery-name" data-i18n="${COPY.anonymousName}"></p><p class="discovery-label" data-i18n="${COPY.glimpseLabel}"></p><p class="discovery-quote">${glimpse?.reflection || ''}</p><p class="discovery-label" data-i18n="${COPY.reflectionLabel}"></p><p class="discovery-reflection">${glimpse?.prompt || ''}</p><p class="discovery-label" data-i18n="${COPY.layersLabel}"></p><ul class="discovery-tags"></ul><div class="discovery-actions"><button class="button button--ghost" type="button" data-action="pass" data-i18n="${COPY.pass}" data-i18n-aria-label="${COPY.notNowAria}"></button><button class="button" type="button" data-action="spark" data-i18n="${COPY.send}" data-i18n-aria-label="${COPY.sparkAria}"></button></div><p class="discovery-feedback" aria-live="polite"></p>`
  const tags = card.querySelector('.discovery-tags')
  interestTokens.forEach((token) => tags?.append(createTag(token)))
  card.querySelector('[data-action="spark"]')?.addEventListener('click', onSpark)
  card.querySelector('[data-action="pass"]')?.addEventListener('click', onPass)
  return card
}

export const createDiscoverySection = () => {
  const section = document.createElement('section')
  section.id = 'discovery'
  section.className = 'section section--paper'
  section.innerHTML = `<div class="container discovery-shell flow"><p class="eyebrow" data-i18n="${COPY.eyebrow}"></p><h2 data-i18n="${COPY.title}"></h2><p class="lead" data-i18n="${COPY.subtitle}"></p><div class="daily-connections" aria-live="polite"></div></div>`

  const host = section.querySelector('.daily-connections')
  const dismissed = readDismissed()

  const render = async () => {
    host.innerHTML = `<p class="discovery-loading" data-i18n="${COPY.loading}"></p>`
    const response = await getDailyDiscovery()
    if (response.status === 'error') return renderEmpty(host, response.error.reasonCode)
    const data = response.data

    if (data.state !== DISCOVERY_STATE.READY || !data.introductions?.length) return renderEmpty(host, data.reasonCode)
    const queue = data.introductions.filter((item) => !dismissed.has(item.userId))
    if (!queue.length) return renderEmpty(host, DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE)

    const showCurrent = () => {
      const current = queue[0]
      if (!current) return renderEmpty(host, DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED)
      const card = introCard(current, async () => {
        const sparkResult = await sendDiscoverySpark({ discoveredUserId: current.userId })
        if (sparkResult.status === 'error') return renderEmpty(host, sparkResult.error.reasonCode)
        dismissed.add(current.userId)
        writeDismissed(dismissed)
        queue.shift()
        const feedback = document.createElement('p')
        feedback.className = 'discovery-feedback-banner'
        feedback.dataset.i18n = COPY.sent
        host.replaceChildren(feedback)
        globalThis.setTimeout(showCurrent, 450)
      }, async () => {
        const notNowResult = await sendDiscoveryNotNow({ discoveredUserId: current.userId })
        if (notNowResult.status === 'error') return renderEmpty(host, notNowResult.error.reasonCode)
        dismissed.add(current.userId)
        writeDismissed(dismissed)
        queue.shift()
        showCurrent()
      })
      host.replaceChildren(card)
    }

    showCurrent()
  }

  render()
  return section
}
