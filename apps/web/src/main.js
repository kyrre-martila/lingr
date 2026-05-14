import { createHeroSection } from './components/hero.js'
import { createPhilosophySection } from './components/philosophy.js'
import { createHowItWorksSection } from './components/how-it-works.js'
import { createCtaSection } from './components/cta.js'

const main = document.querySelector('#main-content')

main.append(
  createHeroSection(),
  createPhilosophySection(),
  createHowItWorksSection(),
  createCtaSection()
)
