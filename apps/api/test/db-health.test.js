import test from 'node:test'
import assert from 'node:assert/strict'
import { checkDatabaseHealth } from '../src/db/health.js'

test('database health is up when db client supports $queryRaw', async () => {
  let queried = false
  const dbClient = {
    $queryRaw: async () => {
      queried = true
      return [{ '?column?': 1 }]
    }
  }

  const result = await checkDatabaseHealth({ dbClient })

  assert.equal(result.ok, true)
  assert.equal(result.status, 'up')
  assert.equal(queried, true)
})

test('database health is down when db client does not support $queryRaw', async () => {
  const dbClient = {}
  const result = await checkDatabaseHealth({ dbClient })

  assert.equal(result.ok, false)
  assert.equal(result.status, 'down')
  assert.match(result.reason, /queryRaw/i)
})
