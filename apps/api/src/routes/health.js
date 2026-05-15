import { ok } from '../http/envelope.js'
import { checkDatabaseHealth } from '../db/health.js'
import { env } from '../config/env.js'

export const healthRoute = async (req, res) => {
  const database = env.databaseHealthcheckEnabled
    ? await checkDatabaseHealth()
    : { ok: true, status: 'skipped' }

  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok({
    service: 'lingr-api',
    status: 'ok',
    now: new Date().toISOString(),
    database
  }, { requestId: req.requestId })))
}
