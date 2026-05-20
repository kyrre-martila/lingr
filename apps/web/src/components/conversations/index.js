import { getConversationStarters, listConversationMessages, listViewerConversations, sendConversationMessage } from '../../services/conversations-service.js'
import { t } from '../../i18n/index.js'
import { DOMAIN_ERROR_KIND, PLAYING_NOW_MEDIA_TYPE } from '../../domain/contracts.js'

const PLUS_MENU = Object.freeze({
  root: { title: 'Calm menu', items: [{ id: 'apps', label: 'Apps', description: 'Match Cards, Guess Me, Snuggle', next: 'apps' }, { id: 'playing_now', label: 'Playing now', description: 'Share a song, movie, or series', next: 'playing_now' }] },
  apps: { title: 'Apps', items: [{ id: 'match_cards', label: 'Match Cards' }, { id: 'guess_me', label: 'Guess Me' }, { id: 'snuggle', label: 'Snuggle' }] },
  playing_now: { title: 'Playing now', items: [{ id: 'song', label: 'Song' }, { id: 'movie', label: 'Movie' }, { id: 'tv_series', label: 'TV Series' }] }
})

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


const interpolate = (template, params = {}) => String(template).replace(/\{(\w+)\}/g, (_, key) => String(params?.[key] ?? `{${key}}`))
const resolveLayerUnlockCopy = (content = {}) => {
  const keyMap = {
    'layer.unlock.layer2': 'chat.layer_unlock.messages.layer2',
    'layer.unlock.layer3': 'chat.layer_unlock.messages.layer3'
  }
  const mappedKey = keyMap[content?.messageKey] || ''
  const title = mappedKey ? interpolate(t(mappedKey), content?.messageParams || {}) : String(content?.title || t('chat.layer_unlock.title')).trim()
  return {
    title: String(title).trim() || t('chat.layer_unlock.title'),
    subtitle: String(content?.subtitle || t('chat.layer_unlock.subtitle')).trim(),
    ctaLabel: String(content?.ctaLabel || t('chat.layer_unlock.cta')).trim(),
    ctaRoute: String(content?.ctaRoute || '').trim()
  }
}

const createBubble = (message) => {
  if (message.type === 'layer_unlock') {
    const card = document.createElement('article')
    card.className = 'message-system-banner layer-unlock-banner'
    const { title, subtitle, ctaLabel, ctaRoute } = resolveLayerUnlockCopy(message.content)
    card.innerHTML = `
      <div class="layer-unlock-banner__icon" aria-hidden="true">✧</div>
      <div class="layer-unlock-banner__copy">
        <p class="layer-unlock-banner__title">${title}</p>
        ${subtitle ? `<p class="layer-unlock-banner__subtitle">${subtitle}</p>` : ''}
      </div>
      ${ctaLabel && ctaRoute ? `<a class="layer-unlock-banner__cta" href="${ctaRoute}">${ctaLabel}</a>` : ''}
      ${ctaLabel && !ctaRoute ? `<p class="layer-unlock-banner__cta" role="status">${ctaLabel}</p>` : ''}
    `
    return card
  }

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
      ${message.content?.posterUrl ? `<p class="playing-now-card__poster">Cover: ${message.content.posterUrl}</p>` : ''}
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
      : 'Something temporary went wrong. Please try again in a moment.'

  wrapper.innerHTML = `<h3>Unable to continue right now</h3><p>${message}</p>`
  if (error?.retryable) {
    const retry = document.createElement('button')
    retry.type = 'button'
    retry.className = 'button button--ghost'
    retry.textContent = 'Try again'
    retry.addEventListener('click', onRetry)
    wrapper.append(retry)
  }
  return wrapper
}

const createPlusMenuSheet = ({ canCompose, menuKey, onNavigate, onLeafSelect, onClose, triggerId }) => {
  const form = document.createElement('div')
  form.className = 'composer-sheet'
  form.setAttribute('role', 'dialog')
  form.setAttribute('aria-modal', 'false')
  form.setAttribute('aria-labelledby', 'composer-sheet-title')
  form.setAttribute('tabindex', '-1')
  form.dataset.menuKey = menuKey
  const menu = PLUS_MENU[menuKey]
  const isRoot = menuKey === 'root'
  form.innerHTML = `
    <div class="composer-sheet__handle" aria-hidden="true"></div>
    <div class="composer-sheet__header">
      <p class="composer-sheet__title" id="composer-sheet-title">${menu.title}</p>
      <button class="composer-sheet__back" type="button">${isRoot ? 'Close' : 'Back'}</button>
    </div>
    <ul class="composer-sheet__list" role="menu" aria-describedby="${triggerId}">
      ${menu.items.map((item) => `<li><button class="composer-sheet__item" type="button" data-item-id="${item.id}" ${canCompose ? '' : 'disabled'}>${item.label}${item.description ? `<small>${item.description}</small>` : ''}</button></li>`).join('')}
    </ul>
  `
  form.querySelector('.composer-sheet__back')?.addEventListener('click', () => (isRoot ? onClose() : onNavigate('root')))
  form.querySelectorAll('[data-item-id]').forEach((itemButton) => {
    itemButton.addEventListener('click', () => {
      const id = itemButton.getAttribute('data-item-id')
      const next = menu.items.find((item) => item.id === id)?.next
      if (next) onNavigate(next)
      else onLeafSelect(id)
    })
  })
  return form
}

const createInputArea = ({ canCompose, onSubmit, error }) => {
  const form = document.createElement('form')
  form.className = 'conversation-input'

  form.innerHTML = `
    <label for="message-input" class="sr-only">Write a message</label>
    <div class="composer-shell">
      <button id="composer-plus-trigger" class="composer-shell__plus" type="button" aria-label="Open calm menu" aria-haspopup="dialog" aria-controls="composer-plus-sheet" aria-expanded="false" ${canCompose ? '' : 'disabled'}>+</button>
      <textarea id="message-input" class="onboarding-input composer-shell__field" rows="1" placeholder="Write something gentle..." ${canCompose ? '' : 'disabled'}></textarea>
      <button class="composer-shell__send" type="submit" aria-label="Send message" ${canCompose ? '' : 'disabled'}>${canCompose ? 'Send' : 'Paused'}</button>
    </div>
    ${error ? `<p class="onboarding-form__error" role="status">${error}</p>` : ''}
  `

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const text = form.querySelector('#message-input')?.value || ''
    if (!canCompose) return
    onSubmit(text)
  })
  const plusButton = form.querySelector('.composer-shell__plus')
  let menuOpen = false
  let menuKey = 'root'
  const renderMenu = () => {
    const existing = form.querySelector('[data-plus-menu]')
    if (existing) existing.remove()
    if (!menuOpen) {
      plusButton?.setAttribute('aria-expanded', 'false')
      return
    }
    plusButton?.setAttribute('aria-expanded', 'true')
    const host = document.createElement('div')
    host.id = 'composer-plus-sheet'
    host.setAttribute('data-plus-menu', 'true')
    host.append(createPlusMenuSheet({
      canCompose,
      menuKey,
      triggerId: 'composer-plus-trigger',
      onNavigate: (nextKey) => { menuKey = nextKey; renderMenu() },
      onLeafSelect: () => {},
      onClose: () => { menuOpen = false; menuKey = 'root'; renderMenu(); plusButton?.focus() }
    }))
    form.append(host)
    host.querySelector('.composer-sheet')?.focus()
  }
  plusButton?.addEventListener('click', () => {
    menuOpen = !menuOpen
    menuKey = 'root'
    renderMenu()
  })
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault()
      menuOpen = false
      menuKey = 'root'
      renderMenu()
      plusButton?.focus()
    }
  })
  form.querySelector('#message-input')?.addEventListener('focus', () => {
    if (menuOpen) {
      menuOpen = false
      menuKey = 'root'
      renderMenu()
    }
  })
  renderMenu()

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
      <p class="lead">No urgency, no noisy indicators, and room to pause before replying.</p>
      <div class="conversation-shell"><div class="conversation-shell__list" data-list></div><div class="conversation-shell__detail" data-detail></div></div>
    </div>
  `

  const listHost = section.querySelector('[data-list]')
  const detailHost = section.querySelector('[data-detail]')

  const state = { loading: true, conversations: [], activeId: '', messagesStatus: 'idle', messages: [], messagesError: null, submitError: '', sending: false }
  let messageRequestToken = 0

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
    if (state.messagesStatus === 'loading') stream.innerHTML = '<p>Loading this conversation…</p>'
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
        if (state.sending) return
        state.submitError = ''
        const trimmed = String(text || '').trim()
        const optimisticId = `tmp_${Date.now()}`
        const optimistic = trimmed ? { messageId: optimisticId, conversationId: active.conversationId, senderUserId: 'usr_mock_viewer', type: 'text', visibility: 'conversation', deliveryState: 'queued', content: { text: trimmed } } : null
        if (optimistic) state.messages.push(optimistic)
        state.sending = true
        render()

        const response = await sendConversationMessage({ conversationId: active.conversationId, text: trimmed })
        state.sending = false

        if (response.status === 'error') {
          state.messages = state.messages.filter((item) => item.messageId !== optimisticId)
          state.submitError = response.error.kind === DOMAIN_ERROR_KIND.VALIDATION
            ? 'Please enter a message before sending.'
            : response.error.kind === DOMAIN_ERROR_KIND.AUTH
              ? 'Your session has expired. Please sign in again.'
              : response.error.kind === DOMAIN_ERROR_KIND.PERMISSION
                ? 'You cannot send messages in this conversation right now.'
                : response.error.retryable
                  ? 'Temporary send issue. Please try again.'
                  : 'Message could not be sent. Please try again in a moment.'
          render()
          return
        }

        state.messages = state.messages.filter((item) => item.messageId !== optimisticId)
        state.messages.push(response.data)
        await loadMessages()
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
    const requestToken = ++messageRequestToken
    const activeIdAtRequestStart = state.activeId
    const response = await listConversationMessages({ conversationId: activeIdAtRequestStart })
    if (requestToken !== messageRequestToken || activeIdAtRequestStart !== state.activeId) return
    if (response.status === 'error') {
      state.messagesStatus = 'error'
      state.messagesError = response.error
      state.messages = []
      return
    }
    state.messagesStatus = 'success'
    state.messages = (response.data.items || []).slice()
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
