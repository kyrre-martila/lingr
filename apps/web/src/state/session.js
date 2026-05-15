import { createStore } from './create-store.js'
import { GUARD_MODES, getRouteAccessSummary } from './route-access.js'

export const SESSION_STATES = {
  ANONYMOUS: 'anonymous',
  ONBOARDING: 'onboarding',
  SIGNED_IN: 'signed-in',
  INCOMPLETE_PROFILE: 'incomplete-profile'
}

const createMockSession = (sessionState = SESSION_STATES.ANONYMOUS) => ({
  state: sessionState,
  user: sessionState === SESSION_STATES.ANONYMOUS ? null : { id: 'mock-user-1', displayName: 'Ari', profileComplete: sessionState === SESSION_STATES.SIGNED_IN },
  flags: { isMock: true }
})

export const sessionState = createStore(createMockSession())

export const setMockSessionState = (nextState) => {
  if (!Object.values(SESSION_STATES).includes(nextState)) return
  sessionState.patch(createMockSession(nextState))
}

export const getRouteSessionGuardHint = (path, state = sessionState.getState().state, mode = GUARD_MODES.PROTOTYPE_OPEN) => {
  const summary = getRouteAccessSummary({ path, sessionState: state, mode })

  return {
    path,
    state,
    expectedStates: summary.expectedStates,
    shouldGateInFuture: summary.shouldGateInFuture,
    access: summary.access,
    intent: summary.intent,
    blocked: summary.blocked,
    blockedReason: summary.blockedReason,
    suggestedRedirectTarget: summary.suggestedRedirectTarget
  }
}
