import crypto from 'node:crypto'
import { ACCOUNT_LIFECYCLE_STATE } from '../../../../packages/shared/src/contracts.js'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7
const usersByEmail = new Map()
const usersById = new Map()
const sessionsByToken = new Map()

const now = () => Date.now()
const hashPassword = (password) => crypto.createHash('sha256').update(String(password)).digest('hex')
const createId = (prefix) => `${prefix}${crypto.randomBytes(12).toString('hex')}`

export const registerWithEmailPassword = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (usersByEmail.has(normalizedEmail)) return null
  const user = { userId: createId('usr_'), email: normalizedEmail, passwordHash: hashPassword(password), lifecycleState: ACCOUNT_LIFECYCLE_STATE.ONBOARDING }
  usersByEmail.set(normalizedEmail, user)
  usersById.set(user.userId, user)
  return user
}

export const authenticateWithEmailPassword = async ({ email, password }) => {
  const user = usersByEmail.get(String(email || '').trim().toLowerCase())
  if (!user || user.passwordHash !== hashPassword(password)) return null
  return user
}

export const createSession = async ({ userId }) => {
  const token = createId('sess_')
  const session = { sessionId: createId('sid_'), token, userId, expiresAt: now() + SESSION_TTL_MS }
  sessionsByToken.set(token, session)
  return session
}

export const invalidateSession = async ({ sessionToken }) => {
  if (!sessionToken) return false
  return sessionsByToken.delete(sessionToken)
}

export const lookupSession = async ({ sessionToken }) => {
  if (!sessionToken) return null
  const session = sessionsByToken.get(sessionToken)
  if (!session) return null
  if (session.expiresAt <= now()) {
    sessionsByToken.delete(sessionToken)
    return { expired: true }
  }
  const user = usersById.get(session.userId)
  if (!user) return null
  return { sessionId: session.sessionId, userId: user.userId, lifecycleState: user.lifecycleState, permissions: [] }
}

export const __expireSessionForTest = (sessionToken) => {
  const session = sessionsByToken.get(sessionToken)
  if (session) session.expiresAt = now() - 1
}
