import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { REASON_CODES } from '../../../packages/shared/src/contracts.js'
import { acceptChatAppInvite, answerGuessMeSession, answerMatchCardsSession, completeChatAppSession, completeSnuggleSession, dismissChatAppSession, inviteChatApp, setSnuggleHoldState, startGuessMeSession, startMatchCardsSession, startSnuggleSession } from '../src/services/chat-app-service.js'

const now = new Date('2026-05-19T00:00:00.000Z')

const makeDb = () => {
  const store = new Map()
  const trust = { score: 0 }
  const db = {
    conversationParticipant: { findFirst: async ({ where }) => (where.conversationId === 'c1' && ['u1', 'u2'].includes(where.userId) ? { id: 'cp1' } : null) },
    appSession: {
      create: async ({ data }) => {
        const row = { id: 'a1', ...data, acceptedByUserId: null, completedByUserId: null, dismissedByUserId: null, createdAt: now, updatedAt: now }
        store.set('a1', row)
        return row
      },
      findUnique: async ({ where }) => store.get(where.id) || null,
      update: async ({ where, data }) => {
        const row = { ...store.get(where.id), ...data, updatedAt: now }
        store.set(where.id, row)
        return row
      }
    },
    matchCardsSession: {
      create: async ({ data }) => {
        const row = { id: 'm1', answerByInviter: null, answerByInvitee: null, createdAt: now, updatedAt: now, ...data }
        store.set(`m_${data.appSessionId}`, row)
        return row
      },
      findUnique: async ({ where }) => store.get(`m_${where.appSessionId}`) || null,
      update: async ({ where, data }) => {
        const key = `m_${where.appSessionId}`
        const row = { ...store.get(key), ...data, updatedAt: now }
        store.set(key, row)
        return row
      }
    },
    guessMeSession: {
      create: async ({ data }) => {
        const row = { id: 'g1', ownAnswerByInviter: null, ownAnswerByInvitee: null, guessByInviter: null, guessByInvitee: null, createdAt: now, updatedAt: now, ...data }
        store.set(`g_${data.appSessionId}`, row)
        return row
      },
      findUnique: async ({ where }) => store.get(`g_${where.appSessionId}`) || null,
      update: async ({ where, data }) => {
        const key = `g_${where.appSessionId}`
        const row = { ...store.get(key), ...data, updatedAt: now }
        store.set(key, row)
        return row
      }
    },
    snuggleSession: {
      create: async ({ data }) => {
        const row = { id: 's1', holdByInviter: false, holdByInvitee: false, completionReason: null, createdAt: now, updatedAt: now, ...data }
        store.set(`s_${data.appSessionId}`, row)
        return row
      },
      findUnique: async ({ where }) => store.get(`s_${where.appSessionId}`) || null,
      update: async ({ where, data }) => {
        const key = `s_${where.appSessionId}`
        const row = { ...store.get(key), ...data, updatedAt: now }
        store.set(key, row)
        return row
      }
    },
    $transaction: async (cb) => cb(db),
    conversation: { findUnique: async ({ where }) => (where.id === 'c1' ? { id: 'c1', participants: [{ userId: 'u1' }, { userId: 'u2' }] } : null) },
    relationshipLayer: {
      upsert: async () => ({ id: 'rl1', currentLayer: 1, trustScore: trust.score, reciprocalMessageCount: 0, layer1UnlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), layer2UnlockedAt: null, layer3UnlockedAt: null }),
      update: async ({ data }) => { if (typeof data.trustScore === 'number') trust.score = data.trustScore; return data }
    },
    trustSignalRule: { findUnique: async ({ where }) => ({ signalType: where.signalType, points: where.signalType === 'match_cards_completed' ? 8 : where.signalType === 'guess_me_completed' ? 6 : where.signalType === 'snuggle_shared' ? 5 : 2, enabled: true }) },
    layerRule: { findMany: async () => [{ fromLayer: 1, toLayer: 2, minElapsedMinutes: 240, requiredTrustScore: 20, enabled: true }] },
    message: { findFirst: async () => null, create: async () => ({ id: 'm1' }) },
    __trust: trust
  }
  return db
}

test('invite requires auth', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAnonymousViewer(), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH)
})

test('invite enforces canonical app ids', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'anything' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.VALIDATION.INVALID_PAYLOAD)
})

test('conversation ownership is required', async () => {
  await assert.rejects(inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u9' }), payload: { conversationId: 'cnv_c1', appId: 'guess_me' }, dbClient: makeDb() }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})

test('invite accept complete lifecycle is conversation scoped', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  assert.equal(invited.lifecycle, 'invite')
  const active = await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(active.lifecycle, 'active')
  const complete = await completeChatAppSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(complete.lifecycle, 'complete')
  assert.equal(complete.conversationId, 'cnv_c1')
})

test('app sessions cannot leak across conversations', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: db })
  await assert.rejects(acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u3' }), appSessionId: invited.appSessionId, dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})

test('match cards invite flow starts a single-question session', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  const session = await startMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(session.state, 'question_active')
  assert.equal(Boolean(session.questionPromptKey), true)
})

test('match cards reveals only after both answers and persists answers', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  await startMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  const oneAnswer = await answerMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, answer: 'Tea and silence.', dbClient: db })
  assert.equal(oneAnswer.revealState, 'hidden')
  assert.equal(oneAnswer.answerByInviter, 'Tea and silence.')
  assert.equal(oneAnswer.completed, false)
  const both = await answerMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, answer: 'A warm shower.', dbClient: db })
  assert.equal(both.revealState, 'revealed')
  assert.equal(both.state, 'revealed')
  assert.equal(both.completed, true)
  assert.equal(both.answerByInvitee, 'A warm shower.')
  assert.equal(db.__trust.score, 8)
})

test('match cards no unilateral reveal for non-participant', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'match_cards' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  await startMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  await assert.rejects(answerMatchCardsSession({ viewer: createAuthenticatedViewer({ userId: 'u3' }), appSessionId: invited.appSessionId, answer: 'peek', dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})

test('guess me invite flow starts a single prompt session', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'guess_me' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  const session = await startGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(session.state, 'prompt_active')
  assert.equal(Array.isArray(session.optionKeys), true)
  assert.equal(session.optionKeys.length, 4)
})

test('guess me persists own answers and guesses then reveals only after both guessed', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'guess_me' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  await startGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  const first = await answerGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, ownAnswer: 'apps.guess_me.options.music', guess: 'apps.guess_me.options.good_food', dbClient: db })
  assert.equal(first.ownAnswerByInviter, 'apps.guess_me.options.music')
  assert.equal(first.guessByInviter, 'apps.guess_me.options.good_food')
  assert.equal(first.revealState, 'hidden')
  assert.equal(first.completed, false)
  const second = await answerGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, ownAnswer: 'apps.guess_me.options.fresh_air', guess: 'apps.guess_me.options.music', dbClient: db })
  assert.equal(second.revealState, 'revealed')
  assert.equal(second.completed, true)
  assert.equal(second.ownAnswerByInvitee, 'apps.guess_me.options.fresh_air')
  assert.equal(second.guessByInvitee, 'apps.guess_me.options.music')
  assert.equal(db.__trust.score, 6)
})

test('guess me no unilateral reveal and relationship isolation', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'guess_me' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  await startGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  await assert.rejects(answerGuessMeSession({ viewer: createAuthenticatedViewer({ userId: 'u3' }), appSessionId: invited.appSessionId, ownAnswer: 'apps.guess_me.options.walk', guess: 'apps.guess_me.options.film', dbClient: db }), (e) => e.reasonCode === REASON_CODES.CONVERSATION.NOT_FOUND)
})

test('snuggle requires consent first and starts only after accept', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  assert.equal(invited.lifecycle, 'invite')
  const accepted = await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(accepted.lifecycle, 'active')
  const started = await startSnuggleSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(started.state, 'active_shared_hold')
  assert.equal(started.sharedMomentState, 'quiet')
})

test('snuggle shared state appears only when both hold', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  await startSnuggleSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, dbClient: db })
  const one = await setSnuggleHoldState({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited.appSessionId, hold: true, dbClient: db })
  assert.equal(one.holdByInviter, true)
  assert.equal(one.holdByInvitee, false)
  assert.equal(one.sharedMomentState, 'quiet')
  const both = await setSnuggleHoldState({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, hold: true, dbClient: db })
  assert.equal(both.sharedMomentState, 'together')
  assert.equal(db.__trust.score, 5)
  await setSnuggleHoldState({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, hold: false, dbClient: db })
  await setSnuggleHoldState({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, hold: true, dbClient: db })
  assert.equal(db.__trust.score, 5)
})

test('snuggle decline and neutral ending semantics', async () => {
  const db = makeDb()
  const invited = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  const declined = await dismissChatAppSession({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited.appSessionId, dbClient: db })
  assert.equal(declined.lifecycle, 'dismissed')
  const invited2 = await inviteChatApp({ viewer: createAuthenticatedViewer({ userId: 'u1' }), payload: { conversationId: 'cnv_c1', appId: 'snuggle' }, dbClient: db })
  await acceptChatAppInvite({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited2.appSessionId, dbClient: db })
  await startSnuggleSession({ viewer: createAuthenticatedViewer({ userId: 'u1' }), appSessionId: invited2.appSessionId, dbClient: db })
  const completed = await completeSnuggleSession({ viewer: createAuthenticatedViewer({ userId: 'u2' }), appSessionId: invited2.appSessionId, dbClient: db })
  assert.equal(completed.sharedMomentState, 'passed')
  assert.equal(completed.completionReason, 'moment_passed')
})
