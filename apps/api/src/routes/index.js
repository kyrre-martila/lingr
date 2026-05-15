import { healthRoute } from './health.js'
import { withRouteProtection } from '../auth/route-hooks.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/status', handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) }
])
