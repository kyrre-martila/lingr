export const createCtaSection = () => {
  const section = document.createElement('section')
  section.className = 'section section--accent'
  section.id = 'cta'
  section.setAttribute('aria-labelledby', 'cta-title')

  section.innerHTML = `
    <div class="container cta">
      <div>
        <p class="eyebrow eyebrow--light">Start slowly</p>
        <h2 id="cta-title">Join Lingr and meet with more presence.</h2>
        <p>
          We are shaping a dating experience that values emotional pacing, real conversation, and shared attention.
        </p>
      </div>
      <form class="cta__form" aria-label="Join waitlist form">
        <label for="email" class="sr-only">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" required />
        <button type="submit">Request invite</button>
      </form>
    </div>
  `

  return section
}
