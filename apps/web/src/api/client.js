import { createMockTransport } from './mock-transport.js'
import { createHttpTransport } from './http-transport.js'
import { toAsyncError, toAsyncSuccess } from './envelope.js'

const isProductionLikeBuild = () => {
  const env = String(globalThis?.process?.env?.NODE_ENV || '').toLowerCase()
  const host = String(globalThis?.location?.hostname || '').toLowerCase()
  return env === 'production' || env === 'staging' || host.endsWith('.vercel.app') || host.endsWith('.netlify.app')
}

const shouldUseMockTransport = () => {
  if (isProductionLikeBuild()) return false
  return globalThis?.__LINGR_DEV_USE_MOCK__ === true
}

export const createDefaultTransport = () => {
  const mock = createMockTransport()
  const configuredBaseUrl = globalThis?.process?.env?.NEXT_PUBLIC_API_BASE_URL || globalThis?.__LINGR_API_BASE_URL || 'http://localhost:4000'
  const http = createHttpTransport({ baseUrl: configuredBaseUrl })

  return {
    requestSync: (input) => (shouldUseMockTransport() ? mock.requestSync(input) : http.requestSync(input)),
    request: async (input) => {
      if (shouldUseMockTransport()) return mock.request(input)
      return http.request(input)
    }
  }
}

export const createApiClient = (transport = createDefaultTransport()) => ({
  callSync: (operation, payload) => {
    const envelope = transport.requestSync({ operation, payload })
    return envelope.ok ? toAsyncSuccess(envelope) : toAsyncError(envelope)
  },
  call: async (operation, payload) => {
    const envelope = await transport.request({ operation, payload })
    return envelope.ok ? toAsyncSuccess(envelope) : toAsyncError(envelope)
  }
})

export const apiClient = createApiClient(createDefaultTransport())
