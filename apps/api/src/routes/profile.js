import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { getViewerProfile, updateViewerProfileBasics, getViewerProfileCompleteness } from '../services/profile-service.js'

export const getViewerProfileRoute = async (req, res) => {
  const data = await getViewerProfile({ viewer: req.viewer })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const updateViewerProfileBasicsRoute = async (req, res) => {
  const data = await updateViewerProfileBasics({ viewer: req.viewer, payload: req.body || {} })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const getViewerProfileCompletenessRoute = async (req, res) => {
  const data = await getViewerProfileCompleteness({ viewer: req.viewer })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}
