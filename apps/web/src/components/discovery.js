import { getDiscoverySnapshot } from '../services/discovery-service.js'
import {
  canStartSpark,
  createSparkInvitation,
  getSparkStatusLabel,
  resolveSparkStatus,
  shouldOpenConversationWindowLater
} from '../domain/index.js'
import { discoveryState } from '../state/index.js'

const discoveryData = getDiscoverySnapshot()

const createLimitedIntroStatus = ({ remainingIntroductions, totalIntroductions }) => {
  const wrap = document.createElement('section')
  wrap.className = 'discovery-intro-limit soft-panel'
  wrap.setAttribute('aria-label', 'Daily introductions status')

  const used = totalIntroductions - remainingIntroductions
  wrap.innerHTML = `
    <p class="discovery-intro-limit__label">Daily introductions</p>
    <p class="discovery-intro-limit__count"><strong>${remainingIntroductions}</strong> of ${totalIntroductions} left today</p>
    <ul class="discovery-intro-limit__track" aria-label="Introductions used today">
      ${Array.from({ length: totalIntroductions })
        .map((_, index) => `<li><span class="${index < used ? 'is-used' : 'is-open'}"></span></li>`)
        .join('')}
    </ul>
    <p class="discovery-intro-limit__note">Intentional pacing helps each hello feel considered, not rushed.</p>
  `
  return wrap
}

const createGlimpsCard = (glimps) => {
  const card = document.createElement('article')
  card.className = 'discovery-preview discovery-preview--glimps'
  card.innerHTML = `<p class="discovery-preview__label">Glimps preview</p><h4>${glimps.title}</h4><p>${glimps.caption}</p>`
  return card
}

const createReflectionCard = (reflection) => {
  const card = document.createElement('article')
  card.className = 'discovery-preview discovery-preview--reflection'
  card.innerHTML = `<p class="discovery-preview__label">Reflection preview</p><p class="discovery-preview__prompt">${reflection.prompt}</p><p>${reflection.answer}</p>`
  return card
}

const createSparkMeta = (connection) => {
  const sparkStatus = getSparkStatusLabel(connection.spark.status)
  const startDecision = canStartSpark({
    existingSparkStatus: connection.spark.status,
    dailyInvitesSent: connection.spark.status === 'invited' ? 1 : 0,
    dailyInviteLimit: 3,
    connectionReadiness: connection.spark.connectionReadiness,
    resonanceSignals: connection.spark.resonanceSignals
  })

  const windowDecision = shouldOpenConversationWindowLater({
    sparkStatus: resolveSparkStatus({ status: connection.spark.status }),
    connectionReadiness: connection.spark.connectionReadiness,
    resonanceSignals: connection.spark.resonanceSignals
  })

  const invitation = startDecision.allowed
    ? createSparkInvitation({ fromUserId: 'me', toUserId: connection.id, resonanceSignals: connection.spark.resonanceSignals, connectionReadiness: connection.spark.connectionReadiness })
    : null

  return `
    <div class="daily-connection-card__spark-meta">
      <p><strong>Spark status:</strong> ${sparkStatus}</p>
      <p><strong>Connection readiness:</strong> ${Math.round(connection.spark.connectionReadiness * 100)}%</p>
      <p><strong>Resonance signal:</strong> ${Math.round(startDecision.signals.resonanceScore * 100)}%</p>
      <p><strong>Invitation:</strong> ${invitation ? 'Ready to send intentionally' : 'Wait and observe gently'}</p>
      <p><strong>Conversation window:</strong> ${windowDecision.shouldOpen ? `Can open in ~${windowDecision.suggestedDelayHours}h` : `Not yet (${windowDecision.reason})`}</p>
    </div>
  `
}

const createConnectionCard = (connection) => {
  const card = document.createElement('article')
  card.className = 'daily-connection-card soft-panel'
  card.tabIndex = 0
  card.innerHTML = `
    <header class="daily-connection-card__header">
      <div><h3>${connection.name}, ${connection.age}</h3><p>${connection.location} · ${connection.emotionalRhythm}</p></div>
      <button class="button button--ghost" type="button">Send Spark invitation</button>
    </header>
    <p class="daily-connection-card__intention">${connection.intention}</p>
    <p class="daily-connection-card__hint"><strong>Compatibility hint:</strong> ${connection.compatibilityHint}</p>
    ${createSparkMeta(connection)}
    <div class="daily-connection-card__previews"></div>
  `

  const previews = card.querySelector('.daily-connection-card__previews')
  previews?.append(createGlimpsCard(connection.glimps), createReflectionCard(connection.reflection))

  card.querySelector('button')?.addEventListener('click', () => {
    card.querySelector('button').textContent = 'Spark invitation saved'
    card.querySelector('button').setAttribute('disabled', 'true')
  })

  return card
}

const createNoMoreState = () => {
  const state = document.createElement('section')
  state.className = 'discovery-empty soft-panel'
  state.setAttribute('aria-live', 'polite')
  state.innerHTML = `
    <h3>No more introductions today.</h3>
    <p>You have reached your daily discovery pace. New connections open tomorrow with fresh prompts.</p>
    <button class="button button--ghost" type="button">Review saved profiles</button>
  `
  return state
}

const createSoftRecommendations = (items) => {
  const section = document.createElement('section')
  section.className = 'discovery-recommendations soft-panel'
  section.innerHTML = `<h3>Soft recommendations</h3><p>People you may want to explore soon, based on emotional compatibility.</p><ul class="discovery-recommendations__list"></ul>`
  const list = section.querySelector('ul')
  items.forEach((item) => {
    const li = document.createElement('li')
    li.innerHTML = `<p><strong>${item.name}</strong></p><p>${item.reason}</p>`
    list?.append(li)
  })
  return section
}

export const createDiscoverySection = () => {
  const section = document.createElement('section')
  section.id = 'discovery'
  section.className = 'section section--paper'
  section.setAttribute('aria-labelledby', 'discovery-title')
  section.innerHTML = `
    <div class="container discovery-shell flow">
      <p class="eyebrow">Daily discovery</p>
      <h2 id="discovery-title">Intentional introductions, once a day.</h2>
      <p class="lead">A small set of thoughtful connections, designed for gradual curiosity over endless browsing.</p>
      <p class="discovery-date">${discoveryData.dateLabel}</p>
      <div class="discovery-intro-limit-host"></div>
      <div class="daily-connections" aria-label="Daily connections"></div>
      <div class="discovery-empty-host"></div>
      <div class="discovery-recommendations-host"></div>
    </div>
  `

  const limits = discoveryState.getState()
  section.querySelector('.discovery-intro-limit-host')?.append(createLimitedIntroStatus(limits))
  const cardsHost = section.querySelector('.daily-connections')
  discoveryData.cards.forEach((connection) => cardsHost?.append(createConnectionCard(connection)))
  section.querySelector('.discovery-empty-host')?.append(createNoMoreState())
  section.querySelector('.discovery-recommendations-host')?.append(createSoftRecommendations(discoveryData.recommended))

  return section
}
