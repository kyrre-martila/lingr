import { createNavigation } from './navigation.js'
import { createFooter } from './footer.js'
import { createPageContainer } from './layout.js'
import { APP_NAV_ITEMS } from '../routes.js'

export const createAppShell = ({ activePath, pageBuilder }) => {
  const fragment = document.createDocumentFragment()

  const header = document.createElement('header')
  header.className = 'site-header app-shell-header'
  const headerContainer = createPageContainer({ className: 'app-shell-header__inner' })
  headerContainer.append(
    createNavigation({
      items: APP_NAV_ITEMS,
      brandHref: '/discovery',
      brandLabel: 'Lingr app home',
      isRouteActive: (href) => href === activePath,
      onNavigate: (href) => {
        window.history.pushState({}, '', href)
        window.dispatchEvent(new Event('popstate'))
      }
    })
  )

  header.append(headerContainer)

  const main = document.createElement('main')
  main.id = 'main-content'
  main.className = 'app-main'

  const pageContainer = createPageContainer()
  const pageContent = pageBuilder()
  pageContainer.append(pageContent)
  main.append(pageContainer)

  const footerHost = document.createElement('div')
  footerHost.append(createFooter())

  fragment.append(header, main, footerHost)
  return fragment
}
