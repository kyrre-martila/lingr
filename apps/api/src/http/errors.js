import { DOMAIN_ERROR_KIND, ERROR_RETRYABILITY, REASON_CODES } from '../../../../packages/shared/src/contracts.js'
import { fail } from './envelope.js'

export class ApiError extends Error {
  constructor({ message, kind = DOMAIN_ERROR_KIND.DOMAIN, reasonCode = 'domain.unknown', statusCode = 500, details }) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.reasonCode = reasonCode
    this.statusCode = statusCode
    this.details = details
  }
}

export const notFound = (path) => new ApiError({
  message: `Route not found: ${path}`,
  kind: DOMAIN_ERROR_KIND.ROUTE,
  reasonCode: REASON_CODES.ROUTE.UNKNOWN_ROUTE,
  statusCode: 404
})

export const toApiError = (error) => {
  if (error instanceof ApiError) return error
  if (error?.name === 'PrismaClientValidationError' || error?.name === 'PrismaClientKnownRequestError') {
    return new ApiError({
      message: 'Database query failed',
      kind: DOMAIN_ERROR_KIND.DOMAIN,
      reasonCode: 'domain.invalid_query',
      statusCode: 500,
      details: { prisma: { name: error.name, message: error.message } }
    })
  }
  return new ApiError({ message: 'Unexpected server error', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: 'domain.unexpected', statusCode: 500 })
}

export const errorHandler = (err, req, res) => {
  const normalized = toApiError(err)
  if (!(err instanceof ApiError)) {
    console.error('[lingr-api] unhandled error', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      errorName: err?.name,
      errorMessage: err?.message,
      stack: err?.stack
    })
  }

  res.writeHead(normalized.statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(fail({
    kind: normalized.kind,
    reasonCode: normalized.reasonCode,
    message: normalized.message,
    retryable: ERROR_RETRYABILITY[normalized.kind] ?? false,
    details: normalized.details,
    requestId: req.requestId
  })))
}
