import { healthRoute } from './health.js'
import { withRouteProtection } from '../auth/route-hooks.js'
import { getViewerProfileRoute, updateViewerProfileBasicsRoute, getViewerProfileCompletenessRoute } from './profile.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/status', handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/viewer', handler: withRouteProtection(getViewerProfileRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/profile/viewer', handler: withRouteProtection(updateViewerProfileBasicsRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/completeness', handler: withRouteProtection(getViewerProfileCompletenessRoute, { requiresAuth: false, allowOnboarding: true }) }
])
