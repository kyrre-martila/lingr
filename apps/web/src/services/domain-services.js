import { apiClient } from '../api/client.js'

export const getGlimpsDraft = () => apiClient.callSync('glimps.draft')
export const getSparkSnapshot = () => apiClient.callSync('spark.list')
export const getWindowSnapshot = () => apiClient.callSync('window.get')
export const getCompatibilitySnapshot = () => apiClient.callSync('compatibility.get')
export const getSafetySnapshot = () => apiClient.callSync('safety.get')
