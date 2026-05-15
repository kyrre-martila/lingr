import { conversationStarters } from '../../data/mocks/conversations.js'
import { getConversationsMockSnapshot } from '../../data/mocks/index.js'
import { conversationState } from '../../state/index.js'
import {
  WINDOW_STATES,
  canWindowOpen,
  determineWindowRhythm,
  getFutureEmotionalSafetyPlaceholder,
  getFutureWindowPacingPolicyPlaceholder,
  getIntentionalPacingRecommendation,
  getWindowPauseState,
  isMessagingAvailableForWindow
} from '../../domain/window/index.js'
import {
  createCompatibilityProfile,
  createCompatibilitySignals,
  createConversationResonancePlaceholder,
  createPacingFitPlaceholder,
  createEmotionalAlignmentHints,
  createReflectivePromptsFromCompatibility
} from '../../domain/compatibility/index.js'

const createConversationList = (items, activeId) => {
  const list = document.createElement('ul')
  list.className = 'conversation-list'
  list.setAttribute('aria-label', 'Conversations')

  items.forEach((conversation) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <button class="conversation-list__item ${conversation.id === activeId ? 'is-active' : ''}" type="button" aria-current="${conversation.id === activeId ? 'true' : 'false'}">
        <p class="conversation-list__name">${conversation.name}</p>
        <p class="conversation-list__meta">${conversation.mood} · ${conversation.updatedAt}</p>
        <p class="conversation-list__meta">Window: ${conversation.windowState} · Rhythm: ${conversation.windowRhythm}</p>
        <p class="conversation-list__preview">${conversation.preview}</p>
      </button>
    `
    li.querySelector('button').dataset.id = conversation.id
    list.append(li)
  })

  return list
}

const createBubble = (message) => {
  const bubble = document.createElement('article')
  bubble.className = `message-bubble ${message.sender === 'me' ? 'message-bubble--me' : 'message-bubble--them'} ${message.type === 'prompt' ? 'message-bubble--prompt' : ''}`
  bubble.innerHTML = `<p>${message.text}</p><span>${message.time}</span>`
  return bubble
}

const createReflectionPrompt = (promptText, delayedText) => {
  const aside = document.createElement('aside')
  aside.className = 'reflection-prompt'
  aside.innerHTML = `
    <p class="reflection-prompt__label">Delayed prompt</p>
    <p class="reflection-prompt__text">${promptText}</p>
    <p class="reflection-prompt__meta">Arrives: ${delayedText}</p>
  `
  return aside
}

const createEmptyState = () => {
  const state = document.createElement('div')
  state.className = 'conversation-empty'
  state.innerHTML = `
    <h3>Take your time.</h3>
    <p>No messages yet. Start with a gentle question when you both feel ready.</p>
    <ul>${conversationStarters.map((prompt) => `<li>${prompt}</li>`).join('')}</ul>
  `
  return state
}

const createInputArea = ({ paused, messagingAvailable }) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'
  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <textarea id="message-input" class="onboarding-input" rows="3" placeholder="Share a thoughtful response..." ${!messagingAvailable || paused ? 'disabled' : ''}></textarea>
    <div class="conversation-input__actions">
      <button class="button button--ghost" type="button">Pause & Reflect</button>
      <button class="button" type="submit" ${!messagingAvailable || paused ? 'disabled' : ''}>Send gently</button>
    </div>
  `

  form.addEventListener('submit', (event) => event.preventDefault())
  return form
}

export const createConversationsSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'conversations'
  section.setAttribute('aria-labelledby', 'conversations-title')

  const conversations = getConversationsMockSnapshot()
  const myCompatibilityProfile = createCompatibilityProfile({
    communicationPreference: 'reflective',
    emotionalPace: 'steady',
    conversationStyle: 'curious',
    valuesAlignment: ['care', 'honesty', 'growth'],
    socialEnergy: 'balanced',
    relationshipIntention: 'intentional_connection',
    emotionalSafetyPreference: 'gentle_clarity'
  })
  let activeId = conversationState.getState().activeConversationId || conversations[0].id

  section.innerHTML = `
    <div class="container">
      <p class="eyebrow">First conversations</p>
      <h2 id="conversations-title">A calmer way to begin talking.</h2>
      <p class="lead">No urgency, no noisy indicators, and space to pause before replying.</p>
      <div class="conversation-shell">
        <div class="conversation-shell__list" data-list></div>
        <div class="conversation-shell__detail" data-detail></div>
      </div>
    </div>
  `

  const listHost = section.querySelector('[data-list]')
  const detailHost = section.querySelector('[data-detail]')

  const render = () => {
    const active = conversations.find((item) => item.id === activeId) || conversations[0]

    const resolvedRhythm = determineWindowRhythm({
      averageReplyDelayHours: active.paused ? 30 : 10,
      emotionalSpaceNeed: active.emotionalSpaceLevel === 'tender' ? 'high' : 'medium',
      promptDensityPerDay: active.paused ? 0.25 : 1
    })

    const canOpenWindow = canWindowOpen({
      sparkStatus: active.windowState === WINDOW_STATES.OPENING || active.windowState === WINDOW_STATES.OPEN ? 'accepted' : 'invited',
      mutualParticipationReady: active.mutualParticipationReady,
      emotionalReadiness: active.emotionalSpaceLevel === 'steady' ? 0.7 : 0.4,
      isIntentionalBreakActive: active.windowState === WINDOW_STATES.PAUSED
    })

    const windowState = active.windowState || (canOpenWindow ? WINDOW_STATES.OPENING : WINDOW_STATES.UNAVAILABLE)
    const messagingAvailable = isMessagingAvailableForWindow({ state: windowState })
    const pauseState = getWindowPauseState({ state: windowState, pauseUntil: active.nextPromptAt })
    const pacingRecommendation = getIntentionalPacingRecommendation({ rhythm: resolvedRhythm, recentMessagesCount: active.messages.length, hoursSinceLastMessage: active.paused ? 18 : 4 })
    const compatibilitySignals = createCompatibilitySignals({ me: myCompatibilityProfile, other: active.compatibilityProfile })
    const resonance = createConversationResonancePlaceholder(compatibilitySignals)
    const pacingFit = createPacingFitPlaceholder(compatibilitySignals)
    const alignmentHints = createEmotionalAlignmentHints(compatibilitySignals)
    const reflectiveCompatibilityPrompts = createReflectivePromptsFromCompatibility(compatibilitySignals)

    const pacingPolicy = getFutureWindowPacingPolicyPlaceholder({ rhythm: resolvedRhythm })
    const emotionalSafety = getFutureEmotionalSafetyPlaceholder({ emotionalSpaceLevel: active.emotionalSpaceLevel })

    listHost.innerHTML = ''
    listHost.append(createConversationList(conversations, active.id))

    detailHost.innerHTML = ''
    const detail = document.createElement('article')
    detail.className = 'conversation-detail'
    detail.innerHTML = `<header class="conversation-detail__header"><h3>${active.name}</h3><p>${pauseState.isPaused ? 'Paused for reflection' : `Next prompt in ${active.nextPromptAt}`}</p><p>Window: ${windowState} · Rhythm: ${resolvedRhythm}</p><p>${messagingAvailable ? 'Messaging is gently available.' : 'Messaging is resting for now.'}</p><p>${pacingRecommendation.recommendation}</p><p>Future pacing policy: up to ${pacingPolicy.maxSuggestedMessagesPerDay} messages/day, with about ${pacingPolicy.minSuggestedReplyDelayHours}h between replies.</p><p>${emotionalSafety.shouldSuggestPause ? 'Emotional space check: suggest a pause if needed.' : 'Emotional space check: steady conversation is okay.'}</p><p>${resonance.note}</p><p>${pacingFit.note}</p><p>${alignmentHints[0]}</p></header>`

    detail.append(createReflectionPrompt(reflectiveCompatibilityPrompts[0] || conversationStarters[0], active.nextPromptAt))

    const stream = document.createElement('div')
    stream.className = 'message-stream'
    if (active.messages.length) {
      active.messages.forEach((message) => stream.append(createBubble(message)))
    } else {
      stream.append(createEmptyState())
    }

    detail.append(stream, createInputArea({ paused: pauseState.isPaused, messagingAvailable }))
    detailHost.append(detail)

    listHost.querySelectorAll('.conversation-list__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeId = btn.dataset.id
        conversationState.patch({ activeConversationId: activeId })
        render()
      })
    })
  }

  render()
  return section
}
