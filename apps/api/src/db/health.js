import { getDbClient } from './client.js'

export const checkDatabaseHealth = async ({ dbClient } = {}) => {
  try {
    const client = dbClient ?? await getDbClient()
    await client.$queryRaw`SELECT 1`

    return {
      ok: true,
      status: 'up'
    }
  } catch (error) {
    return {
      ok: false,
      status: 'down',
      reason: error instanceof Error ? error.message : 'unknown_database_error'
    }
  }
}
