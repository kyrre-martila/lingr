import { createOnboardingSection } from '../src/components/onboarding/index.js'
import { createDiscoverySection } from '../src/components/discovery.js'
import { createConversationsSection } from '../src/components/conversations/index.js'
import { createGlimpsCreationFlow } from '../src/components/glimps/create-flow.js'
import { createHeroSection } from '../src/components/hero.js'
import { createNavigation } from '../src/components/navigation.js'
import { createPhilosophySection } from '../src/components/philosophy.js'
import { createHowItWorksSection } from '../src/components/how-it-works.js'
import { createGlimpsSection } from '../src/components/glimps.js'
import { createSafetySection } from '../src/components/safety.js'
import { createCtaSection } from '../src/components/cta.js'
import { createFooter } from '../src/components/footer.js'

export const buildLanding = () => {
  const root = document.createElement('div')
  root.innerHTML = `<a class="skip-link" href="#main-content">Skip to content</a><header class="site-header"><div class="container" id="header-content"></div></header><main id="main-content"></main><div id="footer-content"></div>`
  root.querySelector('#header-content')?.append(createNavigation())
  root.querySelector('#main-content')?.append(createHeroSection(), createPhilosophySection(), createHowItWorksSection(), createGlimpsSection(), createSafetySection(), createCtaSection())
  root.querySelector('#footer-content')?.append(createFooter())
  return root
}

export { createOnboardingSection, createDiscoverySection, createConversationsSection, createGlimpsCreationFlow }
