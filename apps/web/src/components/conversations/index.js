import { getConversationStarters, listConversationMessages, listViewerConversations, sendConversationMessage, sendConversationPayloadMessage } from '../../services/conversations-service.js'
import { DOMAIN_ERROR_KIND, PLAYING_NOW_MEDIA_TYPE } from '../../domain/contracts.js'

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
  if (message.type === 'playing_now') {
    const card = document.createElement('article')
    const isMe = message.senderUserId === 'usr_mock_viewer'
    const media = message.content?.mediaType || 'song'
    const mediaLabel = media === PLAYING_NOW_MEDIA_TYPE.SONG ? 'Song' : media === PLAYING_NOW_MEDIA_TYPE.MOVIE ? 'Movie' : 'TV Series'
    card.className = `message-bubble playing-now-card ${isMe ? 'message-bubble--me' : 'message-bubble--them'}`
    card.innerHTML = `
      <p class="playing-now-card__lead">Playing now · ${mediaLabel}</p>
      <p class="playing-now-card__title">${message.content?.title || 'Unknown title'}</p>
      ${message.content?.creator ? `<p class="playing-now-card__creator">${message.content.creator}</p>` : ''}
      ${message.content?.context ? `<p class="playing-now-card__context">${message.content.context}</p>` : ''}
      ${message.content?.posterUrl ? `<p class="playing-now-card__poster">Cover: ${message.content.posterUrl.startsWith('placeholder://') ? 'Placeholder artwork' : message.content.posterUrl}</p>` : ''}
    `
    return card
  }

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

const createPlayingNowComposer = ({ canCompose, onSubmit, onClose, error }) => {
  const form = document.createElement('form')
  form.className = 'composer-sheet'
  form.innerHTML = `
    <div class="composer-sheet__handle" aria-hidden="true"></div>
    <div class="composer-sheet__header">
      <p class="composer-sheet__title">Share Playing now</p>
      <button class="composer-sheet__back" type="button">Close</button>
    </div>
    <label class="onboarding-label" for="playing-media-type">Type</label>
    <select id="playing-media-type" class="onboarding-input" ${canCompose ? '' : 'disabled'}>
      <option value="song">Song</option>
      <option value="movie">Movie</option>
      <option value="tv_series">TV Series</option>
    </select>
    <label class="onboarding-label" for="playing-title">Title</label>
    <input id="playing-title" class="onboarding-input" type="text" maxlength="120" placeholder="What are you into right now?" ${canCompose ? '' : 'disabled'} />
    <label class="onboarding-label" for="playing-creator">Artist / creator (optional)</label>
    <input id="playing-creator" class="onboarding-input" type="text" maxlength="120" placeholder="Artist, director, or creator" ${canCompose ? '' : 'disabled'} />
    <label class="onboarding-label" for="playing-poster">Cover / poster URL (optional)</label>
    <input id="playing-poster" class="onboarding-input" type="url" maxlength="300" placeholder="Leave blank to use a placeholder" ${canCompose ? '' : 'disabled'} />
    <label class="onboarding-label" for="playing-context">Context (optional)</label>
    <textarea id="playing-context" class="onboarding-input" rows="2" maxlength="160" placeholder="Short note, like your mood or why it fits today" ${canCompose ? '' : 'disabled'}></textarea>
    ${error ? `<p class="onboarding-form__error" role="status">${error}</p>` : ''}
    <button class="button" type="submit" ${canCompose ? '' : 'disabled'}>Share card</button>
  `
  form.querySelector('.composer-sheet__back')?.addEventListener('click', onClose)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    onSubmit({
      mediaType: String(form.querySelector('#playing-media-type')?.value || ''),
      title: String(form.querySelector('#playing-title')?.value || ''),
      creator: String(form.querySelector('#playing-creator')?.value || ''),
      posterUrl: String(form.querySelector('#playing-poster')?.value || ''),
      context: String(form.querySelector('#playing-context')?.value || '')
    })
  })
  return form
}

const createInputArea = ({ canCompose, onSubmit, onSubmitPlayingNow, error, playingNowError }) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'

  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <div class="composer-shell">
      <button class="composer-shell__plus" type="button" aria-label="Open calm menu" aria-expanded="false" ${canCompose ? '' : 'disabled'}>+</button>
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
  const plusButton = form.querySelector('.composer-shell__plus')
  let playingNowOpen = false
  const renderPlayingNowComposer = () => {
    const existing = form.querySelector('[data-playing-now-composer]')
    if (existing) existing.remove()
    if (!playingNowOpen) {
      plusButton?.setAttribute('aria-expanded', 'false')
      return
    }
    plusButton?.setAttribute('aria-expanded', 'true')
    const host = document.createElement('div')
    host.setAttribute('data-playing-now-composer', 'true')
    host.append(createPlayingNowComposer({
      canCompose,
      error: playingNowError,
      onClose: () => { playingNowOpen = false; renderPlayingNowComposer() },
      onSubmit: (payload) => onSubmitPlayingNow(payload)
    }))
    form.append(host)
  }
  plusButton?.addEventListener('click', () => {
    playingNowOpen = !playingNowOpen
    renderPlayingNowComposer()
  })
  renderPlayingNowComposer()

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

  const state = { loading: true, conversations: [], activeId: '', messagesStatus: 'idle', messages: [], messagesError: null, submitError: '', playingNowError: '' }

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
      playingNowError: state.playingNowError,
      onSubmit: async (text) => {
        state.submitError = ''
        state.playingNowError = ''
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
      },
      onSubmitPlayingNow: async (content) => {
        state.submitError = ''
        state.playingNowError = ''
        const response = await sendConversationPayloadMessage({
          conversationId: active.conversationId,
          type: 'playing_now',
          content
        })
        if (response.status === 'error') {
          state.playingNowError = response.error.kind === DOMAIN_ERROR_KIND.VALIDATION
            ? 'Please choose a type and add a title before sharing.'
            : response.error.kind === DOMAIN_ERROR_KIND.PERMISSION
              ? 'You cannot share Playing now in this conversation right now.'
              : 'Playing now could not be shared. Retry in a moment.'
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
