export const APP_ROUTES = [
  {
    path: '/onboarding',
    label: 'Onboarding',
    eyebrow: 'Arrival with intention',
    title: 'Onboarding',
    description: 'A slower start that helps you enter Lingr with clarity and care.'
  },
  {
    path: '/discovery',
    label: 'Discovery',
    eyebrow: 'Daily pacing',
    title: 'Discovery',
    description: 'Three thoughtful introductions, shared with care.'
  },
  {
    path: '/conversations',
    label: 'Conversations',
    eyebrow: 'Intentional exchange',
    title: 'Conversations',
    description: 'Gentle prompts and space to respond with presence.'
  },
  {
    path: '/profile',
    label: 'Profile',
    eyebrow: 'Depth over polish',
    title: 'Profile',
    description: 'A living portrait shaped by reflection and rhythm.'
  }
]

export const APP_NAV_ITEMS = APP_ROUTES.map(({ label, path }) => ({ label, href: path }))

export const APP_ROUTE_META = APP_ROUTES.reduce((acc, route) => {
  acc[route.path] = route
  return acc
}, {})
