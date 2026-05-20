import { ok } from '../http/envelope.js'
import { ApiError } from '../http/errors.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../../../../packages/shared/src/contracts.js'
import { authenticateWithEmailPassword, createSession, invalidateSession, registerWithEmailPassword } from '../auth/session-store.js'
import { checkRegionAvailability } from '../services/region-service.js'
import { viewerMeta } from '../http/auth-safe.js'
import { env } from '../config/env.js'

const SESSION_COOKIE_NAME = 'lingr_session'

const isProduction = () => String(process.env.NODE_ENV || '').toLowerCase() === 'production'

const createSessionCookie = (sessionToken) => {
  const secure = isProduction() ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; HttpOnly; Path=/; SameSite=Lax${secure}`
}

const createSessionCookieClear = () => {
  const secure = isProduction() ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
}


const isInviteCodeValid = (inviteCode) => {
  if (env.earlyAccessMode !== 'invite_only') return true
  const normalized = String(inviteCode || '').trim()
  if (!normalized) return false
  return env.inviteCodes.includes(normalized)
}

const write = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers })
  res.end(JSON.stringify(body))
}

export const registerRoute = async (req, res) => {
  const { email, password, countryCode, regionSlug, inviteCode } = req.body || {}
  if (!email || !password || !countryCode || !regionSlug || String(password).length < 8) throw new ApiError({ message: 'Invalid registration payload', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  if (!isInviteCodeValid(inviteCode)) throw new ApiError({ message: 'Invite code required for early access', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 403 })
  const availability = await checkRegionAvailability({ countryCode, regionSlug })
  if (!availability.canRegister) throw new ApiError({ message: 'Region not open for registration', kind: DOMAIN_ERROR_KIND.PERMISSION, reasonCode: availability.reasonCode, statusCode: 403 })
  const user = await registerWithEmailPassword({ email, password })
  if (!user) throw new ApiError({ message: 'Email already in use', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 409 })
  const session = await createSession({ userId: user.userId })
  write(res, 201, ok({ userId: user.userId, lifecycleState: user.lifecycleState }, { requestId: req.requestId, ...viewerMeta(req.viewer) }), { 'set-cookie': createSessionCookie(session.token) })
}

export const loginRoute = async (req, res) => {
  const { email, password } = req.body || {}
  const user = await authenticateWithEmailPassword({ email, password })
  if (!user) throw new ApiError({ message: 'Invalid credentials', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.INVALID_CREDENTIALS, statusCode: 401 })
  const session = await createSession({ userId: user.userId })
  write(res, 200, ok({ userId: user.userId, lifecycleState: user.lifecycleState }, { requestId: req.requestId, ...viewerMeta(req.viewer) }), { 'set-cookie': createSessionCookie(session.token) })
}

export const logoutRoute = async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null
  const cookieToken = String(req.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`))?.slice(`${SESSION_COOKIE_NAME}=`.length)
  await invalidateSession({ sessionToken: cookieToken ? decodeURIComponent(cookieToken) : bearerToken })
  write(res, 200, ok({ loggedOut: true }, { requestId: req.requestId, ...viewerMeta(req.viewer) }), { 'set-cookie': createSessionCookieClear() })
}
