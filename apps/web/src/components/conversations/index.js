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
    <ul>${(getConversationStarters().status === 'success' ? getConversationStarters().data : []).map((prompt) => `<li>${prompt}</li>`).join('')}</ul>
  `
  return state
}

const createInputArea = ({ paused, messagingAvailable }) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'
  const canCompose = messagingAvailable && !paused
  let menuLevel = 'root'

  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <div class="composer-shell">
      <button class="composer-shell__plus" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="composer-sheet" aria-label="Open calm menu" ${canCompose ? '' : 'disabled'}>+</button>
      <textarea id="message-input" class="onboarding-input composer-shell__field" rows="1" placeholder="Write a message..." ${canCompose ? '' : 'disabled'}></textarea>
      <button class="composer-shell__send" type="submit" aria-label="Send message" ${canCompose ? '' : 'disabled'}>Send</button>
    </div>
    <div id="composer-sheet" class="composer-sheet" role="dialog" aria-label="Calm menu" hidden></div>
    <div class="conversation-input__actions">
      <button class="button button--ghost" type="button">Pause & Reflect</button>
    </div>
  `

  const plusButton = form.querySelector('.composer-shell__plus')
  const menuSheet = form.querySelector('.composer-sheet')
  const messageInput = form.querySelector('#message-input')

  const menuData = {
    root: {
      title: 'Share gently',
      items: [
        { id: 'apps', label: 'Apps', subtitle: 'Match Cards, Guess Me, Snuggle', next: 'apps' },
        { id: 'playing_now', label: 'Playing now', subtitle: 'Song, Movie, TV Series', next: 'playing_now' }
      ]
    },
    apps: {
      title: 'Apps',
      items: [
        { id: 'match_cards', label: 'Match Cards' },
        { id: 'guess_me', label: 'Guess Me' },
        { id: 'snuggle', label: 'Snuggle' }
      ]
    },
    playing_now: {
      title: 'Playing now',
      items: [
        { id: 'song', label: 'Song' },
        { id: 'movie', label: 'Movie' },
        { id: 'tv_series', label: 'TV Series' }
      ]
    }
  }

  const renderMenu = () => {
    const view = menuData[menuLevel]
    const canGoBack = menuLevel !== 'root'
    menuSheet.innerHTML = `
      <div class="composer-sheet__handle" aria-hidden="true"></div>
      <div class="composer-sheet__header">
        <p class="composer-sheet__title">${view.title}</p>
        ${canGoBack ? '<button type="button" class="composer-sheet__back">Back</button>' : ''}
      </div>
      <ul class="composer-sheet__list" aria-label="${view.title} menu options">
        ${view.items.map((item) => `<li><button class="composer-sheet__item" type="button" data-id="${item.id}" ${item.next ? `data-next="${item.next}"` : ''}><span>${item.label}</span>${item.subtitle ? `<small>${item.subtitle}</small>` : ''}</button></li>`).join('')}
      </ul>
    `

    const backButton = menuSheet.querySelector('.composer-sheet__back')
    if (backButton) backButton.addEventListener('click', () => {
      menuLevel = 'root'
      renderMenu()
    })

    menuSheet.querySelectorAll('.composer-sheet__item').forEach((itemButton) => {
      itemButton.addEventListener('click', () => {
        const nextLevel = itemButton.dataset.next
        if (nextLevel) {
          menuLevel = nextLevel
          renderMenu()
        }
      })
    })
  }

  const closeMenu = () => {
    menuSheet.hidden = true
    plusButton?.setAttribute('aria-expanded', 'false')
  }

  const openMenu = () => {
    menuLevel = 'root'
    renderMenu()
    menuSheet.hidden = false
    plusButton?.setAttribute('aria-expanded', 'true')
  }

  plusButton?.addEventListener('click', () => {
    if (menuSheet.hidden) openMenu()
    else closeMenu()
  })

  form.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menuSheet.hidden) {
      closeMenu()
      plusButton?.focus()
    }
  })

  messageInput?.addEventListener('focus', () => {
    if (!menuSheet.hidden) closeMenu()
  })

  form.addEventListener('submit', (event) => event.preventDefault())
  return form
}

export const createConversationsSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'conversations'
  section.setAttribute('aria-labelledby', 'conversations-title')

  const conversationsResponse = getConversationsSnapshot()
  const conversations = conversationsResponse.status === 'success' ? conversationsResponse.data : []
  const myCompatibilityProfile = createCompatibilityProfile({
    communicationPreference: 'reflective',
    emotionalPace: 'steady',
    conversationStyle: 'curious',
    valuesAlignment: ['care', 'honesty', 'growth'],
    socialEnergy: 'balanced',
    relationshipIntention: 'intentional_connection',
    emotionalSafetyPreference: 'gentle_clarity'
  })
  let activeId = conversationState.getState().activeConversationId || conversations[0]?.id || ''

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
    if (!active) {
      detailHost.innerHTML = '<article class="conversation-detail"><p>Conversation unavailable right now. Please retry.</p></article>'
      return
    }
    const vm = createConversationSessionViewModel({ conversation: active, sessionContext: { meCompatibilityProfile: myCompatibilityProfile } })

    listHost.innerHTML = ''
    listHost.append(createConversationList(conversations, active.id))

    detailHost.innerHTML = ''
    const detail = document.createElement('article')
    detail.className = 'conversation-detail'
    const pacing = vm.policy.pacing
    const headerNotes = vm.recommendations.filter((r) => [RECOMMENDATION_TYPES.PACING, RECOMMENDATION_TYPES.COMPATIBILITY, RECOMMENDATION_TYPES.SAFETY].includes(r.type)).map((r) => `<p>${r.text}</p>`).join('')
    detail.innerHTML = `<header class="conversation-detail__header"><h3>${vm.header.name}</h3><p>${vm.header.statusLine}</p><p>${vm.header.windowLine}</p><p>${vm.header.messagingLine}</p>${headerNotes}<p>Future pacing policy: up to ${pacing.maxSuggestedMessagesPerDay} messages/day, with about ${pacing.minSuggestedReplyDelayHours}h between replies.</p><p>${vm.policy.emotionalSafety.shouldSuggestPause ? 'Emotional space check: suggest a pause if needed.' : 'Emotional space check: steady conversation is okay.'}</p><p>Safety state: ${vm.safety.state.replaceAll('_', ' ')}</p><p>Trust signal: ${vm.safety.trustSignal.replaceAll('_', ' ')}</p><p>${vm.safety.boundaryCheck.respectsBoundaries ? 'Boundary preferences currently look respected.' : 'A boundary preference check-in is recommended.'}</p><p>Reporting foundation: ${vm.safety.reportingHook.summary}</p></header>`

    const starters = getConversationStarters()
    detail.append(createReflectionPrompt(vm.reflectivePrompt || (starters.status === 'success' ? starters.data[0] : 'Share a gentle check-in.'), active.nextPromptAt))

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
