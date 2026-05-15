import { createStore } from './create-store.js'

export const uiPreferencesState = createStore({
  compactOnboardingHeader: false,
  discoveryRecommendationsExpanded: true
})
