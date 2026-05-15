import { apiClient } from '../api/client.js'
import { toAsyncLoading } from '../api/envelope.js'

export const getDiscoverySnapshot = () => apiClient.callSync('discovery.get')
export const getDiscoveryLoadingState = (previousData) => toAsyncLoading(previousData)
