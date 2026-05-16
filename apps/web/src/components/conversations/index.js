import { getConversationStarters, listConversationMessages, listViewerConversations, sendConversationMessage } from '../../services/conversations-service.js'
import { DOMAIN_ERROR_KIND } from '../../domain/contracts.js'

const createConversationList = (items, activeId, onSelect) => {
  const list = document.createElement('ul')
  list.className = 'conversation-list'
  list.setAttribute('aria-label', 'Conversations')

  items.forEach((conversation) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <button class="conversation-list__item ${conversation.conversationId === activeId ? 'is-active' : ''}" type="button" aria-current="${conversation.conversationId === activeId ? 'true' : 'false'}">
        <p class="conversation-list__name">${conversation.profile?.name || 'Conversation'}</p>
        <p class="conversation-list__meta">${conversation.profile?.mood || 'Calm conversation'} · ${conversation.state}</p>
        <p class="conversation-list__preview">${conversation.profile?.preview || 'Take your time.'}</p>
      </button>
    `
    const button = li.querySelector('button')
    button.dataset.id = conversation.conversationId
    button.addEventListener('click', () => onSelect(conversation.conversationId))
    list.append(li)
  })

  return list
}

const createBubble = (message) => {
  const bubble = document.createElement('article')
  const isMe = message.senderUserId === 'usr_mock_viewer'
  bubble.className = `message-bubble ${isMe ? 'message-bubble--me' : 'message-bubble--them'}`
  bubble.innerHTML = `<p>${message.content?.text || ''}</p>`
  return bubble
}

const createErrorBlock = (error, onRetry) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'conversation-empty'
  const kind = error?.kind
  const message = kind === DOMAIN_ERROR_KIND.VALIDATION
    ? 'Please check your message and try again.'
    : kind === DOMAIN_ERROR_KIND.PERMISSION
      ? 'This conversation is unavailable for your account right now.'
      : 'Something temporary went wrong. Please retry.'

  wrapper.innerHTML = `<h3>Unable to continue</h3><p>${message}</p>`
  if (error?.retryable) {
    const retry = document.createElement('button')
    retry.type = 'button'
    retry.className = 'button button--ghost'
    retry.textContent = 'Retry'
    retry.addEventListener('click', onRetry)
    wrapper.append(retry)
  }
  return wrapper
}

const createInputArea = ({ canCompose, onSubmit, error }) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'

  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <div class="composer-shell">
      <button class="composer-shell__plus" type="button" aria-label="Open calm menu" ${canCompose ? '' : 'disabled'}>+</button>
      <textarea id="message-input" class="onboarding-input composer-shell__field" rows="1" placeholder="Write a message..." ${canCompose ? '' : 'disabled'}></textarea>
      <button class="composer-shell__send" type="submit" aria-label="Send message" ${canCompose ? '' : 'disabled'}>Send</button>
    </div>
    ${error ? `<p class="onboarding-form__error" role="status">${error}</p>` : ''}
  `

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const text = form.querySelector('#message-input')?.value || ''
    onSubmit(text)
  })

  return form
}

export const createConversationsSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'conversations'
  section.setAttribute('aria-labelledby', 'conversations-title')
  section.innerHTML = `
    <div class="container">
      <p class="eyebrow">First conversations</p>
      <h2 id="conversations-title">A calmer way to begin talking.</h2>
      <p class="lead">No urgency, no noisy indicators, and space to pause before replying.</p>
      <div class="conversation-shell"><div class="conversation-shell__list" data-list></div><div class="conversation-shell__detail" data-detail></div></div>
    </div>
  `

  const listHost = section.querySelector('[data-list]')
  const detailHost = section.querySelector('[data-detail]')

  const state = { loading: true, conversations: [], activeId: '', messagesStatus: 'idle', messages: [], messagesError: null, submitError: '' }

  const render = () => {
    if (state.loading) {
      listHost.innerHTML = '<p>Loading conversations…</p>'
      detailHost.innerHTML = '<article class="conversation-detail"><p>Loading messages…</p></article>'
      return
    }

    listHost.innerHTML = ''
    listHost.append(createConversationList(state.conversations, state.activeId, async (nextId) => {
      state.activeId = nextId
      await loadMessages()
      render()
    }))

    const active = state.conversations.find((item) => item.conversationId === state.activeId)
    if (!active) return

    detailHost.innerHTML = ''
    const detail = document.createElement('article')
    detail.className = 'conversation-detail'
    detail.innerHTML = `<header class="conversation-detail__header"><h3>${active.profile?.name || 'Conversation'}</h3><p>${active.state}</p></header>`

    const stream = document.createElement('div')
    stream.className = 'message-stream'
    if (state.messagesStatus === 'loading') stream.innerHTML = '<p>Loading timeline…</p>'
    else if (state.messagesStatus === 'error') stream.append(createErrorBlock(state.messagesError, async () => { await loadMessages(); render() }))
    else if (state.messages.length) state.messages.forEach((message) => stream.append(createBubble(message)))
    else {
      const starters = getConversationStarters()
      stream.innerHTML = `<div class="conversation-empty"><h3>Take your time.</h3><ul>${(starters.status === 'success' ? starters.data : []).map((prompt) => `<li>${prompt}</li>`).join('')}</ul></div>`
    }

    detail.append(stream)
    detail.append(createInputArea({
      canCompose: active.state === 'active',
      error: state.submitError,
      onSubmit: async (text) => {
        state.submitError = ''
        const response = await sendConversationMessage({ conversationId: active.conversationId, text })
        if (response.status === 'error') {
          state.submitError = response.error.kind === DOMAIN_ERROR_KIND.VALIDATION
            ? 'Please enter a message before sending.'
            : response.error.kind === DOMAIN_ERROR_KIND.PERMISSION
              ? 'You cannot send messages in this conversation right now.'
              : 'Message could not be sent. Retry in a moment.'
          render()
          return
        }
        state.messages.push(response.data)
        render()
      }
    }))
    detailHost.append(detail)
  }

  const loadMessages = async () => {
    if (!state.activeId) return
    state.messagesStatus = 'loading'
    state.messagesError = null
    render()
    const response = await listConversationMessages({ conversationId: state.activeId })
    if (response.status === 'error') {
      state.messagesStatus = 'error'
      state.messagesError = response.error
      state.messages = []
      return
    }
    state.messagesStatus = 'success'
    state.messages = response.data.items || []
  }

  const boot = async () => {
    const response = await listViewerConversations()
    state.loading = false
    if (response.status === 'success') {
      state.conversations = response.data
      state.activeId = response.data[0]?.conversationId || ''
      await loadMessages()
    }
    render()
  }

  boot()
  render()
  return section
}
