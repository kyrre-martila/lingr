import { createGlimpsCreationFlow } from './glimps/create-flow.js'

export const createGlimpsSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'glimps'
  section.setAttribute('aria-labelledby', 'glimps-title')

  const flow = createGlimpsCreationFlow()

  section.innerHTML = `
    <div class="container onboarding-shell">
      <p class="eyebrow">Create a Glimps</p>
      <h2 id="glimps-title">A small emotional moment, shared gently.</h2>
      <p class="onboarding-subtitle">This flow is quiet by design — one intentional step at a time.</p>
    </div>
  `

  section.querySelector('.container').append(flow)
  return section
}
