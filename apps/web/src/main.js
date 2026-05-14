import { createNavigation } from './components/navigation.js'
import { createHeroSection } from './components/hero.js'
import { createPhilosophySection } from './components/philosophy.js'
import { createHowItWorksSection } from './components/how-it-works.js'
import { createGlimpsSection } from './components/glimps.js'
import { createDiscoverySection } from './components/discovery.js'
import { createSafetySection } from './components/safety.js'
import { createCtaSection } from './components/cta.js'
import { createFooter } from './components/footer.js'
import { createConversationsSection } from './components/conversations/index.js'
import { createProfileExperienceSection } from './components/profile-experience.js'
import { createAppShell } from './components/app-shell.js'
import { createPageSection } from './components/layout.js'
import { createOnboardingSection } from './components/onboarding/index.js'
import { APP_ROUTE_META } from './routes.js'

const root = document.body

const renderLandingPage = () => {
  root.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="container" id="header-content"></div>
    </header>
    <main id="main-content"></main>
    <div id="footer-content"></div>
  `

  document.querySelector('#header-content')?.append(createNavigation())
  document.querySelector('#main-content')?.append(
    createHeroSection(),
    createPhilosophySection(),
    createHowItWorksSection(),
    createGlimpsSection(),
    createSafetySection(),
    createCtaSection()
  )
  document.querySelector('#footer-content')?.append(createFooter())
}

const createRoutePage = (path, contentBuilder) => {
  const meta = APP_ROUTE_META[path]
  const page = createPageSection({ eyebrow: meta.eyebrow, title: meta.title, description: meta.description })
  page.append(contentBuilder())
  return page
}

const buildOnboardingPage = () => {
  const page = createRoutePage('/onboarding', () => createOnboardingSection({ compactHeader: true }))
  page.classList.add('app-page-section--onboarding')
  return page
}

const buildDiscoveryPage = () => createRoutePage('/discovery', createDiscoverySection)

const buildConversationsPage = () => {
  return createRoutePage('/conversations', createConversationsSection)
}

const buildProfilePage = () => {
  return createRoutePage('/profile', createProfileExperienceSection)
}

const routeMap = {
  '/onboarding': buildOnboardingPage,
  '/discovery': buildDiscoveryPage,
  '/conversations': buildConversationsPage,
  '/profile': buildProfilePage
}

const renderApp = () => {
  const path = window.location.pathname
  const pageBuilder = routeMap[path]

  root.innerHTML = ''
  if (!pageBuilder) {
    renderLandingPage()
    return
  }

  root.append(
    createAppShell({
      activePath: path,
      pageBuilder
    })
  )
}

window.addEventListener('popstate', renderApp)
renderApp()
