import { createMockTransport } from './mock-transport.js'
import { createHttpTransport } from './http-transport.js'
import { toAsyncError, toAsyncSuccess } from './envelope.js'

const preferHttpTransport = () => typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.hostname !== 'localhost-mock'

export const createDefaultTransport = () => {
  const mock = createMockTransport()
  const http = createHttpTransport({ baseUrl: globalThis?.__LINGR_API_BASE_URL || 'http://localhost:3000' })

  return {
    requestSync: (input) => mock.requestSync(input),
    request: async (input) => {
      const isConversationOperation = String(input?.operation || '').startsWith('conversations.')
      if (!isConversationOperation || !preferHttpTransport()) return mock.request(input)
      const envelope = await http.request(input)
      return envelope.ok ? envelope : mock.request(input)
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
