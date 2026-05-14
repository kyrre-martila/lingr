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

headerContent?.append(createNavigation())

main.append(
  createHeroSection(),
  createPhilosophySection(),
  createHowItWorksSection(),
  createDiscoverySection(),
  createGlimpsSection(),
  createSafetySection(),
  createConversationsSection(),
  createProfileExperienceSection(),
  createOnboardingSection(),
  createCtaSection()
)

footerHost?.append(createFooter())
