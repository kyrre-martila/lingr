import { createStore } from './create-store.js'
import { createDiscoveryMockData } from '../data/mocks/discovery.js'

const discoveryData = createDiscoveryMockData()

export const discoveryState = createStore({
  remainingIntroductions: discoveryData.session.remainingIntroductions,
  totalIntroductions: discoveryData.session.totalIntroductions,
  hasReachedLimit: true
})
