const defaultNavItems = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Discovery', href: '/discovery' },
  { label: 'Conversations', href: '/conversations' },
  { label: 'Profile', href: '/profile' },
  { label: 'Join Lingr', href: '#cta' }
]

const createNavLinks = ({ items, isRouteActive }) =>
  items
    .map((item) => {
      const isActive = isRouteActive?.(item.href)
      const activeAttributes = isActive ? ' aria-current="page" class="is-active"' : ''
      return `<li><a href="${item.href}"${activeAttributes}>${item.label}</a></li>`
    })
    .join('')

export const createNavigation = ({
  items = defaultNavItems,
  brandHref = '#main-content',
  brandLabel = 'Lingr home',
  isRouteActive,
  onNavigate
} = {}) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'site-nav'

  wrapper.innerHTML = `
    <a class="brand" href="${brandHref}" aria-label="${brandLabel}">Lingr</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
      <span class="sr-only">Open navigation menu</span>
      <span aria-hidden="true">Menu</span>
    </button>
    <nav class="nav-desktop" aria-label="Primary">
      <ul>${createNavLinks({ items, isRouteActive })}</ul>
    </nav>
    <nav id="mobile-menu" class="nav-mobile" aria-label="Mobile" hidden>
      <ul>${createNavLinks({ items, isRouteActive })}</ul>
    </nav>
  `

  const toggle = wrapper.querySelector('.nav-toggle')
  const mobileMenu = wrapper.querySelector('#mobile-menu')
  const mobileLinks = wrapper.querySelectorAll('.nav-mobile a')
  const allLinks = wrapper.querySelectorAll('a')

  const closeMenu = ({ returnFocus = true } = {}) => {
    toggle?.setAttribute('aria-expanded', 'false')
    mobileMenu.hidden = true
    if (returnFocus) toggle?.focus()
  }

  toggle?.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!isExpanded))
    mobileMenu.hidden = isExpanded
    if (!isExpanded) mobileLinks[0]?.focus()
  })

  mobileLinks.forEach((link) =>
    link.addEventListener('click', () => {
      closeMenu({ returnFocus: false })
    })
  )
  wrapper.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      event.preventDefault()
      closeMenu()
    }
  })

  if (onNavigate) {
    allLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href')
        if (!href?.startsWith('/')) return
        event.preventDefault()
        onNavigate(href)
      })
    })
  }

  return wrapper
}
