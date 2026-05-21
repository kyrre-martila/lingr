import Link from 'next/link'
import { APP_NAV_ITEMS } from '../../lib/routes'

export default function AppShell({ children }) {
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
