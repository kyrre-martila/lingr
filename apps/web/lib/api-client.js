const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return { status: 'error', error: data?.error || { reasonCode: 'unknown', kind: 'domain' } }
  }
  return data
}
