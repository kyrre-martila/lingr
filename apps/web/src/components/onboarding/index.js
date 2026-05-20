import { createField, createIntentionsField } from './form-controls.js'
import { createStepFlowController } from '../step-flow.js'

import { createOnboardingInitialState, onboardingIntentionOptions, onboardingReflectionPrompts } from '../../data/mocks/onboarding.js'
import { onboardingState, uiPreferencesState } from '../../state/index.js'

const createSteps = (state) => [
  {
    id: 'welcome',
    title: 'Welcome to Lingr',
    description: 'Take a breath. There is no rush here.',
    render: () => '<p class="onboarding-copy">We will move through a few quiet prompts so your profile feels true, not performative.</p>'
  },
  {
    id: 'name',
    title: 'What name feels right to share here?',
    description: 'First name only. You can always adjust this later.',
    render: () => createField({ id: 'name', label: 'Name', value: state.name, placeholder: 'Avery', required: true })
  },
  {
    id: 'age',
    title: 'How old are you?',
    description: 'This helps us keep introductions age-appropriate and safe.',
    render: () => createField({ id: 'age', label: 'Age', type: 'number', value: state.age, min: 18, max: 99, required: true })
  },
  {
    id: 'location',
    title: 'Where are you based?',
    description: 'City and region are enough. Exact location stays private.',
    render: () => createField({ id: 'location', label: 'Location', value: state.location, placeholder: 'Seattle, WA', required: true })
  },
  {
    id: 'intention',
    title: 'What kind of connection are you open to?',
    description: 'Choose the path that feels truest right now.',
    render: () => createIntentionsField({ selected: state.relationshipIntention, options: onboardingIntentionOptions })
  },
  {
    id: 'reflection',
    title: 'A short reflection',
    description: 'Share something honest that has been on your mind lately.',
    render: () => createField({
      id: 'reflection',
      label: 'Reflection',
      value: state.reflection,
      multiline: true,
      required: true,
      helper: onboardingReflectionPrompts.map((prompt) => `• ${prompt}`).join(' '),
      placeholder: 'I am hoping for conversations that feel calm and genuine.'
    })
  },
  {
    id: 'confirm',
    title: 'Pause and review',
    description: 'Read this once more and continue when it feels settled.',
    render: () => `
      <dl class="onboarding-review">
        <div><dt>Name</dt><dd>${state.name || '—'}</dd></div>
        <div><dt>Age</dt><dd>${state.age || '—'}</dd></div>
        <div><dt>Location</dt><dd>${state.location || '—'}</dd></div>
        <div><dt>Intention</dt><dd>${state.relationshipIntention || '—'}</dd></div>
      </dl>
      <p class="onboarding-copy">Your responses are only used to shape a calmer introduction experience.</p>
    `
  }
]

const requiredFieldsByStep = {
  name: ['name'],
  age: ['age'],
  location: ['location'],
  intention: ['relationshipIntention'],
  reflection: ['reflection']
}

export const createOnboardingSection = ({ compactHeader = false } = {}) => {
  const state = onboardingState.patch(createOnboardingInitialState())

  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'onboarding'
  section.setAttribute('aria-labelledby', 'onboarding-title')

  section.innerHTML = `
    <div class="container onboarding-shell">
      <div class="onboarding-progress" role="status" aria-live="polite"></div>
      <article class="onboarding-card">
        <p class="eyebrow" data-onboarding-eyebrow>Onboarding</p>
        <h2 id="onboarding-title"></h2>
        <p class="onboarding-subtitle"></p>
        <form class="onboarding-form" novalidate>
          <div class="onboarding-step" data-step-content></div>
          <p class="onboarding-error status-notice status-notice--error" role="status" aria-live="polite" hidden></p>
          <div class="onboarding-actions">
            <button class="button button--ghost" type="button" data-back>Back</button>
            <button class="button" type="submit" data-next>Continue</button>
          </div>
        </form>
      </article>
    </div>
  `

  const form = section.querySelector('.onboarding-form')
  const eyebrow = section.querySelector('[data-onboarding-eyebrow]')
  const title = section.querySelector('#onboarding-title')
  const subtitle = section.querySelector('.onboarding-subtitle')
  const progress = section.querySelector('.onboarding-progress')
  const stepHost = section.querySelector('[data-step-content]')
  const backBtn = section.querySelector('[data-back]')
  const nextBtn = section.querySelector('[data-next]')
  const errorEl = section.querySelector('.onboarding-error')

  const prefs = uiPreferencesState.getState()
  if (compactHeader || prefs.compactOnboardingHeader) {
    eyebrow?.remove()
    title.classList.add('sr-only')
    subtitle.classList.add('sr-only')
  }

  const persistFromInputs = () => {
    const data = new FormData(form)
    onboardingState.patch({
      name: String(data.get('name') || state.name || '').trim(),
      age: String(data.get('age') || state.age || '').trim(),
      location: String(data.get('location') || state.location || '').trim(),
      relationshipIntention: String(data.get('relationshipIntention') || state.relationshipIntention || '').trim(),
      reflection: String(data.get('reflection') || state.reflection || '').trim()
    })
  }

  const validateStep = (stepId) => {
    const required = requiredFieldsByStep[stepId]
    if (!required) return ''

    for (const field of required) {
      if (!state[field]) return 'Take your time—please complete this step before continuing.'
    }

    if (stepId === 'age') {
      const age = Number(state.age)
      if (Number.isNaN(age) || age < 18 || age > 99) return 'Please enter an age between 18 and 99.'
    }

    return ''
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
    steps: createSteps(state),
    persist: persistFromInputs,
    validateStep,
    renderStep: (step) => step.render(),
    getNextLabel: (index, total) => (index === total - 1 ? 'Finish' : 'Continue'),
    onComplete: ({ announceError }) => {
      nextBtn.disabled = true
      nextBtn.textContent = 'Complete'
      announceError('You are all set. Your profile foundation is ready.')
      section.querySelector('#onboarding-title')?.focus?.()
    }
  })

  controller.render()
  return section
}
