import { createMockTransport } from './mock-transport.js'
import { createHttpTransport } from './http-transport.js'
import { toAsyncError, toAsyncSuccess } from './envelope.js'

const preferHttpTransport = () => typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.hostname !== 'localhost-mock'
const shouldAllowMockFallback = () => Boolean(globalThis?.__LINGR_DEV_MOCK_FALLBACK__)
const getSessionToken = () => globalThis?.localStorage?.getItem('lingr.sessionToken') || null

export const createDefaultTransport = () => {
  const mock = createMockTransport()
  const http = createHttpTransport({ baseUrl: globalThis?.__LINGR_API_BASE_URL || 'http://localhost:3000', getSessionToken })

  return {
    requestSync: (input) => mock.requestSync(input),
    request: async (input) => {
      const isConversationOperation = String(input?.operation || '').startsWith('conversations.')
      if (!preferHttpTransport()) return mock.request(input)
      const envelope = await http.request(input)
      if (envelope.ok) return envelope
      if (isConversationOperation && shouldAllowMockFallback()) return mock.request(input)
      return envelope
    }
  }
}

export const createApiClient = (transport = createMockTransport()) => ({
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
