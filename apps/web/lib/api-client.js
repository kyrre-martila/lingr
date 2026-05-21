const DEFAULT_LOCAL_API_BASE = 'http://localhost:4000'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE

export class ApiError extends Error {
  constructor(message, { status, reasonCode, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.reasonCode = reasonCode || 'unknown'
    this.details = details
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const reasonCode = payload?.error?.reasonCode || payload?.reasonCode || 'unknown'
    throw new ApiError(`Request failed: ${path}`, { status: response.status, reasonCode, details: payload })
  }

  return payload
}

export const apiClient = {
  getProfile: () => apiRequest('/v1/profile/me'),
  getDiscovery: () => apiRequest('/v1/discovery/next'),
  getConversations: () => apiRequest('/v1/conversation/list')
}
