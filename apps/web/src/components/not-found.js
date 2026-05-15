export const createNotFoundView = () => {
  const section = document.createElement('section')
  section.className = 'section section--paper'
  section.setAttribute('aria-labelledby', 'not-found-title')

  section.innerHTML = `
    <div class="container flow" style="max-width: 44rem; padding-block: 4rem; text-align: center;">
      <p class="eyebrow">Not found</p>
      <h2 id="not-found-title">This page is taking a quiet pause.</h2>
      <p class="lead">We couldn’t find that route. You can return to the Lingr landing page.</p>
      <p><a class="button" href="/">Back to home</a></p>
    </div>
  `

  return section
}
