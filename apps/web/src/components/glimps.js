const previews = [
  'A photo of your morning light and what it meant.',
  'A short voice note about what grounded you today.',
  'A single sentence that reveals your mood with honesty.'
]

export const createGlimpsSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.id = 'glimps'
  section.setAttribute('aria-labelledby', 'glimps-title')

  section.innerHTML = `
    <div class="container">
      <p class="eyebrow">Glimps</p>
      <h2 id="glimps-title">Small signals, meaningful texture.</h2>
      <div class="grid grid--three">
        ${previews
          .map(
            text => `<article class="card"><p>${text}</p></article>`
          )
          .join('')}
      </div>
    </div>
  `

  return section
}
