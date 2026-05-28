'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Password reset is not available yet.')
  }

  return (
    <section className='login-screen' aria-labelledby='reset-password-title'>
      <div className='login-screen__backdrop' aria-hidden='true' />
      <div className='login-screen__veil' aria-hidden='true' />
      <div className='login-screen__panel'>
        <Image src='/assets/logo/lingr-logo.svg' alt='Lingr' className='login-screen__logo' width={596} height={492} priority />
        <h1 id='reset-password-title' className='login-screen__title'>Reset password</h1>

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
              <input name='email' type='email' autoComplete='email' placeholder='you@lingr.com' required value={email} onChange={(event) => setEmail(event.target.value)} />
            </span>
          </label>

          {message ? <p className='login-screen__error'>{message}</p> : null}
          <button className='login-screen__button' type='submit'>Send reset link</button>
        </form>

        <div className='login-screen__divider' aria-hidden='true'><span>♡</span></div>
        <p className='login-screen__signup'><Link href='/login'>Back to login</Link></p>
      </div>
    </section>
  )
}
