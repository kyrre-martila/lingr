import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { blockUser, pauseConversation, reportUser } from '../services/safety-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const blockUserRoute = async (req, res) => respond(req, res, 200, await blockUser({ viewer: req.viewer, payload: req.body || {} }))
export const reportUserRoute = async (req, res) => respond(req, res, 201, await reportUser({ viewer: req.viewer, payload: req.body || {} }))
export const pauseConversationRoute = async (req, res) => respond(req, res, 200, await pauseConversation({ viewer: req.viewer, conversationId: req.params.conversationId, payload: req.body || {} }))
