'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { APP_NAV_ITEMS } from '../../lib/routes'
import SplashScreen from './SplashScreen'
import { apiClient } from '../../lib/api-client'

const SPLASH_SESSION_KEY = 'lingrSplashSeen'
const SPLASH_MIN_MS = 4000
const AUTHED_HOME_ROUTE = '/discovery'
const ONBOARDING_ROUTE = '/onboarding'
const LOGIN_ROUTE = '/login'

const isAppRoute = (pathname) => pathname === '/'
  || pathname === ONBOARDING_ROUTE
  || pathname === AUTHED_HOME_ROUTE
  || pathname === '/sparks'
  || pathname === '/settings'
  || pathname === '/conversations'
  || pathname.startsWith('/conversations/')

const RESET_PASSWORD_ROUTE = '/reset-password'

const isPublicRoute = (pathname) => pathname === LOGIN_ROUTE
  || pathname === RESET_PASSWORD_ROUTE
  || pathname === ONBOARDING_ROUTE

export default function AppShell({ children }) {
  const [showSplash, setShowSplash] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let active = true
    const startTime = Date.now()
    const splashSeen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true'
    const shouldShowSplash = !splashSeen

    setCheckingSession(true)
    setShowSplash(shouldShowSplash)

    const finishSessionCheck = (nextPath) => {
      const finalize = () => {
        if (!active) return

        if (shouldShowSplash) {
          window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true')
          setShowSplash(false)
        }

        if (nextPath && pathname !== nextPath) {
          router.replace(nextPath)
          return
        }

        setCheckingSession(false)
      }

      if (!shouldShowSplash) {
        finalize()
        return
      }

      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, SPLASH_MIN_MS - elapsed)
      window.setTimeout(finalize, remaining)
    }

    const runAuthRouting = async () => {
      let nextPath = null

      try {
        await apiClient.getProfile()
        const completeness = await apiClient.getProfileCompleteness().catch(() => null)
        const onboardingComplete = completeness?.lifecycleState === 'active' || Number(completeness?.profileCompleteness || 0) >= 80

        if (onboardingComplete && (isPublicRoute(pathname) || pathname === '/' || pathname === ONBOARDING_ROUTE)) {
          nextPath = AUTHED_HOME_ROUTE
        }

        if (!onboardingComplete && (isPublicRoute(pathname) || (isAppRoute(pathname) && pathname !== ONBOARDING_ROUTE))) {
          nextPath = ONBOARDING_ROUTE
        }
      } catch {
        if (isAppRoute(pathname) && !isPublicRoute(pathname)) nextPath = LOGIN_ROUTE
      } finally {
        finishSessionCheck(nextPath)
      }
    }

    runAuthRouting()

    return () => {
      active = false
    }
  }, [pathname, router])

  if (showSplash) return <SplashScreen />
  if (checkingSession && (isAppRoute(pathname) || isPublicRoute(pathname))) return null
  if (isPublicRoute(pathname)) return <main id='main-content'>{children}</main>

  return (
    <>
      <a className='skip-link' href='#main-content'>Skip to content</a>
      <header className='site-header'>
        <div className='container site-nav'>
          <Link href='/' className='brand'>Lingr</Link>
          <nav className='nav-desktop' aria-label='Primary'>
            <ul>{APP_NAV_ITEMS.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
          </nav>
        </div>
      </header>
      <main id='main-content'>{children}</main>
      <footer className='site-footer'><div className='container site-footer__inner'><p className='site-footer__copy'>Lingr — slow dating, intentionally human.</p></div></footer>
    </>
  )
}
