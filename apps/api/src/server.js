import http from 'node:http'
import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

http.createServer(app).listen(env.port, () => {
  console.log(`[lingr-api] listening on :${env.port}`)
})
