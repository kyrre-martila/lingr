import { ok } from '../http/envelope.js'

export const healthRoute = (req, res) => {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok({
    service: 'lingr-api',
    status: 'ok',
    now: new Date().toISOString()
  }, { requestId: req.requestId })))
}
