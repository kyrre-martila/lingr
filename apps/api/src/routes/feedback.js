import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../../../../packages/shared/src/contracts.js'
import { submitEmotionalFeedback } from '../services/product-fit-service.js'

const FEEDBACK_TAGS = new Set(['calm', 'thoughtful', 'overwhelming', 'meaningful', 'too_slow', 'too_fast', 'not_for_me'])

export const submitEmotionalFeedbackRoute = async (req, res) => {
  const userId = req.viewer?.identity?.userId
  if (!userId) throw new ApiError({ message: 'Authentication required', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  const tag = typeof req.body?.tag === 'string' ? req.body.tag.trim() : ''
  if (!FEEDBACK_TAGS.has(tag)) throw new ApiError({ message: 'Invalid feedback tag', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const data = await submitEmotionalFeedback({ userId, tag, note: req.body?.note || null })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}
