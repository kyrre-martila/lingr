import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { acceptSpark, createSparkInvitation, declineSpark, getViewerSparkById, listViewerSparks, pauseSpark } from '../services/spark-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const createSparkInvitationRoute = async (req, res) => respond(req, res, 201, await createSparkInvitation({ viewer: req.viewer, payload: req.body || {} }))
export const listViewerSparksRoute = async (req, res) => respond(req, res, 200, await listViewerSparks({ viewer: req.viewer }))
export const getViewerSparkByIdRoute = async (req, res) => respond(req, res, 200, await getViewerSparkById({ viewer: req.viewer, sparkId: req.params.sparkId }))
export const acceptSparkRoute = async (req, res) => respond(req, res, 200, await acceptSpark({ viewer: req.viewer, sparkId: req.params.sparkId }))
export const pauseSparkRoute = async (req, res) => respond(req, res, 200, await pauseSpark({ viewer: req.viewer, sparkId: req.params.sparkId }))
export const declineSparkRoute = async (req, res) => respond(req, res, 200, await declineSpark({ viewer: req.viewer, sparkId: req.params.sparkId }))
