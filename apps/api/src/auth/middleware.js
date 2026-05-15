import { lookupSession } from './session-store.js'
import { createAnonymousViewer, createAuthenticatedViewer } from './viewer.js'

export const resolveViewerContext = async (req) => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null

  const session = await lookupSession({ sessionToken: bearerToken })
  if (!session) return createAnonymousViewer({ requestId: req.requestId })

  return createAuthenticatedViewer({
    requestId: req.requestId,
    userId: session.userId,
    sessionId: session.sessionId,
    lifecycleState: session.lifecycleState,
    permissions: session.permissions
  })
}

export const withAuthContext = async (req) => {
  req.viewer = await resolveViewerContext(req)
}
