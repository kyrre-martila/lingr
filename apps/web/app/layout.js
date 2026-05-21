import './globals.css'
import AppShell from '../components/layout/AppShell'

export const metadata = { title: 'Lingr', description: 'A slower way to meet, with presence and intention.' }

export default function RootLayout({ children }) {
  return <html lang='en'><body><AppShell>{children}</AppShell></body></html>
}
