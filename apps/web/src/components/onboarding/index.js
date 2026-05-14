import { createField, createIntentionsField } from './form-controls.js'

const intentionOptions = [
  'Slow dating',
  'Long-term relationship',
  'Friendship first',
  'Open to seeing where things go'
]

const reflectionPrompts = [
  'What kind of connection are you hoping for?',
  'What makes you feel emotionally safe?',
  'What kind of conversations stay with you?'
]

const createSteps = (state) => [
  {
    id: 'welcome',
    title: 'Welcome to Lingr',
    description: 'A slower onboarding to help you enter with intention.',
    render: () => '<p class="onboarding-copy">We will ask a few gentle questions before you begin.</p>'
  },
  {
    id: 'name',
    title: 'What should we call you?',
    description: 'Your first name helps keep conversations personal.',
    render: () => createField({ id: 'name', label: 'Name', value: state.name, placeholder: 'Avery', required: true })
  },
  {
    id: 'age',
    title: 'How old are you?',
    description: 'Required to shape an age-appropriate experience.',
    render: () => createField({ id: 'age', label: 'Age', type: 'number', value: state.age, min: 18, max: 99, required: true })
  },
  {
    id: 'location',
    title: 'Where are you based?',
    description: 'City and region are enough for now.',
    render: () => createField({ id: 'location', label: 'Location', value: state.location, placeholder: 'Seattle, WA', required: true })
  },
  {
    id: 'intention',
    title: 'What kind of connection are you open to?',
    description: 'Choose the path that feels truest right now.',
    render: () => createIntentionsField({ selected: state.relationshipIntention, options: intentionOptions })
  },
  {
    id: 'reflection',
    title: 'A short reflection',
    description: 'Share what is present for you lately.',
    render: () => createField({
      id: 'reflection',
      label: 'Reflection',
      value: state.reflection,
      multiline: true,
      required: true,
      helper: reflectionPrompts.map((prompt) => `• ${prompt}`).join(' '),
      placeholder: 'I am hoping for conversations that feel calm and genuine.'
    })
  },
  {
    id: 'confirm',
    title: 'You are ready to begin',
    description: 'Review your details and confirm when this feels right.',
    render: () => `
      <dl class="onboarding-review">
        <div><dt>Name</dt><dd>${state.name || '—'}</dd></div>
        <div><dt>Age</dt><dd>${state.age || '—'}</dd></div>
        <div><dt>Location</dt><dd>${state.location || '—'}</dd></div>
        <div><dt>Intention</dt><dd>${state.relationshipIntention || '—'}</dd></div>
      </dl>
      <p class="onboarding-copy">Your responses stay local for now while we finish the next build phase.</p>
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

export const createOnboardingSection = () => {
  const state = {
    name: '',
    age: '',
    location: '',
    relationshipIntention: '',
    reflection: ''
  }

  let stepIndex = 0
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'onboarding'
  section.setAttribute('aria-labelledby', 'onboarding-title')

  section.innerHTML = `
    <div class="container onboarding-shell">
      <div class="onboarding-progress" role="status" aria-live="polite"></div>
      <article class="onboarding-card">
        <p class="eyebrow">Onboarding</p>
        <h2 id="onboarding-title"></h2>
        <p class="onboarding-subtitle"></p>
        <form class="onboarding-form" novalidate>
          <div class="onboarding-step" data-step-content></div>
          <p class="onboarding-error" role="alert" aria-live="assertive"></p>
          <div class="onboarding-actions">
            <button class="button button--ghost" type="button" data-back>Back</button>
            <button class="button" type="submit" data-next>Continue</button>
          </div>
        </form>
      </article>
    </div>
  `

  const form = section.querySelector('.onboarding-form')
  const title = section.querySelector('#onboarding-title')
  const subtitle = section.querySelector('.onboarding-subtitle')
  const progress = section.querySelector('.onboarding-progress')
  const stepHost = section.querySelector('[data-step-content]')
  const backBtn = section.querySelector('[data-back]')
  const nextBtn = section.querySelector('[data-next]')
  const errorEl = section.querySelector('.onboarding-error')

  const persistFromInputs = () => {
    const data = new FormData(form)
    state.name = String(data.get('name') || state.name || '').trim()
    state.age = String(data.get('age') || state.age || '').trim()
    state.location = String(data.get('location') || state.location || '').trim()
    state.relationshipIntention = String(data.get('relationshipIntention') || state.relationshipIntention || '').trim()
    state.reflection = String(data.get('reflection') || state.reflection || '').trim()
  }

  const validateStep = (stepId) => {
    const required = requiredFieldsByStep[stepId]
    if (!required) return ''

    for (const field of required) {
      if (!state[field]) return 'Please complete this step before continuing.'
    }

    if (stepId === 'age') {
      const age = Number(state.age)
      if (Number.isNaN(age) || age < 18 || age > 99) return 'Please enter an age between 18 and 99.'
    }

    return ''
  }

  const render = () => {
    const steps = createSteps(state)
    const step = steps[stepIndex]
    title.textContent = step.title
    subtitle.textContent = step.description
    progress.textContent = `Step ${stepIndex + 1} of ${steps.length}`
    backBtn.disabled = stepIndex === 0
    nextBtn.textContent = stepIndex === steps.length - 1 ? 'Finish' : 'Continue'
    errorEl.textContent = ''

    stepHost.classList.remove('is-visible')
    stepHost.innerHTML = ''
    const rendered = step.render()
    if (typeof rendered === 'string') {
      stepHost.innerHTML = rendered
    } else if (rendered?.wrapper) {
      stepHost.append(rendered.wrapper)
    } else {
      stepHost.append(rendered)
    }

    requestAnimationFrame(() => stepHost.classList.add('is-visible'))
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    persistFromInputs()

    const steps = createSteps(state)
    const current = steps[stepIndex]
    const error = validateStep(current.id)
    if (error) {
      errorEl.textContent = error
      return
    }

    if (stepIndex < steps.length - 1) {
      stepIndex += 1
      render()
      return
    }

    nextBtn.disabled = true
    nextBtn.textContent = 'Complete'
    errorEl.textContent = 'Onboarding complete. We will save this to your profile in a future release.'
  })

  backBtn.addEventListener('click', () => {
    persistFromInputs()
    if (stepIndex > 0) {
      stepIndex -= 1
      render()
    }
  })

  render()
  return section
}
