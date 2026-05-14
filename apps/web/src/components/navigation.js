const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Discovery', href: '/discovery' },
  { label: 'Conversations', href: '/conversations' },
  { label: 'Profile', href: '/profile' }
]

const createNavLinks = (currentPath = '/') =>
  navItems
    .map(item => `<li><a href="${item.href}" ${item.href === currentPath ? 'aria-current="page"' : ''}>${item.label}</a></li>`)
    .join('')

export const createNavigation = ({ currentPath = "/" } = {}) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'site-nav'

  wrapper.innerHTML = `
    <a class="brand" href="/" aria-label="Lingr home">Lingr</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
      <span class="sr-only">Open navigation menu</span>
      <span aria-hidden="true">Menu</span>
    </button>
    <nav class="nav-desktop" aria-label="Primary">
      <ul>${createNavLinks(currentPath)}</ul>
    </nav>
    <nav id="mobile-menu" class="nav-mobile" aria-label="Mobile" hidden>
      <ul>${createNavLinks(currentPath)}</ul>
    </nav>
  `

  const toggle = wrapper.querySelector('.nav-toggle')
  const mobileMenu = wrapper.querySelector('#mobile-menu')
  const mobileLinks = wrapper.querySelectorAll('.nav-mobile a')

  const closeMenu = () => {
    toggle?.setAttribute('aria-expanded', 'false')
    mobileMenu.hidden = true
    toggle?.focus()
  }

  toggle?.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!isExpanded))
    mobileMenu.hidden = isExpanded
    if (!isExpanded) mobileLinks[0]?.focus()
  })

  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu))
  wrapper.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      event.preventDefault()
      closeMenu()
    }
  })

  return wrapper
}
