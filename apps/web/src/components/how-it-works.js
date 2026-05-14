const concepts = [
  {
    name: 'Glimps',
    detail: 'A quiet moment shared through image, words, or voice to reveal atmosphere before appearance.'
  },
  {
    name: 'Spark',
    detail: 'A limited and intentional signal: someone noticed you today.'
  },
  {
    name: 'Layers',
    detail: 'Profiles unfold gradually through conversation and mutual care.'
  },
  {
    name: 'Pulse',
    detail: 'Daily reflective prompts that build emotional familiarity over time.'
  },
  {
    name: 'Window',
    detail: 'A mutual choice to focus deeply on one connection with slower, clearer attention.'
  }
]

export const createHowItWorksSection = () => {
  const section = document.createElement('section')
  section.className = 'section'
  section.id = 'how-it-works'
  section.setAttribute('aria-labelledby', 'how-title')

  section.innerHTML = `
    <div class="container">
      <p class="eyebrow">How Lingr works</p>
      <h2 id="how-title">A gentler path from curiosity to closeness.</h2>
      <ol class="timeline">
        ${concepts
          .map(
            (concept, index) => `
              <li class="timeline__item">
                <p class="timeline__step">0${index + 1}</p>
                <div>
                  <h3>${concept.name}</h3>
                  <p>${concept.detail}</p>
                </div>
              </li>
            `
          )
          .join('')}
      </ol>
    </div>
  `

  return section
}
