import { healthRoute } from './health.js'

export const routes = Object.freeze([
  { method: 'GET', path: '/health', handler: healthRoute },
  { method: 'GET', path: '/status', handler: healthRoute }
])
