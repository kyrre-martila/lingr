/**
 * Spark domain
 *
 * A Spark is an intentional connection signal between two users.
 * This is a representation contract only (no matching logic yet).
 */

export const createSpark = ({ userAId, userBId, createdAt = new Date().toISOString(), status = 'pending' }) => ({
  id: `spark-${userAId}-${userBId}`,
  pair: [userAId, userBId],
  createdAt,
  status
})
