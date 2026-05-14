import { conversations, conversationStarters } from './mock-data.js'

const createConversationList = (items, activeId) => {
  const list = document.createElement('ul')
  list.className = 'conversation-list'
  list.setAttribute('role', 'listbox')
  list.setAttribute('aria-label', 'Conversations')

  items.forEach((conversation) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <button class="conversation-list__item ${conversation.id === activeId ? 'is-active' : ''}" type="button" role="option" aria-selected="${conversation.id === activeId}">
        <p class="conversation-list__name">${conversation.name}</p>
        <p class="conversation-list__meta">${conversation.mood} · ${conversation.updatedAt}</p>
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
  bubble.tabIndex = 0
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

const createInputArea = (paused) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'
  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <textarea id="message-input" class="onboarding-input" rows="3" placeholder="Share a thoughtful response..." ${paused ? 'disabled' : ''}></textarea>
    <div class="conversation-input__actions">
      <button class="button button--ghost" type="button">Pause & Reflect</button>
      <button class="button" type="submit" ${paused ? 'disabled' : ''}>Send gently</button>
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

  let activeId = conversations[0].id

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

    listHost.innerHTML = ''
    listHost.append(createConversationList(conversations, active.id))

    detailHost.innerHTML = ''
    const detail = document.createElement('article')
    detail.className = 'conversation-detail'
    detail.innerHTML = `<header class="conversation-detail__header"><h3>${active.name}</h3><p>${active.paused ? 'Paused for reflection' : `Next prompt in ${active.nextPromptAt}`}</p></header>`

    detail.append(createReflectionPrompt(conversationStarters[0], active.nextPromptAt))

    const stream = document.createElement('div')
    stream.className = 'message-stream'
    if (active.messages.length) {
      active.messages.forEach((message) => stream.append(createBubble(message)))
    } else {
      stream.append(createEmptyState())
    }

    detail.append(stream, createInputArea(active.paused))
    detailHost.append(detail)

    listHost.querySelectorAll('.conversation-list__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeId = btn.dataset.id
        render()
      })
    })
  }

  render()
  return section
}
