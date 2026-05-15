import { routes } from './routes/index.js'
import { errorHandler, notFound } from './http/errors.js'
import { withRequestContext } from './middleware/request-context.js'
import { assertJsonRequest } from './middleware/validate-json.js'
import { withAuthContext } from './auth/middleware.js'
import { parseJsonBody } from './middleware/parse-json.js'

export const createApp = () => async (req, res) => {
  try {
    withRequestContext(req)
    await withAuthContext(req)

    const pathname = new URL(req.url, 'http://localhost').pathname
    const route = routes.find((entry) => {
      if (entry.method !== req.method) return false
      if (!entry.path.includes(':')) return entry.path === pathname
      const routeParts = entry.path.split('/').filter(Boolean)
      const pathParts = pathname.split('/').filter(Boolean)
      if (routeParts.length !== pathParts.length) return false
      const params = {}
      for (let i = 0; i < routeParts.length; i += 1) {
        const rp = routeParts[i]
        const pp = pathParts[i]
        if (rp.startsWith(':')) params[rp.slice(1)] = pp
        else if (rp !== pp) return false
      }
      req.params = params
      return true
    })

    if (!route) throw notFound(pathname)
    if (route.requiresJson !== false) {
      assertJsonRequest(req)
    }
    req.body = await parseJsonBody(req)
    return await route.handler(req, res)
  } catch (error) {
    return errorHandler(error, req, res)
  }
}
