import { apiClient } from '../api/client.js'
import { toAsyncLoading } from '../api/envelope.js'

export const getConversationsLoadingState = (previousData) => toAsyncLoading(previousData)

export const listViewerConversations = () => apiClient.call('conversations.viewer.list')
export const listConversationMessages = ({ conversationId }) => apiClient.call('conversations.messages.list', { conversationId })
export const sendConversationMessage = ({ conversationId, text }) => apiClient.call('conversations.messages.send', { conversationId, text })
export const sendConversationPayloadMessage = ({ conversationId, type, content, metadata }) => apiClient.call('conversations.messages.send', { conversationId, type, content, metadata })
export const getConversationStarters = () => apiClient.callSync('conversations.starters')
