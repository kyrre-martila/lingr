import { createDiscoveryMockData } from './discovery.js'
import { createConversationsMockData } from './conversations.js'

const snapshot = {
  discovery: createDiscoveryMockData(),
  conversations: createConversationsMockData()
}

export const getDiscoveryMockSnapshot = () => snapshot.discovery
export const getConversationsMockSnapshot = () => snapshot.conversations
