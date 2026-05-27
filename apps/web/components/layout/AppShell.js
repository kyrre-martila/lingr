'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { APP_NAV_ITEMS } from '../../lib/routes'
import SplashScreen from './SplashScreen'
import { apiClient } from '../../lib/api-client'

const SPLASH_SESSION_KEY = 'lingrSplashSeen'
const SPLASH_MIN_MS = 1700

export default function AppShell({ children }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const splashSeen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true'
    if (splashSeen) return

    let active = true
    const startTime = Date.now()
    setShowSplash(true)

    const finalizeSplash = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, SPLASH_MIN_MS - elapsed)
      window.setTimeout(() => {
        if (!active) return
        window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true')
        setShowSplash(false)
      }, remaining)
    }

    apiClient.getProfile().catch(() => null).finally(finalizeSplash)

    return () => {
      active = false
    }
  }, [])

  if (showSplash) return <SplashScreen />

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
