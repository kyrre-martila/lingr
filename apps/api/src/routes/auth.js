import { ok } from '../http/envelope.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../../../../packages/shared/src/contracts.js'
import { authenticateWithEmailPassword, createSession, invalidateSession, registerWithEmailPassword } from '../auth/session-store.js'
import { viewerMeta } from '../http/auth-safe.js'

const write = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

export const registerRoute = async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password || String(password).length < 8) throw new ApiError({ message: 'Invalid registration payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const user = await registerWithEmailPassword({ email, password })
  if (!user) throw new ApiError({ message: 'Email already in use', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 409 })
  const session = await createSession({ userId: user.userId })
  write(res, 201, ok({ userId: user.userId, sessionToken: session.token, lifecycleState: user.lifecycleState }, { requestId: req.requestId, ...viewerMeta(req.viewer) }))
}

export const loginRoute = async (req, res) => {
  const { email, password } = req.body || {}
  const user = await authenticateWithEmailPassword({ email, password })
  if (!user) throw new ApiError({ message: 'Invalid credentials', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.INVALID_CREDENTIALS, statusCode: 401 })
  const session = await createSession({ userId: user.userId })
  write(res, 200, ok({ userId: user.userId, sessionToken: session.token, lifecycleState: user.lifecycleState }, { requestId: req.requestId, ...viewerMeta(req.viewer) }))
}

export const logoutRoute = async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null
  await invalidateSession({ sessionToken: bearerToken })
  write(res, 200, ok({ loggedOut: true }, { requestId: req.requestId, ...viewerMeta(req.viewer) }))
}
