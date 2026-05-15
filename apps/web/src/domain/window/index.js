/**
 * Conversation Window domain
 *
 * A Window represents an intentional conversation span between two users.
 * This is a state representation, not transport or storage.
 */

export const createConversationWindow = ({ id, userIds = [], opensAt = null, closesAt = null, status = 'open' }) => ({
  id,
  userIds,
  opensAt,
  closesAt,
  status
})
