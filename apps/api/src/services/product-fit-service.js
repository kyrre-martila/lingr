import { getDbClient } from '../db/client.js'

export const PRODUCT_EVENT_TYPE = Object.freeze({
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_GLIMPS_PUBLISHED: 'first_glimps_published',
  FIRST_SPARK_SENT: 'first_spark_sent',
  MUTUAL_SPARK: 'mutual_spark',
  FIRST_CONVERSATION_CREATED: 'first_conversation_created',
  FIRST_MESSAGE_SENT: 'first_message_sent',
  EMOTIONAL_FEEDBACK_SUBMITTED: 'emotional_feedback_submitted'
})

const dayKeyOf = (date = new Date()) => date.toISOString().slice(0, 10)

export const recordProductEventOnce = async ({ userId, eventType, metadata = null, dbClient }) => {
  if (!userId || !eventType) return
  const db = dbClient || await getDbClient()
  const existing = await db.productEvent.findFirst({ where: { userId, eventType }, select: { id: true } })
  if (existing) return
  await db.productEvent.create({ data: { userId, eventType, dayKey: dayKeyOf(), metadata } })
}

export const submitEmotionalFeedback = async ({ userId, tag, note, dbClient }) => {
  const db = dbClient || await getDbClient()
  const trimmed = typeof note === 'string' ? note.trim().slice(0, 280) : null
  await db.emotionalFeedback.create({ data: { userId, tag, note: trimmed || null } })
  await db.productEvent.create({ data: { userId, eventType: PRODUCT_EVENT_TYPE.EMOTIONAL_FEEDBACK_SUBMITTED, dayKey: dayKeyOf(), metadata: { tag } } })
  return { ok: true }
}
