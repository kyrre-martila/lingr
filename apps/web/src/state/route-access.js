import { ROUTE_ACCESS, ROUTE_META } from '../routes.js'
import { SESSION_STATES } from './session.js'

export const GUARD_MODES = {
  PROTOTYPE_OPEN: 'prototype_open',
  ENFORCED: 'enforced'
}

const DEFAULT_GUARD_MODE = GUARD_MODES.PROTOTYPE_OPEN

const SESSION_ACCESS_MAP = {
  [SESSION_STATES.ANONYMOUS]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING],
  [SESSION_STATES.ONBOARDING]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING, ROUTE_ACCESS.APP],
  [SESSION_STATES.SIGNED_IN]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP],
  [SESSION_STATES.INCOMPLETE_PROFILE]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP]
}

const BLOCK_REASONS = {
  REQUIRES_ONBOARDING: 'requires_onboarding',
  REQUIRES_APP_SESSION: 'requires_app_session'
}

export const getRouteMeta = (path) => ROUTE_META[path] || null
export const getAllowedAccessForSession = (sessionState) => SESSION_ACCESS_MAP[sessionState] || SESSION_ACCESS_MAP[SESSION_STATES.ANONYMOUS]

const getBlockedReason = ({ routeMeta, sessionState }) => {
  if (routeMeta.access === ROUTE_ACCESS.ONBOARDING && sessionState !== SESSION_STATES.ANONYMOUS && sessionState !== SESSION_STATES.ONBOARDING) {
    return BLOCK_REASONS.REQUIRES_ONBOARDING
  }

  if (routeMeta.access === ROUTE_ACCESS.APP && sessionState === SESSION_STATES.ANONYMOUS) {
    return BLOCK_REASONS.REQUIRES_APP_SESSION
  }

  return null
}

const getSuggestedRedirectTarget = ({ blockedReason }) => {
  if (blockedReason === BLOCK_REASONS.REQUIRES_APP_SESSION) return '/onboarding'
  if (blockedReason === BLOCK_REASONS.REQUIRES_ONBOARDING) return '/discovery'
  return null
}

export const evaluateRouteGuard = ({ path, sessionState, mode = DEFAULT_GUARD_MODE }) => {
  const routeMeta = getRouteMeta(path)

  if (!routeMeta) {
    return {
      path,
      mode,
      isKnownRoute: false,
      allowed: false,
      blocked: true,
      blockedReason: 'unknown_route',
      suggestedRedirectTarget: '/'
    }
  }

  const allowedBySession = getAllowedAccessForSession(sessionState).includes(routeMeta.access)
  const blockedReason = allowedBySession ? null : getBlockedReason({ routeMeta, sessionState })
  const shouldEnforce = mode === GUARD_MODES.ENFORCED

  return {
    path,
    mode,
    isKnownRoute: true,
    allowed: shouldEnforce ? allowedBySession : true,
    blocked: shouldEnforce ? !allowedBySession : false,
    blockedReason,
    suggestedRedirectTarget: blockedReason ? getSuggestedRedirectTarget({ blockedReason }) : null,
    intent: routeMeta.intent,
    access: routeMeta.access
  }
}

export const canSessionAccessRoute = ({ path, sessionState, mode }) => evaluateRouteGuard({ path, sessionState, mode }).allowed

export const getFutureGuardStateExpectations = (path) => {
  const routeMeta = getRouteMeta(path) || ROUTE_META['/']

  if (routeMeta.access === ROUTE_ACCESS.PUBLIC) return Object.values(SESSION_STATES)
  if (routeMeta.access === ROUTE_ACCESS.ONBOARDING) return [SESSION_STATES.ANONYMOUS, SESSION_STATES.ONBOARDING]
  if (routeMeta.access === ROUTE_ACCESS.APP || routeMeta.access === ROUTE_ACCESS.PROTECTED_FUTURE) return [SESSION_STATES.ONBOARDING, SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE]

  return [SESSION_STATES.ANONYMOUS]
}

export const getRouteAccessSummary = ({ path, sessionState, mode }) => {
  const guard = evaluateRouteGuard({ path, sessionState, mode })
  const expectedStates = getFutureGuardStateExpectations(path)

  return {
    ...guard,
    sessionState,
    expectedStates,
    canAccessNow: guard.allowed,
    shouldGateInFuture: !expectedStates.includes(sessionState)
  }
}

export const getVisibleNavItems = ({ navItems, sessionState, mode }) => navItems.filter((item) => canSessionAccessRoute({ path: item.href, sessionState, mode }))
