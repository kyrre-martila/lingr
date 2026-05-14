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

const buildDiscoveryPage = () => {
  const page = createPageSection({ eyebrow: 'Daily pacing', title: 'Discovery', description: 'Three thoughtful introductions, shared with care.' })
  page.append(createDiscoverySection())
  return page
}

const buildConversationsPage = () => {
  const page = createPageSection({ eyebrow: 'Intentional exchange', title: 'Conversations', description: 'Gentle prompts and space to respond with presence.' })
  page.append(createConversationsSection())
  return page
}

const buildProfilePage = () => {
  const page = createPageSection({ eyebrow: 'Depth over polish', title: 'Profile', description: 'A living portrait shaped by reflection and rhythm.' })
  page.append(createProfileExperienceSection())
  return page
}

const routeMap = {
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
