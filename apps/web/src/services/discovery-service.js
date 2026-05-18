import { apiClient } from '../api/client.js'

export const getDailyDiscovery = () => apiClient.call('discovery.get')
export const sendSparkInvitation = ({ recipientUserId }) => apiClient.call('spark.create', { recipientUserId })
