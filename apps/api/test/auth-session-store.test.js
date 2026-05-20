import test from 'node:test'
import assert from 'node:assert/strict'
import { authenticateWithEmailPassword, createSession, invalidateSession, lookupSession, registerWithEmailPassword, __setDbClientForTest } from '../src/auth/session-store.js'

const createFakeDb = () => {
  const users = []
  const sessions = []
  return {
    _users: users,
    _sessions: sessions,
    user: {
      findUnique: async ({ where }) => users.find((u) => u.email === where.email) || null,
      create: async ({ data }) => {
        const user = { id: `usr_${users.length + 1}`, email: data.email, passwordHash: data.passwordHash, status: data.status, profile: { profileCompleteness: data.profile.create.profileCompleteness } }
        users.push(user)
        return user
      }
    },
    session: {
      create: async ({ data }) => { const s = { id: `sid_${sessions.length + 1}`, ...data }; sessions.push(s); return s },
      updateMany: async ({ where, data }) => { let c=0; for (const s of sessions){ if ((where.userId? s.userId===where.userId:true) && (where.status? s.status===where.status:true) && (where.tokenHash? s.tokenHash===where.tokenHash:true) && (!where.expiresAt || s.expiresAt<where.expiresAt.lt)){ Object.assign(s,data); c++ } } return { count:c } },
      findUnique: async ({ where }) => sessions.find((s) => s.tokenHash === where.tokenHash) ? { ...sessions.find((s) => s.tokenHash === where.tokenHash), user: users.find((u)=>u.id===sessions.find((s) => s.tokenHash === where.tokenHash).userId) } : null,
      update: async ({ where, data }) => { const s=sessions.find((x)=>x.id===where.id); Object.assign(s,data); return s }
    }
  }
}

test('register hashes password and creates onboarding shell user', async () => {
  const db = createFakeDb(); __setDbClientForTest(db)
  const created = await registerWithEmailPassword({ email: 'A@B.com', password: 'password123' })
  assert.equal(created.userId, 'usr_1')
  assert.notEqual(db._users[0].passwordHash, 'password123')
  assert.equal(await authenticateWithEmailPassword({ email: 'a@b.com', password: 'password123' })?.then(Boolean), true)
})

test('session lifecycle covers active expired and revoked', async () => {
  const db = createFakeDb(); __setDbClientForTest(db)
  await registerWithEmailPassword({ email: 'x@y.com', password: 'password123' })
  const session = await createSession({ userId: 'usr_1' })
  const active = await lookupSession({ sessionToken: session.token })
  assert.equal(active.userId, 'usr_1')
  db._sessions[0].expiresAt = new Date(Date.now() - 1000)
  const expired = await lookupSession({ sessionToken: session.token })
  assert.equal(expired.expired, true)
  const session2 = await createSession({ userId: 'usr_1' })
  await invalidateSession({ sessionToken: session2.token })
  const revoked = await lookupSession({ sessionToken: session2.token })
  assert.equal(revoked.revoked, true)
})


test('session token hashing uses HMAC secret and requires prod secret', async () => {
  const prevNodeEnv = process.env.NODE_ENV
  const prevSecret = process.env.LINGR_SESSION_SECRET
  const db = createFakeDb(); __setDbClientForTest(db)
  await registerWithEmailPassword({ email: 'h@mac.com', password: 'password123' })

  process.env.NODE_ENV = 'test'
  process.env.LINGR_SESSION_SECRET = 'secret-a'
  const first = await createSession({ userId: 'usr_1' })
  const firstHash = db._sessions[db._sessions.length - 1].tokenHash

  process.env.LINGR_SESSION_SECRET = 'secret-b'
  const second = await createSession({ userId: 'usr_1' })
  const secondHash = db._sessions[db._sessions.length - 1].tokenHash

  assert.notEqual(firstHash, secondHash)
  assert.equal(await lookupSession({ sessionToken: first.token })?.then(Boolean), false)
  assert.equal(await lookupSession({ sessionToken: second.token })?.then(Boolean), true)

  process.env.NODE_ENV = 'production'
  delete process.env.LINGR_SESSION_SECRET
  await assert.rejects(() => createSession({ userId: 'usr_1' }), /LINGR_SESSION_SECRET is required in production/)

  process.env.NODE_ENV = prevNodeEnv
  if (prevSecret === undefined) delete process.env.LINGR_SESSION_SECRET
  else process.env.LINGR_SESSION_SECRET = prevSecret
})

test('invalid session tokens fail cleanly', async () => {
  const db = createFakeDb(); __setDbClientForTest(db)
  process.env.LINGR_SESSION_SECRET = 'secret-clean-fail'
  await registerWithEmailPassword({ email: 'invalid@token.com', password: 'password123' })
  const session = await createSession({ userId: 'usr_1' })
  assert.equal(await lookupSession({ sessionToken: `${session.token}_wrong` }), null)
  assert.equal(await invalidateSession({ sessionToken: `${session.token}_wrong` }), false)
})
