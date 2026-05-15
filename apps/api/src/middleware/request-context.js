import crypto from 'node:crypto'

export const withRequestContext = (req) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID()
}
