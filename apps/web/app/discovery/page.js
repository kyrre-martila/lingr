'use client'
import LegacyMount from '../../components/LegacyMount'
export default function Page(){ return <main><LegacyMount loadBuild={async () => (await import('../../lib/legacy-builders')).createDiscoverySection} /></main> }
