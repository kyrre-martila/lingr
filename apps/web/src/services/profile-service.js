import { apiClient } from '../api/client.js'
import { toAsyncLoading } from '../api/envelope.js'

export const getProfileSnapshot = () => apiClient.callSync('profile.get')
export const getProfileLoadingState = (previousData) => toAsyncLoading(previousData)
