import { createNavigation } from './components/navigation.js'
import { createHeroSection } from './components/hero.js'
import { createPhilosophySection } from './components/philosophy.js'
import { createHowItWorksSection } from './components/how-it-works.js'
import { createGlimpsSection } from './components/glimps.js'
import { createDiscoverySection } from './components/discovery.js'
import { createSafetySection } from './components/safety.js'
import { createCtaSection } from './components/cta.js'
import { createOnboardingSection } from './components/onboarding/index.js'
import { createFooter } from './components/footer.js'
import { createConversationsSection } from './components/conversations/index.js'
import { createProfileExperienceSection } from './components/profile-experience.js'

const main = document.querySelector('#main-content')
const headerContent = document.querySelector('#header-content')
const footerHost = document.querySelector('#footer-content')

const createRouteIntro = ({ eyebrow, title, lead }) => {
  const section = document.createElement('section')
  section.className = 'section section--paper route-intro'
  section.innerHTML = `
    <div class="container flow">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p class="lead">${lead}</p>
    </div>
  `
  return section
}

const routes = {
  '/': () => [
    createHeroSection(),
    createPhilosophySection(),
    createHowItWorksSection(),
    createSafetySection(),
    createCtaSection()
  ],
  '/onboarding': () => [
    createRouteIntro({ eyebrow: 'Onboarding', title: 'Begin with intention.', lead: 'A calm setup flow that helps you enter Lingr at your own pace.' }),
    createOnboardingSection()
  ],
  '/discovery': () => [
    createRouteIntro({ eyebrow: 'Discovery', title: 'Daily thoughtful introductions.', lead: 'A focused set of connections designed for quality over volume.' }),
    createDiscoverySection()
  ],
  '/conversations': () => [
    createRouteIntro({ eyebrow: 'Conversations', title: 'Talk with less pressure.', lead: 'Space to respond gently, pause, and build emotional clarity over time.' }),
    createConversationsSection()
  ],
  '/profile': () => [
    createRouteIntro({ eyebrow: 'Profile', title: 'See a person in layers.', lead: 'Profiles that unfold gradually to support understanding before judgment.' }),
    createProfileExperienceSection()
  ]
}

const resolvePath = (path) => (routes[path] ? path : '/')

const renderRoute = (path) => {
  const routePath = resolvePath(path)
  main.innerHTML = ''
  main.append(...routes[routePath]())
  headerContent.innerHTML = ''
  headerContent.append(createNavigation({ currentPath: routePath }))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]')
  if (!link) return

  const url = new URL(link.href, window.location.origin)
  if (url.origin !== window.location.origin) return

  if (url.pathname !== window.location.pathname) {
    event.preventDefault()
    window.history.pushState({}, '', `${url.pathname}${url.hash}`)
    renderRoute(url.pathname)
    return
  }

  if (url.pathname === '/' && url.hash && window.location.pathname !== '/') {
    event.preventDefault()
    window.history.pushState({}, '', `/${url.hash}`)
    renderRoute('/')
    requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' }))
  }
})

window.addEventListener('popstate', () => renderRoute(window.location.pathname))

renderRoute(window.location.pathname)
footerHost?.append(createFooter())
