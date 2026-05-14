export const createHeroSection = () => {
  const section = document.createElement('section')
  section.className = 'hero section'
  section.setAttribute('aria-labelledby', 'hero-title')

  section.innerHTML = `
    <div class="container hero__grid">
      <div>
        <p class="eyebrow">Slow dating for people who still feel deeply</p>
        <h1 id="hero-title">Some people are worth taking time with.</h1>
        <p class="lead">
          Lingr helps you move from first curiosity to real emotional clarity — gently, gradually, and with intention.
        </p>
        <div class="hero__actions">
          <a class="button" href="#cta">Join the early list</a>
          <a class="button button--ghost" href="#how-it-works">See how it works</a>
        </div>
      </div>
      <aside class="hero-card" aria-label="Daily Glimps preview">
        <p class="hero-card__label">Today's Glimps</p>
        <p class="hero-card__text">"Rain on glass, mint tea, and finally breathing again."</p>
        <p class="hero-card__meta">Shared 2h ago · Layer 1</p>
      </aside>
    </div>
  `

  return section
}
