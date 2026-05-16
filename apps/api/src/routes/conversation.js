import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { createConversationFromSpark, getViewerConversationById, listConversationMessages, listViewerConversations, sendConversationMessage } from '../services/conversation-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const listViewerConversationsRoute = async (req, res) => respond(req, res, 200, await listViewerConversations({ viewer: req.viewer }))
export const getViewerConversationByIdRoute = async (req, res) => respond(req, res, 200, await getViewerConversationById({ viewer: req.viewer, conversationId: req.params.conversationId }))
export const createConversationFromSparkRoute = async (req, res) => respond(req, res, 201, await createConversationFromSpark({ viewer: req.viewer, payload: req.body || {} }))
export const listConversationMessagesRoute = async (req, res) => respond(req, res, 200, await listConversationMessages({ viewer: req.viewer, conversationId: req.params.conversationId, cursor: req.query?.cursor, limit: req.query?.limit }))
export const sendConversationMessageRoute = async (req, res) => respond(req, res, 201, await sendConversationMessage({ viewer: req.viewer, conversationId: req.params.conversationId, payload: req.body || {} }))
