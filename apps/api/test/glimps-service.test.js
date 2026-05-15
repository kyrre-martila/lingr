import test from 'node:test'
import assert from 'node:assert/strict'
import { archiveViewerGlimps, createGlimps } from '../src/services/glimps-service.js'
import { createAnonymousViewer, createAuthenticatedViewer } from '../src/auth/viewer.js'
import { REASON_CODES } from '../../../packages/shared/src/contracts.js'

const viewer = createAuthenticatedViewer({ userId: 'user_1' })

test('anonymous viewer cannot create glimps', async () => {
  await assert.rejects(
    createGlimps({ viewer: createAnonymousViewer(), payload: {} }),
    (error) => error.reasonCode === REASON_CODES.AUTH.REQUIRES_AUTH
  )
})

test('create glimps validates enum values', async () => {
  const db = { glimps: { create: async () => ({}) } }
  await assert.rejects(
    createGlimps({ viewer, dbClient: db, payload: { reflection: 'a', mood: 'b', privacy: 'bad', emotionalTone: 'soft', state: 'draft' } }),
    (error) => error.reasonCode === REASON_CODES.VALIDATION.INVALID_PAYLOAD
  )
})

test('archive glimps is idempotent when already archived', async () => {
  const now = new Date()
  const db = {
    glimps: {
      findFirst: async () => ({ id: 'g1', userId: 'user_1', reflection: 'x', mood: 'y', prompt: null, imageNote: null, privacy: 'private', emotionalTone: 'soft', state: 'archived', createdAt: now, updatedAt: now, archivedAt: now }),
      update: async () => {
        throw new Error('should not update already archived glimps')
      }
    }
  }
  const result = await archiveViewerGlimps({ viewer, glimpsId: 'glp_g1', dbClient: db })
  assert.equal(result.state, 'archived')
  assert.equal(result.glimpsId, 'glp_g1')
})

test('archive returns not found with shared reason code', async () => {
  const db = { glimps: { findFirst: async () => null } }
  await assert.rejects(
    archiveViewerGlimps({ viewer, glimpsId: 'glp_missing', dbClient: db }),
    (error) => error.reasonCode === REASON_CODES.GLIMPS.NOT_FOUND
  )
})
