export const createFooter = () => {
  const footer = document.createElement('footer')
  footer.className = 'site-footer'

  footer.innerHTML = `
    <div class="container site-footer__inner">
      <p class="brand" aria-label="Lingr">Lingr</p>
      <p class="site-footer__copy">A calmer way to meet. Thoughtful by design.</p>
      <a href="/" class="site-footer__top">Back to top</a>
    </div>
  `

  return footer
}
