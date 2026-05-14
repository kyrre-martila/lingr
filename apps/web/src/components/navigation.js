const navItems = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Glimps', href: '#glimps' },
  { label: 'Safety', href: '#safety' },
  { label: 'Profiles', href: '#profile-experience' },
  { label: 'Join Lingr', href: '#cta' }
]

const createNavLinks = () =>
  navItems
    .map(item => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join('')

export const createNavigation = () => {
  const wrapper = document.createElement('div')
  wrapper.className = 'site-nav'

  wrapper.innerHTML = `
    <a class="brand" href="#main-content" aria-label="Lingr home">Lingr</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
      <span class="sr-only">Open navigation menu</span>
      <span aria-hidden="true">Menu</span>
    </button>
    <nav class="nav-desktop" aria-label="Primary">
      <ul>${createNavLinks()}</ul>
    </nav>
    <nav id="mobile-menu" class="nav-mobile" aria-label="Mobile" hidden>
      <ul>${createNavLinks()}</ul>
    </nav>
  `

  const toggle = wrapper.querySelector('.nav-toggle')
  const mobileMenu = wrapper.querySelector('#mobile-menu')

  toggle?.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!isExpanded))
    mobileMenu.hidden = isExpanded
  })

  return wrapper
}
