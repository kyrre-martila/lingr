import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient } from '../src/api/client.js'
import { createSuccess, createFailure } from '../src/api/envelope.js'
import { DOMAIN_ERROR_KIND, REASON_CODES } from '../src/domain/contracts.js'

const toUiGlimps = (dto = {}) => ({
  glimpsId: dto.glimpsId || '',
  userId: dto.userId || '',
  reflection: dto.reflection || '',
  mood: dto.mood || '',
  prompt: dto.prompt || '',
  imageNote: dto.imageNote || '',
  privacy: dto.privacy || 'private',
  emotionalTone: dto.emotionalTone || 'soft',
  state: dto.state || 'draft',
  createdAt: dto.createdAt || new Date().toISOString(),
  updatedAt: dto.updatedAt || dto.createdAt || new Date().toISOString(),
  archivedAt: dto.archivedAt || null
})

test('glimps DTO mapping keeps client-safe fields only', async () => {
  const transport = {
    request: async () => createSuccess({ glimpsId: 'glp_1', userId: 'usr_1', reflection: 'Quiet breath', mood: 'grounded', _internalId: 'abc123' }),
    requestSync: () => createSuccess({})
  }
  const client = createApiClient(transport)
  const result = await client.call('glimps.create', {})
  const mapped = toUiGlimps(result.data)

  assert.equal(mapped.glimpsId, 'glp_1')
  assert.equal(mapped.userId, 'usr_1')
  assert.equal(mapped.reflection, 'Quiet breath')
  assert.equal(mapped._internalId, undefined)
})

test('glimps create error preserves retryable failures', async () => {
  const transport = {
    request: async () => createFailure({ code: REASON_CODES.ROUTE.UNKNOWN_ROUTE, message: 'offline', kind: DOMAIN_ERROR_KIND.DOMAIN, retryable: true }),
    requestSync: () => createSuccess({})
  }
  const client = createApiClient(transport)
  const result = await client.call('glimps.create', {})

  assert.equal(result.status, 'error')
  assert.equal(result.error.retryable, true)
})
