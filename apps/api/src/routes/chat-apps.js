import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { acceptChatAppInvite, answerGuessMeSession, answerMatchCardsSession, completeChatAppSession, completeSnuggleSession, dismissChatAppSession, inviteChatApp, setSnuggleHoldState, startGuessMeSession, startMatchCardsSession, startSnuggleSession } from '../services/chat-app-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const inviteChatAppRoute = async (req, res) => respond(req, res, 201, await inviteChatApp({ viewer: req.viewer, payload: req.body || {} }))
export const acceptChatAppInviteRoute = async (req, res) => respond(req, res, 200, await acceptChatAppInvite({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
export const dismissChatAppInviteRoute = async (req, res) => respond(req, res, 200, await dismissChatAppSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
export const completeChatAppSessionRoute = async (req, res) => respond(req, res, 200, await completeChatAppSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))

export const matchCardsAnswerRoute = async (req, res) => respond(req, res, 200, await answerMatchCardsSession({ viewer: req.viewer, appSessionId: req.params.appSessionId, answer: req.body?.answer }))

export const guessMeOwnAnswerRoute = async (req, res) => respond(req, res, 200, await answerGuessMeSession({ viewer: req.viewer, appSessionId: req.params.appSessionId, ownAnswer: req.body?.ownAnswer, guess: req.body?.guess }))
export const guessMePartnerGuessRoute = async (req, res) => respond(req, res, 200, await answerGuessMeSession({ viewer: req.viewer, appSessionId: req.params.appSessionId, ownAnswer: req.body?.ownAnswer, guess: req.body?.guess }))

export const snuggleAcceptRoute = async (req, res) => {
  await acceptChatAppInvite({ viewer: req.viewer, appSessionId: req.params.appSessionId })
  return respond(req, res, 200, await startSnuggleSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
}
export const snuggleDeclineRoute = async (req, res) => respond(req, res, 200, await dismissChatAppSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
export const snuggleHoldRoute = async (req, res) => respond(req, res, 200, await setSnuggleHoldState({ viewer: req.viewer, appSessionId: req.params.appSessionId, hold: true }))
export const snuggleReleaseRoute = async (req, res) => respond(req, res, 200, await setSnuggleHoldState({ viewer: req.viewer, appSessionId: req.params.appSessionId, hold: false }))
export const snuggleCompleteRoute = async (req, res) => respond(req, res, 200, await completeSnuggleSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))

export const matchCardsStartRoute = async (req, res) => respond(req, res, 200, await startMatchCardsSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
export const guessMeStartRoute = async (req, res) => respond(req, res, 200, await startGuessMeSession({ viewer: req.viewer, appSessionId: req.params.appSessionId }))
