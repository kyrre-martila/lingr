import { DOMAIN_ERROR_KIND } from '../../../../packages/shared/src/contracts.js'
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
  reasonCode: 'route.not_found',
  statusCode: 404
})

export const errorHandler = (err, req, res) => {
  const normalized = err instanceof ApiError
    ? err
    : new ApiError({ message: 'Unexpected server error', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: 'domain.unexpected', statusCode: 500 })

  res.writeHead(normalized.statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(fail({
    kind: normalized.kind,
    reasonCode: normalized.reasonCode,
    message: normalized.message,
    details: normalized.details,
    requestId: req.requestId
  })))
}
