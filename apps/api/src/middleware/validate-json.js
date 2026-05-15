import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND } from '../../../../packages/shared/src/contracts.js'

export const assertJsonRequest = (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return

  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('application/json')) {
    throw new ApiError({
      message: 'Content-Type must be application/json',
      kind: DOMAIN_ERROR_KIND.VALIDATION,
      reasonCode: 'validation.content_type_required',
      statusCode: 415
    })
  }
}
