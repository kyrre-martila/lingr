import { routes } from './routes/index.js'
import { errorHandler, notFound } from './http/errors.js'
import { withRequestContext } from './middleware/request-context.js'
import { assertJsonRequest } from './middleware/validate-json.js'
import { withAuthContext } from './auth/middleware.js'

export const createApp = () => async (req, res) => {
  try {
    withRequestContext(req)
    assertJsonRequest(req)
    await withAuthContext(req)

    const pathname = new URL(req.url, 'http://localhost').pathname
    const route = routes.find((entry) => entry.method === req.method && entry.path === pathname)

    if (!route) throw notFound(pathname)
    return await route.handler(req, res)
  } catch (error) {
    return errorHandler(error, req, res)
  }
}
