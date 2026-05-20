import { apiClient } from '../api/client.js'

export const getDailyDiscovery = () => apiClient.call('discovery.get')
export const sendDiscoverySpark = ({ discoveredUserId }) => apiClient.call('discovery.spark', { discoveredUserId })
export const sendDiscoveryNotNow = ({ discoveredUserId }) => apiClient.call('discovery.not_now', { discoveredUserId })

export const sendEmotionalFeedback = ({ tag, note }) => apiClient.call('feedback.emotional', { tag, note })
