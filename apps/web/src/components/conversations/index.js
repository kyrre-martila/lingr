import { getConversationStarters, getConversationsSnapshot } from '../../services/conversations-service.js'
import { conversationState } from '../../state/index.js'
import { createCompatibilityProfile } from '../../domain/compatibility/index.js'
import { createConversationSessionViewModel } from '../../domain/conversation-session/index.js'
import { RECOMMENDATION_TYPES } from '../../domain/contracts.js'

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
    <ul>${getConversationStarters().map((prompt) => `<li>${prompt}</li>`).join('')}</ul>
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

  const conversations = getConversationsSnapshot()
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
    const vm = createConversationSessionViewModel({ conversation: active, sessionContext: { meCompatibilityProfile: myCompatibilityProfile } })

    listHost.innerHTML = ''
    listHost.append(createConversationList(conversations, active.id))

    detailHost.innerHTML = ''
    const detail = document.createElement('article')
    detail.className = 'conversation-detail'
    const pacing = vm.policy.pacing
    const headerNotes = vm.recommendations.filter((r) => [RECOMMENDATION_TYPES.PACING, RECOMMENDATION_TYPES.COMPATIBILITY, RECOMMENDATION_TYPES.SAFETY].includes(r.type)).map((r) => `<p>${r.text}</p>`).join('')
    detail.innerHTML = `<header class="conversation-detail__header"><h3>${vm.header.name}</h3><p>${vm.header.statusLine}</p><p>${vm.header.windowLine}</p><p>${vm.header.messagingLine}</p>${headerNotes}<p>Future pacing policy: up to ${pacing.maxSuggestedMessagesPerDay} messages/day, with about ${pacing.minSuggestedReplyDelayHours}h between replies.</p><p>${vm.policy.emotionalSafety.shouldSuggestPause ? 'Emotional space check: suggest a pause if needed.' : 'Emotional space check: steady conversation is okay.'}</p><p>Safety state: ${vm.safety.state.replaceAll('_', ' ')}</p><p>Trust signal: ${vm.safety.trustSignal.replaceAll('_', ' ')}</p><p>${vm.safety.boundaryCheck.respectsBoundaries ? 'Boundary preferences currently look respected.' : 'A boundary preference check-in is recommended.'}</p><p>Reporting foundation: ${vm.safety.reportingHook.summary}</p></header>`

    detail.append(createReflectionPrompt(vm.reflectivePrompt || getConversationStarters()[0], active.nextPromptAt))

    const stream = document.createElement('div')
    stream.className = 'message-stream'
    if (active.messages.length) active.messages.forEach((message) => stream.append(createBubble(message)))
    else stream.append(createEmptyState())

    detail.append(stream, createInputArea({ paused: vm.paused, messagingAvailable: vm.messagingAvailable }))
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
