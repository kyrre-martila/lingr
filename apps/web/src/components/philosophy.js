const values = [
  {
    title: 'Intentional connection',
    description: 'No swiping. No endless decks. One meaningful opening at a time.'
  },
  {
    title: 'Emotional presence',
    description: 'Designed to reward reflection, not reaction.'
  },
  {
    title: 'Gradual discovery',
    description: 'People unfold through trust and consistency — not instant judgment.'
  }
]

export const createPhilosophySection = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.setAttribute('aria-labelledby', 'philosophy-title')

  const cards = values
    .map(
      value => `
      <article class="card">
        <h3>${value.title}</h3>
        <p>${value.description}</p>
      </article>
    `
    )
    .join('')

  section.innerHTML = `
    <div class="container">
      <p class="eyebrow">Philosophy</p>
      <h2 id="philosophy-title">Built for calm, not compulsion.</h2>
      <div class="grid grid--three">${cards}</div>
    </div>
  `

  return section
}
