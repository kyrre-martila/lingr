import { createMockTransport } from './mock-transport.js'
import { toAsyncError, toAsyncSuccess } from './envelope.js'

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

export const apiClient = createApiClient()
