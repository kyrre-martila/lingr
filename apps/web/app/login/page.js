'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { apiClient } from '../../lib/api-client'

const initialForm = { email: '', password: '' }

export default function LoginPage() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ submitting: false, error: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus((prev) => ({ ...prev, submitting: true, error: '' }))

    try {
      const response = await apiClient.login({ email: form.email, password: form.password })
      const onboardingComplete = Boolean(response?.onboardingComplete)
      window.location.assign(onboardingComplete ? '/discovery' : '/onboarding')
    } catch {
      setStatus((prev) => ({ ...prev, submitting: false, error: 'We could not sign you in. Please verify your email and password.' }))
    }
  }

  return (
    <section className='login-screen' aria-labelledby='login-title'>
      <div className='login-screen__backdrop' aria-hidden='true' />
      <div className='login-screen__veil' aria-hidden='true' />
      <div className='login-screen__panel'>
        <Image src='/assets/logo/lingr-logo.svg' alt='Lingr' className='login-screen__logo' width={596} height={492} priority />
        <h1 id='login-title' className='login-screen__title'>Welcome back</h1>

        <form className='login-form' onSubmit={handleSubmit}>
          <label className='login-field'>
            <span className='login-field__label'>Email</span>
            <span className='login-field__control'>
              <span className='login-field__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' focusable='false'>
                  <path d='M4.75 6.75h14.5v10.5H4.75z' />
                  <path d='m5.25 7.25 6.75 5.5 6.75-5.5' />
                </svg>
              </span>
              <input name='email' type='email' autoComplete='email' placeholder='you@lingr.com' required value={form.email} onChange={handleChange} />
            </span>
          </label>

          <label className='login-field'>
            <span className='login-field__label'>Password</span>
            <span className='login-field__control'>
              <span className='login-field__icon' aria-hidden='true'>
                <svg viewBox='0 0 24 24' focusable='false'>
                  <path d='M7.25 10.75h9.5v7.5h-9.5z' />
                  <path d='M9.25 10.75V8.9a2.75 2.75 0 0 1 5.5 0v1.85' />
                  <path d='M12 14.05v1.85' />
                </svg>
              </span>
              <input name='password' type='password' autoComplete='current-password' placeholder='••••••••' required value={form.password} onChange={handleChange} />
            </span>
          </label>

          <a className='login-screen__forgot' href='mailto:support@lingr.app?subject=Lingr%20password%20reset'>Forgot password?</a>
          {status.error ? <p className='login-screen__error'>{status.error}</p> : null}

          <button className='login-screen__button' type='submit' disabled={status.submitting}>{status.submitting ? 'Entering Lingr…' : 'Enter Lingr'}</button>
        </form>

        <div className='login-screen__divider' aria-hidden='true'><span>♡</span></div>
        <p className='login-screen__signup'>New to Lingr? <Link href='/onboarding'>Create account <span aria-hidden='true'>›</span></Link></p>
      </div>
    </section>
  )
}
