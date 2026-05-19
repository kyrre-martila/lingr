import { lookupSession } from './session-store.js'
import { createAnonymousViewer, createAuthenticatedViewer } from './viewer.js'
import { AUTH_SESSION_STATE } from '../../../../packages/shared/src/contracts.js'

const SESSION_COOKIE_NAME = 'lingr_session'

const readSessionTokenFromCookie = (cookieHeader = '') => {
  if (!cookieHeader) return null
  const parts = String(cookieHeader).split(';')
  for (const part of parts) {
    const [name, ...rest] = part.trim().split('=')
    if (name !== SESSION_COOKIE_NAME) continue
    const value = rest.join('=').trim()
    return value ? decodeURIComponent(value) : null
  }
  return null
}

export const resolveViewerContext = async (req) => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null
  const cookieToken = readSessionTokenFromCookie(req.headers.cookie || '')
  const sessionToken = cookieToken || bearerToken

  const session = await lookupSession({ sessionToken })
  if (session?.expired) return { ...createAnonymousViewer({ requestId: req.requestId }), authState: AUTH_SESSION_STATE.EXPIRED }
  if (session?.revoked) return createAnonymousViewer({ requestId: req.requestId })
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
