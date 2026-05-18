import { getDiscoverySnapshot } from '../services/discovery-service.js'
import { DISCOVERY_REASON_CODES, DISCOVERY_STATE } from '../domain/contracts.js'

const fallback = { state: DISCOVERY_STATE.EMPTY, limitPerDay: 3, remaining: 0, introductions: [], reasonCode: DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE }
const response = getDiscoverySnapshot()
const data = response.status === 'success' ? response.data : fallback

const emptyCopy = {
  [DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE]: 'Nothing new for now. Some connections are worth waiting for.',
  [DISCOVERY_REASON_CODES.DAILY_LIMIT_REACHED]: "You’ve explored today’s introductions.",
  [DISCOVERY_REASON_CODES.UNAVAILABLE_REGION]: 'Discovery is not open in your region yet.',
  [DISCOVERY_REASON_CODES.ONBOARDING_REQUIRED]: 'Finish onboarding to begin discovery.',
  [DISCOVERY_REASON_CODES.PROFILE_INCOMPLETE]: 'Complete your profile to start discovery.'
}

const createIntroCard = (intro) => {
  const card = document.createElement('article')
  card.className = 'daily-connection-card soft-panel'
  const glimpse = intro.glimpses?.[0]
  card.innerHTML = `<h3>${intro.displayName}</h3><p>${intro.locationRegion || 'Nearby'}</p>${glimpse ? `<p><strong>${glimpse.mood}</strong></p><p>${glimpse.reflection}</p>` : '<p>A calm introduction waiting to unfold.</p>'}<div class="discovery-actions"><button class="button button--ghost" type="button">Pass quietly</button><button class="button" type="button">Send Spark</button></div>`
  return card
}

export const createDiscoverySection = () => {
  const section = document.createElement('section')
  section.id = 'discovery'
  section.className = 'section section--paper'
  section.innerHTML = `<div class="container discovery-shell flow"><p class="eyebrow">Discovery</p><h2>Today’s introductions</h2><p class="lead">A small, thoughtful set. No rush.</p><p>${data.remaining} of ${data.limitPerDay} introductions remaining today.</p><div class="daily-connections"></div><div class="discovery-empty-host"></div></div>`
  const host = section.querySelector('.daily-connections')
  if (data.state === DISCOVERY_STATE.READY && data.introductions.length) host?.append(createIntroCard(data.introductions[0]))
  else {
    const empty = document.createElement('section')
    empty.className = 'discovery-empty soft-panel'
    empty.innerHTML = `<p>${emptyCopy[data.reasonCode] || emptyCopy[DISCOVERY_REASON_CODES.NO_AVAILABLE_PEOPLE]}</p>`
    section.querySelector('.discovery-empty-host')?.append(empty)
  }
  return section
}
