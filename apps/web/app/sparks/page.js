'use client'
import LegacyMount from '../../components/LegacyMount'
export default function Page(){ return <main className='section section--paper'><div className='container'><p className='eyebrow'>Sparks & Glimps</p><LegacyMount loadBuild={async () => (await import('../../lib/legacy-builders')).createGlimpsCreationFlow} /></div></main> }
