import { conversationStarters, createConversationsMockData } from '../data/mocks/conversations.js'

const conversationsSnapshot = createConversationsMockData()

export const getConversationsSnapshot = () => conversationsSnapshot
export const getConversationStarters = () => conversationStarters
