import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { archiveViewerGlimps, createGlimps, getViewerGlimpsById, listViewerGlimps } from '../services/glimps-service.js'

export const createGlimpsRoute = async (req, res) => {
  const data = await createGlimps({ viewer: req.viewer, payload: req.body || {} })
  res.writeHead(201, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const listViewerGlimpsRoute = async (req, res) => {
  const data = await listViewerGlimps({ viewer: req.viewer })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const getViewerGlimpsByIdRoute = async (req, res) => {
  const data = await getViewerGlimpsById({ viewer: req.viewer, glimpsId: req.params.glimpsId })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const archiveViewerGlimpsRoute = async (req, res) => {
  const data = await archiveViewerGlimps({ viewer: req.viewer, glimpsId: req.params.glimpsId })
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}
