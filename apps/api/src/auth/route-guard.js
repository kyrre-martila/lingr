import { ACCOUNT_LIFECYCLE_STATE, AUTH_SESSION_STATE, DOMAIN_ERROR_KIND, REASON_CODES, ROUTE_OUTCOME } from '../../../../packages/shared/src/contracts.js'

export const resolveRouteProtection = ({ viewer, requiresAuth = false, allowOnboarding = true }) => {
  if (requiresAuth && viewer.authState !== AUTH_SESSION_STATE.AUTHENTICATED) {
    return { outcome: ROUTE_OUTCOME.HARD_BLOCK, reasonCode: viewer.authState === AUTH_SESSION_STATE.EXPIRED ? REASON_CODES.AUTH.SESSION_EXPIRED : REASON_CODES.AUTH.REQUIRES_AUTH }
  }

  if (!allowOnboarding && viewer.lifecycleState === ACCOUNT_LIFECYCLE_STATE.ONBOARDING) {
    return { outcome: ROUTE_OUTCOME.SOFT_BLOCK, reasonCode: REASON_CODES.ROUTE.REQUIRES_ONBOARDING }
  }

  return { outcome: ROUTE_OUTCOME.ALLOW, reasonCode: null }
}

export const toRouteGuardError = ({ reasonCode }) => ({
  kind: reasonCode.startsWith('auth.') ? DOMAIN_ERROR_KIND.AUTH : DOMAIN_ERROR_KIND.ROUTE,
  reasonCode,
  message: 'Route access denied',
  statusCode: 403
})
