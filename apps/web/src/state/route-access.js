import { ROUTE_ACCESS, ROUTE_META } from '../routes.js'
import { SESSION_STATES } from './session.js'

const SESSION_ACCESS_MAP = {
  [SESSION_STATES.ANONYMOUS]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING],
  [SESSION_STATES.ONBOARDING]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING, ROUTE_ACCESS.APP],
  [SESSION_STATES.SIGNED_IN]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP],
  [SESSION_STATES.INCOMPLETE_PROFILE]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP]
}

export const getRouteMeta = (path) => ROUTE_META[path] || ROUTE_META['/']

export const getAllowedAccessForSession = (sessionState) => SESSION_ACCESS_MAP[sessionState] || SESSION_ACCESS_MAP[SESSION_STATES.ANONYMOUS]

export const canSessionAccessRoute = ({ path, sessionState }) => {
  const routeMeta = getRouteMeta(path)
  return getAllowedAccessForSession(sessionState).includes(routeMeta.access)
}

export const getFutureGuardStateExpectations = (path) => {
  const routeMeta = getRouteMeta(path)

  if (routeMeta.access === ROUTE_ACCESS.PUBLIC) {
    return Object.values(SESSION_STATES)
  }

  if (routeMeta.access === ROUTE_ACCESS.ONBOARDING) {
    return [SESSION_STATES.ANONYMOUS, SESSION_STATES.ONBOARDING]
  }

  if (routeMeta.access === ROUTE_ACCESS.APP || routeMeta.access === ROUTE_ACCESS.PROTECTED_FUTURE) {
    return [SESSION_STATES.ONBOARDING, SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE]
  }

  return [SESSION_STATES.ANONYMOUS]
}

export const getRouteAccessSummary = ({ path, sessionState }) => {
  const routeMeta = getRouteMeta(path)
  const expectedStates = getFutureGuardStateExpectations(path)

  return {
    path,
    sessionState,
    intent: routeMeta.intent,
    access: routeMeta.access,
    expectedStates,
    canAccessNow: canSessionAccessRoute({ path, sessionState }),
    shouldGateInFuture: !expectedStates.includes(sessionState)
  }
}

export const getVisibleNavItems = ({ navItems, sessionState }) =>
  navItems.filter((item) => canSessionAccessRoute({ path: item.href, sessionState }))
