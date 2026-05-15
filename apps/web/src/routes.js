export const ROUTE_ACCESS = {
  PUBLIC: 'public',
  ONBOARDING: 'onboarding',
  APP: 'app',
  PROTECTED_FUTURE: 'protected-future'
}

export const ROUTES = [
  {
    path: '/',
    label: 'Home',
    access: ROUTE_ACCESS.PUBLIC,
    intent: 'public',
    showInPrimaryNav: false,
    title: 'Lingr',
    description: 'A slower way to meet, with presence and intention.'
  },
  {
    path: '/onboarding',
    label: 'Onboarding',
    eyebrow: 'Arrival with intention',
    title: 'Onboarding',
    description: 'A slower start that helps you enter Lingr with clarity and care.',
    access: ROUTE_ACCESS.ONBOARDING,
    intent: 'onboarding',
    showInPrimaryNav: true
  },
  {
    path: '/discovery',
    label: 'Discovery',
    eyebrow: 'Daily pacing',
    title: 'Discovery',
    description: 'Three thoughtful introductions, shared with care.',
    access: ROUTE_ACCESS.APP,
    intent: 'app',
    showInPrimaryNav: true
  },
  {
    path: '/conversations',
    label: 'Conversations',
    eyebrow: 'Intentional exchange',
    title: 'Conversations',
    description: 'Gentle prompts and space to respond with presence.',
    access: ROUTE_ACCESS.APP,
    intent: 'app',
    showInPrimaryNav: true
  },
  {
    path: '/profile',
    label: 'Profile',
    eyebrow: 'Depth over polish',
    title: 'Profile',
    description: 'A living portrait shaped by reflection and rhythm.',
    access: ROUTE_ACCESS.APP,
    intent: 'app',
    showInPrimaryNav: true
  }
]

export const APP_ROUTES = ROUTES.filter((route) => route.intent === 'app' || route.intent === 'onboarding')

export const APP_NAV_ITEMS = APP_ROUTES.filter((route) => route.showInPrimaryNav).map(({ label, path }) => ({ label, href: path }))

export const ROUTE_META = ROUTES.reduce((acc, route) => {
  acc[route.path] = route
  return acc
}, {})

export const APP_ROUTE_META = APP_ROUTES.reduce((acc, route) => {
  acc[route.path] = route
  return acc
}, {})
