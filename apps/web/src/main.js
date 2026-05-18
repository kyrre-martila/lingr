import { createNavigation } from './components/navigation.js'
import { createHeroSection } from './components/hero.js'
import { createPhilosophySection } from './components/philosophy.js'
import { createHowItWorksSection } from './components/how-it-works.js'
import { createGlimpsSection } from './components/glimps.js'
import { createSafetySection } from './components/safety.js'
import { createCtaSection } from './components/cta.js'
import { createFooter } from './components/footer.js'
import { createAppShell } from './components/app-shell.js'
import { ROUTE_PAGE_BUILDERS } from './app/page-builders.js'
import { setMockSessionState } from './state/session.js'
import { createNotFoundView } from './components/not-found.js'
import { applyTranslations, getLocale, setLocale } from './i18n/index.js'

const root = document.body

const applyMockSessionFromQuery = () => {
  const sessionParam = new URLSearchParams(window.location.search).get('mockSession')
  if (!sessionParam) return
  setMockSessionState(sessionParam)
}

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

const routeMap = ROUTE_PAGE_BUILDERS

const renderApp = () => {
  applyMockSessionFromQuery()
  const path = window.location.pathname
  const pageBuilder = routeMap[path]

  root.innerHTML = ''
  if (path === '/') {
    renderLandingPage()
    applyTranslations(document)
    return
  }

  if (!pageBuilder) {
    root.append(createNotFoundView())
    applyTranslations(document)
    return
  }

  root.append(
    createAppShell({
      activePath: path,
      pageBuilder
    })
  )
  applyTranslations(document)
}

window.addEventListener('popstate', renderApp)
renderApp()

const locale = getLocale()
setLocale(locale)
applyTranslations(document)
