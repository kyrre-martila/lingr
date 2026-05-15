import { ACCOUNT_LIFECYCLE_STATE, AUTH_SESSION_STATE } from '../../../../packages/shared/src/contracts.js'

export const createAnonymousViewer = ({ requestId } = {}) => ({
  authState: AUTH_SESSION_STATE.ANONYMOUS,
  lifecycleState: ACCOUNT_LIFECYCLE_STATE.ONBOARDING,
  identity: null,
  session: null,
  permissions: [],
  requestId: requestId || null
})

export const createAuthenticatedViewer = ({ userId, sessionId, requestId, lifecycleState = ACCOUNT_LIFECYCLE_STATE.ACTIVE, permissions = [] }) => ({
  authState: AUTH_SESSION_STATE.AUTHENTICATED,
  lifecycleState,
  identity: { userId },
  session: { sessionId },
  permissions,
  requestId: requestId || null
})
