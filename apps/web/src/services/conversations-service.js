import { apiClient } from '../api/client.js'
import { toAsyncLoading } from '../api/envelope.js'

export const getConversationsSnapshot = () => apiClient.callSync('conversations.list')
export const getConversationStarters = () => apiClient.callSync('conversations.starters')
export const getConversationsLoadingState = (previousData) => toAsyncLoading(previousData)
