import http from 'node:http'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { getDbClient } from './db/client.js'
import { ensureLayerTrustRules } from './config/layer-trust-rules.js'

const app = createApp()

const boot = async () => {
  const db = await getDbClient()
  await ensureLayerTrustRules({ dbClient: db })
  http.createServer(app).listen(env.port, () => {
    console.log(`[lingr-api] listening on :${env.port}`)
  })
}

boot().catch((error) => {
  console.error('[lingr-api] failed to boot', error)
  process.exit(1)
})
