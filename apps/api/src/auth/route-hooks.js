import { ApiError } from '../http/errors.js'
import { resolveRouteProtection, toRouteGuardError } from './route-guard.js'

export const withRouteProtection = (handler, options) => async (req, res) => {
  const decision = resolveRouteProtection({ viewer: req.viewer, ...options })
  if (decision.outcome !== 'allow') {
    throw new ApiError(toRouteGuardError(decision))
  }
  return handler(req, res)
}
