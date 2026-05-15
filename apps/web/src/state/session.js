import { createStore } from './create-store.js'

export const SESSION_STATES = {
  ANONYMOUS: 'anonymous',
  ONBOARDING: 'onboarding',
  SIGNED_IN: 'signed-in',
  INCOMPLETE_PROFILE: 'incomplete-profile'
}

const SESSION_ROUTE_EXPERIENCE = {
  '/': [SESSION_STATES.ANONYMOUS, SESSION_STATES.ONBOARDING, SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE],
  '/onboarding': [SESSION_STATES.ONBOARDING],
  '/discovery': [SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE],
  '/conversations': [SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE],
  '/profile': [SESSION_STATES.SIGNED_IN, SESSION_STATES.INCOMPLETE_PROFILE]
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

export const getRouteSessionExperience = (path) => SESSION_ROUTE_EXPERIENCE[path] || SESSION_ROUTE_EXPERIENCE['/']

export const getRouteSessionGuardHint = (path, state = sessionState.getState().state) => ({
  path,
  state,
  expectedStates: getRouteSessionExperience(path),
  shouldGateInFuture: !getRouteSessionExperience(path).includes(state)
})

