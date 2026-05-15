import { createStore } from './create-store.js'
import { createDiscoveryMockData } from '../data/mocks/discovery.js'
import { createDailyDiscoveryLimit } from '../domain/discovery/index.js'

const discoveryData = createDiscoveryMockData()
const limits = createDailyDiscoveryLimit({
  used: discoveryData.session.totalIntroductions - discoveryData.session.remainingIntroductions,
  max: discoveryData.session.totalIntroductions
})

export const discoveryState = createStore({
  remainingIntroductions: limits.remaining,
  totalIntroductions: limits.max,
  hasReachedLimit: limits.exhausted,
  dailyLimit: limits
})
