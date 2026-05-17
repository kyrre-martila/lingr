import { ROUTE_ACCESS, ROUTE_META } from '../routes.js'
import { REASON_CODES } from '../domain/contracts.js'
import { SESSION_STATES } from './session.js'

export const GUARD_MODES = {
  PROTOTYPE_OPEN: 'prototype_open',
  ENFORCED: 'enforced'
}

const DEFAULT_GUARD_MODE = GUARD_MODES.PROTOTYPE_OPEN

const SESSION_ACCESS_MAP = {
  [SESSION_STATES.ANONYMOUS]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING],
  [SESSION_STATES.ONBOARDING]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.ONBOARDING],
  [SESSION_STATES.SIGNED_IN]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP],
  [SESSION_STATES.INCOMPLETE_PROFILE]: [ROUTE_ACCESS.PUBLIC, ROUTE_ACCESS.APP]
}

const BLOCK_REASONS = {
  REQUIRES_ONBOARDING: 'requires_onboarding',
  REQUIRES_PROFILE_COMPLETION: 'requires_profile_completion',
  REQUIRES_APP_SESSION: 'requires_app_session'
}

const BLOCK_REASON_TO_CODE = {
  [BLOCK_REASONS.REQUIRES_ONBOARDING]: REASON_CODES.ROUTE.REQUIRES_ONBOARDING,
  [BLOCK_REASONS.REQUIRES_PROFILE_COMPLETION]: REASON_CODES.ROUTE.REQUIRES_PROFILE_COMPLETION,
  [BLOCK_REASONS.REQUIRES_APP_SESSION]: REASON_CODES.AUTH.REQUIRES_AUTH,
  unknown_route: REASON_CODES.ROUTE.UNKNOWN_ROUTE
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

  if (routeMeta.access === ROUTE_ACCESS.APP && sessionState === SESSION_STATES.ONBOARDING) {
    return BLOCK_REASONS.REQUIRES_ONBOARDING
  }

  if (routeMeta.path !== '/profile' && sessionState === SESSION_STATES.INCOMPLETE_PROFILE) {
    return BLOCK_REASONS.REQUIRES_PROFILE_COMPLETION
  }

  return null
}

const getSuggestedRedirectTarget = ({ blockedReason }) => {
  if (blockedReason === BLOCK_REASONS.REQUIRES_APP_SESSION) return '/onboarding'
  if (blockedReason === BLOCK_REASONS.REQUIRES_PROFILE_COMPLETION) return '/profile'
  if (blockedReason === BLOCK_REASONS.REQUIRES_ONBOARDING) return '/onboarding'
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
  const profileBlockedReason = getBlockedReason({ routeMeta, sessionState })
  const blockedReason = allowedBySession ? (profileBlockedReason === BLOCK_REASONS.REQUIRES_PROFILE_COMPLETION ? profileBlockedReason : null) : profileBlockedReason
  const shouldEnforce = mode === GUARD_MODES.ENFORCED

  return {
    path,
    mode,
    isKnownRoute: true,
    allowed: shouldEnforce ? (allowedBySession && !blockedReason) : true,
    blocked: shouldEnforce ? !(allowedBySession && !blockedReason) : false,
    blockedReason,
    blockedReasonCode: blockedReason ? BLOCK_REASON_TO_CODE[blockedReason] : null,
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
