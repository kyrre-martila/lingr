export const createSafetySection = () => {
  const section = document.createElement('section')
  section.className = 'section'
  section.id = 'safety'
  section.setAttribute('aria-labelledby', 'safety-title')

  section.innerHTML = `
    <div class="container flow">
      <p class="eyebrow">Safety</p>
      <h2 id="safety-title">Boundaries are built into every step.</h2>
      <p class="lead">Lingr supports emotional safety with paced reveals, intentional consent, and clear control over your visibility and responses.</p>
      <div class="card">
        <p>From the first Glimps to deeper conversation, each layer unfolds only with mutual choice.</p>
      </div>
    </div>
  `

  return section
}
