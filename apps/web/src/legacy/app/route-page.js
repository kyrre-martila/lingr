import { APP_ROUTE_META } from '../../routes.js'
import { createPageSection } from '../../components/layout.js'
import { getRouteSessionGuardHint } from '../../state/session.js'

export const createRoutePage = (path, contentBuilder) => {
  const meta = APP_ROUTE_META[path]
  const page = createPageSection({ eyebrow: meta.eyebrow, title: meta.title, description: meta.description })
  const guardHint = getRouteSessionGuardHint(path)

  if (guardHint.shouldGateInFuture) {
    const note = document.createElement('p')
    note.className = 'status-notice'
    note.textContent = `Prototype note: this route is ${guardHint.intent}-intent (${guardHint.access}) and currently stays open. Future auth guards will prioritize ${guardHint.expectedStates.join(' or ')} session states.`
    page.prepend(note)
  }

  page.append(contentBuilder())
  return page
}
