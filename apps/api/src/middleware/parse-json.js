import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../../../../packages/shared/src/contracts.js'

export const parseJsonBody = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return {}

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    throw new ApiError({
      message: 'Invalid JSON payload',
      kind: DOMAIN_ERROR_KIND.VALIDATION,
      reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD,
      statusCode: 400
    })
  }
}
