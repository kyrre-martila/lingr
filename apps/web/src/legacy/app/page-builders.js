import { createOnboardingSection } from '../../components/onboarding/index.js'
import { createDiscoverySection } from '../../components/discovery.js'
import { createConversationsSection } from '../../components/conversations/index.js'
import { createProfileExperienceSection } from '../../components/profile-experience.js'
import { createRoutePage } from './route-page.js'

const buildOnboardingPage = () => {
  const page = createRoutePage('/onboarding', () => createOnboardingSection({ compactHeader: true }))
  page.classList.add('app-page-section--onboarding')
  return page
}

const buildDiscoveryPage = () => createRoutePage('/discovery', createDiscoverySection)
const buildConversationsPage = () => createRoutePage('/conversations', createConversationsSection)
const buildProfilePage = () => createRoutePage('/profile', createProfileExperienceSection)

export const ROUTE_PAGE_BUILDERS = {
  '/onboarding': buildOnboardingPage,
  '/discovery': buildDiscoveryPage,
  '/conversations': buildConversationsPage,
  '/profile': buildProfilePage
}
