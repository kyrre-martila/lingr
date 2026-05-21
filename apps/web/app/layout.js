import './globals.css'

export const metadata = { title: 'Lingr', description: 'A slower way to meet, with presence and intention.' }

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
