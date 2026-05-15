import { DOMAIN_ERROR_KIND, REASON_CODES } from '../../../../packages/shared/src/contracts.js'
import { ApiError } from '../http/errors.js'

export const hasPermission = (viewer, permissionKey) => {
  if (!viewer || !Array.isArray(viewer.permissions)) return false
  return viewer.permissions.includes(permissionKey)
}

export const assertPermission = (viewer, permissionKey) => {
  if (hasPermission(viewer, permissionKey)) return
  throw new ApiError({
    message: 'Permission denied',
    kind: DOMAIN_ERROR_KIND.PERMISSION,
    reasonCode: REASON_CODES.PERMISSION.NOT_ALLOWED,
    statusCode: 403,
    details: { permission: permissionKey }
  })
}
