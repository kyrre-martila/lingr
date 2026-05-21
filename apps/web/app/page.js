'use client'
import LegacyMount from '../components/LegacyMount'

export default function Page() {
  return <LegacyMount loadBuild={async () => (await import('../lib/legacy-builders')).buildLanding} />
}
