'use client'
import Link from 'next/link'

export default function LoginPage() {
  return <main className='section'><div className='container onboarding-shell'><h2>Login</h2><p className='lead'>Use your Lingr account to continue.</p><form className='onboarding-card flow'><input className='onboarding-input' placeholder='Email' /><input className='onboarding-input' type='password' placeholder='Password' /><button className='button' type='button'>Sign in</button><p className='onboarding-helper'>Auth submission is API-driven in next integration layer.</p></form><p><Link href='/onboarding'>Need an account? Start onboarding</Link></p></div></main>
}
