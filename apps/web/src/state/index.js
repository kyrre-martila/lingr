import { createStore } from './create-store.js'
import { createOnboardingInitialState } from '../data/mocks/onboarding.js'
import { createGlimpsInitialState } from '../data/mocks/glimps.js'
import { createDiscoveryMockData } from '../data/mocks/discovery.js'
import { createConversationsMockData } from '../data/mocks/conversations.js'

const discoveryData = createDiscoveryMockData()
const conversations = createConversationsMockData()

export const onboardingState = createStore(createOnboardingInitialState())
export const glimpsState = createStore(createGlimpsInitialState())
export const discoveryState = createStore({ remainingIntroductions: discoveryData.session.remainingIntroductions, totalIntroductions: discoveryData.session.totalIntroductions, hasReachedLimit: true })
export const conversationState = createStore({ activeConversationId: conversations[0]?.id || '' })
export const uiPreferencesState = createStore({ compactOnboardingHeader: false, discoveryRecommendationsExpanded: true })
