import { createStepFlowController } from '../step-flow.js'
import { createField } from '../onboarding/form-controls.js'

import { createGlimpsInitialState, glimpsMoodOptions, glimpsPromptOptions } from '../../data/mocks/glimps.js'
import { glimpsState } from '../../state/index.js'
import {
  validateGlimps,
  GLIMPS_PRIVACY_LEVELS,
  GLIMPS_EMOTIONAL_TONES,
  evaluateGlimpsSafetyPlaceholder,
  getGlimpsExpirationState
} from '../../domain/glimps/index.js'
import { createGlimps } from '../../services/glimps-service.js'
const steps = [
  { id: 'reflection', title: 'Begin with a small reflection', description: 'Write a short line about what is quietly present for you.' },
  { id: 'mood', title: 'Choose your mood', description: 'Select one mood that feels most true in this moment.' },
  { id: 'prompt', title: 'Add a gentle prompt (optional)', description: 'You can anchor your Glimps with a prompt, or leave it open.' },
  { id: 'image', title: 'Image placeholder (optional)', description: 'No upload yet — add a simple note for the image you may include later.' },
  { id: 'privacy', title: 'Privacy and tone', description: 'Choose how this moment is held and the tone you want to keep.' },
  { id: 'preview', title: 'Preview your Glimps', description: 'Read it back and check how it feels before sharing.' },
  { id: 'confirm', title: 'Glimps created', description: 'Your quiet moment has been prepared with care.' }
]
const escapeHtml = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

export const createGlimpsCreationFlow = () => {
  const state = glimpsState.patch(createGlimpsInitialState())
  const shell = document.createElement('article')
  shell.className = 'onboarding-card glimps-flow'
  shell.innerHTML = `<div class="onboarding-progress" role="status" aria-live="polite"></div><h3 id="glimps-flow-title"></h3><p class="onboarding-subtitle"></p><form class="onboarding-form" novalidate><div class="onboarding-step" data-step-content></div><p class="onboarding-error" role="status" aria-live="polite" hidden></p><div class="onboarding-actions"><button class="button button--ghost" type="button" data-back>Back</button><button class="button" type="submit" data-next>Continue</button></div></form>`

  const progress = shell.querySelector('.onboarding-progress')
  const title = shell.querySelector('#glimps-flow-title')
  const subtitle = shell.querySelector('.onboarding-subtitle')
  const form = shell.querySelector('.onboarding-form')
  const stepHost = shell.querySelector('[data-step-content]')
  const errorEl = shell.querySelector('.onboarding-error')
  const backBtn = shell.querySelector('[data-back]')
  const nextBtn = shell.querySelector('[data-next]')

  let submissionState = { status: 'idle', message: '' }

  const persist = () => {
    const data = new FormData(form)
    glimpsState.patch({
      reflection: String(data.get('reflection') || state.reflection || '').trim(),
      mood: String(data.get('mood') || state.mood || '').trim(),
      prompt: String(data.get('prompt') || state.prompt || '').trim(),
      imageNote: String(data.get('imageNote') || state.imageNote || '').trim(),
      privacy: String(data.get('privacy') || state.privacy || '').trim(),
      emotionalTone: String(data.get('emotionalTone') || state.emotionalTone || '').trim()
    })
  }

  const validateStep = (id) => {
    if (id === 'reflection' && !state.reflection) return 'Please add a short reflection before continuing.'
    if (id === 'mood' && !state.mood) return 'Please choose a mood to continue.'
    if (id === 'privacy' && !state.privacy) return 'Please choose a privacy level.'

    if (id === 'preview') {
      const validation = validateGlimps(state)
      if (!validation.valid) return 'Please review this Glimps before confirming.'
    }

    return ''
  }

  const renderStep = (step) => {
    if (step.id === 'reflection') return createField({ id: 'reflection', label: 'Reflection', value: state.reflection, multiline: true, rows: 5, required: true, placeholder: 'I paused for a minute after sunset and felt a little lighter.' }).wrapper
    if (step.id === 'mood') return `<fieldset class="onboarding-field onboarding-options flow"><legend class="onboarding-label">Mood</legend><div class="onboarding-options__list">${glimpsMoodOptions.map((mood) => `<label class="onboarding-option"><input type="radio" name="mood" value="${escapeHtml(mood)}" ${state.mood === mood ? 'checked' : ''} required><span>${escapeHtml(mood)}</span></label>`).join('')}</div></fieldset>`
    if (step.id === 'prompt') return `<fieldset class="onboarding-field onboarding-options flow"><legend class="onboarding-label">Prompt (optional)</legend><div class="onboarding-options__list">${glimpsPromptOptions.map((prompt) => `<label class="onboarding-option"><input type="radio" name="prompt" value="${escapeHtml(prompt)}" ${state.prompt === prompt ? 'checked' : ''}><span>${escapeHtml(prompt)}</span></label>`).join('')}<label class="onboarding-option"><input type="radio" name="prompt" value="" ${state.prompt ? '' : 'checked'}><span>No Glimps prompt for this one</span></label></div></fieldset>`
    if (step.id === 'image') return `<div class="onboarding-field flow"><p class="onboarding-helper">Image uploads are coming soon. You can still leave yourself a placeholder note.</p><div class="glimps-image-placeholder" aria-hidden="true">Image placeholder</div></div>${createField({ id: 'imageNote', label: 'Image note (optional)', value: state.imageNote, placeholder: 'Warm window light on the kitchen table.' }).wrapper.outerHTML}`
    if (step.id === 'privacy') return `<fieldset class="onboarding-field onboarding-options flow"><legend class="onboarding-label">Privacy level</legend><div class="onboarding-options__list"><label class="onboarding-option"><input type="radio" name="privacy" value="${GLIMPS_PRIVACY_LEVELS.PRIVATE}" ${state.privacy === GLIMPS_PRIVACY_LEVELS.PRIVATE ? 'checked' : ''} required><span>Private</span></label><label class="onboarding-option"><input type="radio" name="privacy" value="${GLIMPS_PRIVACY_LEVELS.CONNECTION_ONLY}" ${state.privacy === GLIMPS_PRIVACY_LEVELS.CONNECTION_ONLY ? 'checked' : ''} required><span>Connection only</span></label><label class="onboarding-option"><input type="radio" name="privacy" value="${GLIMPS_PRIVACY_LEVELS.VISIBLE_FOR_MATCHING}" ${state.privacy === GLIMPS_PRIVACY_LEVELS.VISIBLE_FOR_MATCHING ? 'checked' : ''} required><span>Visible for matching</span></label></div></fieldset><fieldset class="onboarding-field onboarding-options flow"><legend class="onboarding-label">Emotional tone</legend><div class="onboarding-options__list"><label class="onboarding-option"><input type="radio" name="emotionalTone" value="${GLIMPS_EMOTIONAL_TONES.SOFT}" ${state.emotionalTone === GLIMPS_EMOTIONAL_TONES.SOFT ? 'checked' : ''} required><span>Soft</span></label><label class="onboarding-option"><input type="radio" name="emotionalTone" value="${GLIMPS_EMOTIONAL_TONES.OPEN}" ${state.emotionalTone === GLIMPS_EMOTIONAL_TONES.OPEN ? 'checked' : ''} required><span>Open</span></label><label class="onboarding-option"><input type="radio" name="emotionalTone" value="${GLIMPS_EMOTIONAL_TONES.TENDER}" ${state.emotionalTone === GLIMPS_EMOTIONAL_TONES.TENDER ? 'checked' : ''} required><span>Tender</span></label><label class="onboarding-option"><input type="radio" name="emotionalTone" value="${GLIMPS_EMOTIONAL_TONES.GROUNDED}" ${state.emotionalTone === GLIMPS_EMOTIONAL_TONES.GROUNDED ? 'checked' : ''} required><span>Grounded</span></label><label class="onboarding-option"><input type="radio" name="emotionalTone" value="${GLIMPS_EMOTIONAL_TONES.UNCERTAIN}" ${state.emotionalTone === GLIMPS_EMOTIONAL_TONES.UNCERTAIN ? 'checked' : ''} required><span>Uncertain</span></label></div></fieldset>`
    if (step.id === 'preview') {
      const validation = validateGlimps(state)
      const moderation = evaluateGlimpsSafetyPlaceholder(state)
      const expiration = getGlimpsExpirationState({ glimps: state })
      return `<article class="glimps-preview" tabindex="0" aria-label="Glimps preview">${state.prompt ? `<p class="glimps-preview__prompt">${escapeHtml(state.prompt)}</p>` : ''}<p class="glimps-preview__reflection">${escapeHtml(state.reflection || '—')}</p><p class="glimps-preview__meta">Mood: ${escapeHtml(state.mood || '—')}</p><p class="glimps-preview__meta">Privacy: ${escapeHtml(state.privacy || '—')}</p><p class="glimps-preview__meta">Tone: ${escapeHtml(state.emotionalTone || '—')}</p>${state.imageNote ? `<p class="glimps-preview__meta">Image note: ${escapeHtml(state.imageNote)}</p>` : ''}<p class="glimps-preview__meta">Validation: ${validation.valid ? 'ready' : 'needs attention'}</p><p class="glimps-preview__meta">Safety placeholder: ${escapeHtml(moderation.status)}</p><p class="glimps-preview__meta">Expiration placeholder: ${escapeHtml(expiration.reason)}</p></article>`
    }
    return `<div class="glimps-confirmation"><p class="onboarding-copy">${escapeHtml(submissionState.message || 'Your Glimps is ready. Nothing has been posted or shared — this stays local in the current session.')}</p><p class="onboarding-helper">You can create another one whenever you are ready.</p></div>`
  }

  const controller = createStepFlowController({
    form,
    stepHost,
    title,
    subtitle,
    progress,
    backBtn,
    nextBtn,
    errorEl,
    steps,
    persist,
    validateStep: validateStep,
    renderStep,
    getNextLabel: (index, total) => (index === total - 1 ? 'Create another Glimps' : index === total - 2 ? 'Confirm' : 'Continue'),
    onComplete: async ({ reset, announceError, clearError }) => {
      nextBtn.disabled = true
      backBtn.disabled = true
      nextBtn.textContent = 'Saving...'
      clearError()

      const result = await createGlimps({
        reflection: state.reflection,
        mood: state.mood,
        prompt: state.prompt,
        imageNote: state.imageNote,
        privacy: state.privacy,
        emotionalTone: state.emotionalTone,
        state: 'shared'
      })

      nextBtn.disabled = false
      backBtn.disabled = false

      if (result.status === 'success') {
        submissionState = { status: 'success', message: 'Your Glimps was saved gently. It is ready whenever you want to revisit it.' }
        glimpsState.reset(createGlimpsInitialState())
        reset()
        return
      }

      if (result.error?.kind === 'validation') {
        announceError('A few details need attention before this Glimps can be saved.')
      } else if (result.error?.kind === 'permission' || result.error?.kind === 'auth') {
        announceError('This Glimps needs a signed-in session before it can be saved.')
      } else if (result.error?.retryable) {
        announceError('We could not save this Glimps just now. Please try again in a moment.')
      } else {
        announceError('We could not save this Glimps yet. Your words are still here in this draft.')
      }
    }
  })

  controller.render()
  return shell
}
