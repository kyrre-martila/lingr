import { healthRoute } from './health.js'
import { withRouteProtection } from '../auth/route-hooks.js'
import { getViewerProfileRoute, updateViewerProfileBasicsRoute, getViewerProfileCompletenessRoute } from './profile.js'
import { archiveViewerGlimpsRoute, createGlimpsRoute, getViewerGlimpsByIdRoute, listViewerGlimpsRoute } from './glimps.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/status', requiresJson: false, handler: withRouteProtection(healthRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/viewer', requiresJson: false, handler: withRouteProtection(getViewerProfileRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/profile/viewer', requiresJson: true, handler: withRouteProtection(updateViewerProfileBasicsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/profile/completeness', requiresJson: false, handler: withRouteProtection(getViewerProfileCompletenessRoute, { requiresAuth: false, allowOnboarding: true }) },
  { method: 'POST', path: '/v1/glimps', requiresJson: true, handler: withRouteProtection(createGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/glimps/viewer', requiresJson: false, handler: withRouteProtection(listViewerGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'GET', path: '/v1/glimps/:glimpsId', requiresJson: false, handler: withRouteProtection(getViewerGlimpsByIdRoute, { requiresAuth: true, allowOnboarding: true }) },
  { method: 'PATCH', path: '/v1/glimps/:glimpsId/archive', requiresJson: false, handler: withRouteProtection(archiveViewerGlimpsRoute, { requiresAuth: true, allowOnboarding: true }) }
])
