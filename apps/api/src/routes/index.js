import { healthRoute } from './health.js'
import { withRouteProtection } from '../auth/route-hooks.js'
import { getViewerProfileRoute, updateViewerProfileBasicsRoute, getViewerProfileCompletenessRoute } from './profile.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/status', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/viewer', requiresJson: false, handler: withRouteProtection(getViewerProfileRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/profile/viewer', requiresJson: true, handler: withRouteProtection(updateViewerProfileBasicsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/completeness', requiresJson: false, handler: withRouteProtection(getViewerProfileCompletenessRoute, { requiresAuth: false, allowOnboarding: true }) }
])
