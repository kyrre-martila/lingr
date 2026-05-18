import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { getDailyDiscovery } from '../services/discovery-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const getDailyDiscoveryRoute = async (req, res) => respond(req, res, 200, await getDailyDiscovery({ viewer: req.viewer }))
