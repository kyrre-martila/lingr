import { getDbClient } from '../db/client.js'
import { ApiError } from '../http/errors.js'
import {
  APP_ID,
  APP_LIFECYCLE_STATE,
  DOMAIN_ERROR_KIND,
  INTERNAL_ID_STRATEGY,
  REASON_CODES
} from '../../../../packages/shared/src/contracts.js'

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const stripPrefixId = (value, prefix, fieldName) => {
  const normalized = normalize(value)
  if (!normalized || !normalized.startsWith(prefix) || normalized.length <= prefix.length) {
    throw new ApiError({ message: `Invalid ${fieldName}`, kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_ID, statusCode: 400 })
  }
  return normalized.slice(prefix.length)
}
const requireViewerId = (viewer) => {
  const userId = viewer?.identity?.userId || null
  if (!userId) throw new ApiError({ message: 'Authentication required', kind: DOMAIN_ERROR_KIND.AUTH, reasonCode: REASON_CODES.AUTH.REQUIRES_AUTH, statusCode: 401 })
  return userId
}
const toExternalSessionId = (id) => `${INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX}${id}`
const toExternalConversationId = (id) => `${INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX}${id}`
const toExternalUserId = (id) => `${INTERNAL_ID_STRATEGY.API_USER_ID_PREFIX}${id}`
const MATCH_CARDS_QUESTION_BANK = Object.freeze([
  { id: 'mc_q_comforting_day', promptKey: 'apps.match_cards.questions.comforting_day', tone: 'gentle' },
  { id: 'mc_q_understood_about_you', promptKey: 'apps.match_cards.questions.understood_about_you', tone: 'reflective' },
  { id: 'mc_q_small_mood_shift', promptKey: 'apps.match_cards.questions.small_mood_shift', tone: 'playful' },
  { id: 'mc_q_time_disappears', promptKey: 'apps.match_cards.questions.time_disappears', tone: 'curious' }
])
const GUESS_ME_PROMPT_BANK = Object.freeze([
  { id: 'gm_q_slow_sunday', promptKey: 'apps.guess_me.questions.slow_sunday', optionKeys: ['apps.guess_me.options.walk_outside', 'apps.guess_me.options.cooking', 'apps.guess_me.options.couch_film', 'apps.guess_me.options.seeing_friends'] },
  { id: 'gm_q_mood_lift', promptKey: 'apps.guess_me.questions.mood_lift', optionKeys: ['apps.guess_me.options.music', 'apps.guess_me.options.good_food', 'apps.guess_me.options.fresh_air', 'apps.guess_me.options.kind_message'] },
  { id: 'gm_q_tonight', promptKey: 'apps.guess_me.questions.tonight', optionKeys: ['apps.guess_me.options.stay_in', 'apps.guess_me.options.walk', 'apps.guess_me.options.film', 'apps.guess_me.options.cook_together'] }
])

const assertAppId = (appId) => {
  if (!Object.values(APP_ID).includes(appId)) {
    throw new ApiError({ message: 'Invalid appId', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  }
}

const assertConversationParticipant = async ({ db, conversationId, userId }) => {
  const participant = await db.conversationParticipant.findFirst({ where: { conversationId, userId }, select: { id: true } })
  if (!participant) throw new ApiError({ message: 'Conversation not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
}

const toDto = (row) => ({
  appSessionId: toExternalSessionId(row.id),
  conversationId: toExternalConversationId(row.conversationId),
  appId: row.appId,
  lifecycle: row.lifecycle,
  invitedByUserId: toExternalUserId(row.invitedByUserId),
  acceptedByUserId: row.acceptedByUserId ? toExternalUserId(row.acceptedByUserId) : null,
  completedByUserId: row.completedByUserId ? toExternalUserId(row.completedByUserId) : null,
  dismissedByUserId: row.dismissedByUserId ? toExternalUserId(row.dismissedByUserId) : null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
})

const pickMatchCardsQuestion = (seed = 0) => MATCH_CARDS_QUESTION_BANK[Math.abs(seed) % MATCH_CARDS_QUESTION_BANK.length]
const pickGuessMePrompt = (seed = 0) => GUESS_ME_PROMPT_BANK[Math.abs(seed) % GUESS_ME_PROMPT_BANK.length]

const toMatchCardsState = (row) => ({
  appSessionId: toExternalSessionId(row.appSessionId),
  conversationId: toExternalConversationId(row.conversationId),
  state: row.state,
  questionId: row.questionId,
  questionPromptKey: row.questionPromptKey,
  questionTone: row.questionTone,
  answerByInviter: row.answerByInviter,
  answerByInvitee: row.answerByInvitee,
  revealState: row.revealState,
  completed: row.completed,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
})

const toGuessMeState = (row) => ({
  appSessionId: toExternalSessionId(row.appSessionId),
  conversationId: toExternalConversationId(row.conversationId),
  state: row.state,
  promptId: row.promptId,
  promptKey: row.promptKey,
  optionKeys: row.optionKeys,
  ownAnswerByInviter: row.ownAnswerByInviter,
  ownAnswerByInvitee: row.ownAnswerByInvitee,
  guessByInviter: row.guessByInviter,
  guessByInvitee: row.guessByInvitee,
  revealState: row.revealState,
  completed: row.completed,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
})

const toSnuggleState = (row) => ({
  appSessionId: toExternalSessionId(row.appSessionId),
  conversationId: toExternalConversationId(row.conversationId),
  state: row.state,
  holdByInviter: row.holdByInviter,
  holdByInvitee: row.holdByInvitee,
  sharedMomentState: row.sharedMomentState,
  completionReason: row.completionReason,
  completed: row.completed,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
})

export const inviteChatApp = async ({ viewer, payload, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const conversationId = stripPrefixId(payload?.conversationId, INTERNAL_ID_STRATEGY.API_CONVERSATION_ID_PREFIX, 'conversationId')
  assertAppId(payload?.appId)
  await assertConversationParticipant({ db, conversationId, userId })
  const row = await db.appSession.create({ data: { conversationId, appId: payload.appId, lifecycle: APP_LIFECYCLE_STATE.INVITE, invitedByUserId: userId } })
  return toDto(row)
}

const transition = async ({ viewer, appSessionId, nextState, fieldName, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const existing = await db.appSession.findUnique({ where: { id } })
  if (!existing) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: existing.conversationId, userId })
  const row = await db.appSession.update({ where: { id }, data: { lifecycle: nextState, [fieldName]: userId } })
  return toDto(row)
}

export const acceptChatAppInvite = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.ACTIVE, fieldName: 'acceptedByUserId', dbClient })
export const completeChatAppSession = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.COMPLETE, fieldName: 'completedByUserId', dbClient })
export const dismissChatAppSession = async ({ viewer, appSessionId, dbClient }) => transition({ viewer, appSessionId, nextState: APP_LIFECYCLE_STATE.DISMISSED, fieldName: 'dismissedByUserId', dbClient })

export const startMatchCardsSession = async ({ viewer, appSessionId, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.MATCH_CARDS) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const selected = pickMatchCardsQuestion(id.length)
  const created = await db.matchCardsSession.create({ data: { appSessionId: id, conversationId: appSession.conversationId, state: 'question_active', questionId: selected.id, questionPromptKey: selected.promptKey, questionTone: selected.tone, revealState: 'hidden', completed: false } })
  return toMatchCardsState(created)
}

export const answerMatchCardsSession = async ({ viewer, appSessionId, answer, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.MATCH_CARDS) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const text = normalize(answer)
  if (!text) throw new ApiError({ message: 'Invalid answer', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const row = await db.matchCardsSession.findUnique({ where: { appSessionId: id } })
  if (!row) throw new ApiError({ message: 'Match cards session missing', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const writeToInviter = appSession.invitedByUserId === userId
  const data = writeToInviter ? { answerByInviter: text } : { answerByInvitee: text }
  const answered = await db.matchCardsSession.update({ where: { appSessionId: id }, data })
  if (answered.answerByInviter && answered.answerByInvitee) {
    const revealed = await db.matchCardsSession.update({ where: { appSessionId: id }, data: { state: 'revealed', revealState: 'revealed', completed: true } })
    await db.appSession.update({ where: { id }, data: { lifecycle: APP_LIFECYCLE_STATE.COMPLETE, completedByUserId: userId } })
    return toMatchCardsState(revealed)
  }
  return toMatchCardsState(answered)
}

export const startGuessMeSession = async ({ viewer, appSessionId, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.GUESS_ME) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const selected = pickGuessMePrompt(id.length)
  const created = await db.guessMeSession.create({ data: { appSessionId: id, conversationId: appSession.conversationId, state: 'prompt_active', promptId: selected.id, promptKey: selected.promptKey, optionKeys: selected.optionKeys, revealState: 'hidden', completed: false } })
  return toGuessMeState(created)
}

export const answerGuessMeSession = async ({ viewer, appSessionId, ownAnswer, guess, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.GUESS_ME) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const answerValue = normalize(ownAnswer)
  const guessValue = normalize(guess)
  if (!answerValue || !guessValue) throw new ApiError({ message: 'Invalid guess me input', kind: DOMAIN_ERROR_KIND.VALIDATION, reasonCode: REASON_CODES.VALIDATION.INVALID_PAYLOAD, statusCode: 400 })
  const row = await db.guessMeSession.findUnique({ where: { appSessionId: id } })
  if (!row) throw new ApiError({ message: 'Guess me session missing', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const writeToInviter = appSession.invitedByUserId === userId
  const data = writeToInviter ? { ownAnswerByInviter: answerValue, guessByInviter: guessValue, state: 'awaiting_reveal' } : { ownAnswerByInvitee: answerValue, guessByInvitee: guessValue, state: 'awaiting_reveal' }
  const answered = await db.guessMeSession.update({ where: { appSessionId: id }, data })
  if (answered.ownAnswerByInviter && answered.ownAnswerByInvitee && answered.guessByInviter && answered.guessByInvitee) {
    const revealed = await db.guessMeSession.update({ where: { appSessionId: id }, data: { state: 'revealed', revealState: 'revealed', completed: true } })
    await db.appSession.update({ where: { id }, data: { lifecycle: APP_LIFECYCLE_STATE.COMPLETE, completedByUserId: userId } })
    return toGuessMeState(revealed)
  }
  return toGuessMeState(answered)
}

export const startSnuggleSession = async ({ viewer, appSessionId, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.SNUGGLE) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const created = await db.snuggleSession.create({ data: { appSessionId: id, conversationId: appSession.conversationId, state: 'active_shared_hold', holdByInviter: false, holdByInvitee: false, sharedMomentState: 'quiet', completionReason: null, completed: false } })
  return toSnuggleState(created)
}

export const setSnuggleHoldState = async ({ viewer, appSessionId, hold, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.SNUGGLE) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const row = await db.snuggleSession.findUnique({ where: { appSessionId: id } })
  if (!row) throw new ApiError({ message: 'Snuggle session missing', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  const nextHold = Boolean(hold)
  const writeToInviter = appSession.invitedByUserId === userId
  const updated = await db.snuggleSession.update({
    where: { appSessionId: id },
    data: writeToInviter ? { holdByInviter: nextHold } : { holdByInvitee: nextHold }
  })
  const together = Boolean(updated.holdByInviter && updated.holdByInvitee)
  const withPresence = await db.snuggleSession.update({
    where: { appSessionId: id },
    data: { sharedMomentState: together ? 'together' : 'quiet' }
  })
  return toSnuggleState(withPresence)
}

export const completeSnuggleSession = async ({ viewer, appSessionId, dbClient }) => {
  const userId = requireViewerId(viewer)
  const db = dbClient || await getDbClient()
  const id = stripPrefixId(appSessionId, INTERNAL_ID_STRATEGY.API_APP_SESSION_ID_PREFIX, 'appSessionId')
  const appSession = await db.appSession.findUnique({ where: { id } })
  if (!appSession || appSession.appId !== APP_ID.SNUGGLE) throw new ApiError({ message: 'App session not found', kind: DOMAIN_ERROR_KIND.DOMAIN, reasonCode: REASON_CODES.CONVERSATION.NOT_FOUND, statusCode: 404 })
  await assertConversationParticipant({ db, conversationId: appSession.conversationId, userId })
  const completed = await db.snuggleSession.update({
    where: { appSessionId: id },
    data: { state: 'complete', holdByInviter: false, holdByInvitee: false, sharedMomentState: 'passed', completionReason: 'moment_passed', completed: true }
  })
  await db.appSession.update({ where: { id }, data: { lifecycle: APP_LIFECYCLE_STATE.COMPLETE, completedByUserId: userId } })
  return toSnuggleState(completed)
}
