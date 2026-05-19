import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { ACCOUNT_LIFECYCLE_STATE } from '../../../../packages/shared/src/contracts.js'
import { getDbClient } from '../db/client.js'

let dbClientOverride = null
const dbClient = async () => dbClientOverride || getDbClient()
export const __setDbClientForTest = (client) => { dbClientOverride = client }

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30
const BCRYPT_ROUNDS = 12

const nowDate = () => new Date()
const futureDate = (ms) => new Date(Date.now() + ms)
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex')

export const hashPassword = async (password) => bcrypt.hash(String(password), BCRYPT_ROUNDS)
export const verifyPassword = async (password, passwordHash) => bcrypt.compare(String(password), String(passwordHash || ''))

const toLifecycleState = ({ status, profileCompleteness }) => {
  if (status === 'paused') return ACCOUNT_LIFECYCLE_STATE.PAUSED
  if (status === 'deleted') return ACCOUNT_LIFECYCLE_STATE.DELETED
  if (status === 'restricted') return ACCOUNT_LIFECYCLE_STATE.RESTRICTED
  if ((profileCompleteness || 0) < 80) return ACCOUNT_LIFECYCLE_STATE.ONBOARDING
  return ACCOUNT_LIFECYCLE_STATE.ACTIVE
}

export const registerWithEmailPassword = async ({ email, password }) => {
  const db = await dbClient()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const existing = await db.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })
  if (existing) return null

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      status: 'active',
      profile: { create: { displayName: 'New Lingr member', visibility: 'discoverable', profileCompleteness: 0 } }
    },
    select: { id: true, status: true, profile: { select: { profileCompleteness: true } } }
  })

  return { userId: user.id, lifecycleState: toLifecycleState({ status: user.status, profileCompleteness: user.profile?.profileCompleteness }) }
}

export const authenticateWithEmailPassword = async ({ email, password }) => {
  const db = await dbClient()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const user = await db.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, status: true, passwordHash: true, profile: { select: { profileCompleteness: true } } } })
  if (!user) return null
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null
  return { userId: user.id, lifecycleState: toLifecycleState({ status: user.status, profileCompleteness: user.profile?.profileCompleteness }) }
}

export const createSession = async ({ userId }) => {
  const db = await dbClient()
  const token = `sess_${crypto.randomBytes(24).toString('hex')}`
  const created = await db.session.create({
    data: { userId, tokenHash: hashToken(token), status: 'active', expiresAt: futureDate(SESSION_TTL_MS), lastSeenAt: nowDate() },
    select: { id: true, expiresAt: true }
  })
  await db.session.updateMany({ where: { userId, status: 'active', expiresAt: { lt: nowDate() } }, data: { status: 'expired' } })
  return { sessionId: created.id, token, expiresAt: created.expiresAt }
}

export const invalidateSession = async ({ sessionToken }) => {
  if (!sessionToken) return false
  const db = await dbClient()
  const res = await db.session.updateMany({ where: { tokenHash: hashToken(sessionToken), status: 'active' }, data: { status: 'revoked' } })
  return res.count > 0
}

export const lookupSession = async ({ sessionToken }) => {
  if (!sessionToken) return null
  const db = await dbClient()
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    select: { id: true, userId: true, status: true, expiresAt: true, user: { select: { status: true, profile: { select: { profileCompleteness: true } } } } }
  })
  if (!session) return null
  if (session.status === 'revoked') return { revoked: true }
  if (session.status === 'expired') return { expired: true }
  if (session.expiresAt && session.expiresAt.getTime() <= Date.now()) {
    await db.session.update({ where: { id: session.id }, data: { status: 'expired' } })
    return { expired: true }
  }
  return { sessionId: session.id, userId: session.userId, lifecycleState: toLifecycleState({ status: session.user.status, profileCompleteness: session.user.profile?.profileCompleteness }), permissions: [] }
}
