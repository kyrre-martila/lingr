import { createStore } from './create-store.js'
import { createConversationsMockData } from '../data/mocks/conversations.js'

const conversations = createConversationsMockData()

export const conversationState = createStore({ activeConversationId: conversations[0]?.id || '' })
