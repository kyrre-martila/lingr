'use client'

import Image from 'next/image'

export default function SplashScreen() {
  return (
    <section className='lingr-splash' aria-live='polite' aria-busy='true' role='status'>
      <div className='lingr-splash__bg' aria-hidden='true' />
      <div className='lingr-splash__veil' aria-hidden='true' />

      <div className='lingr-splash__content'>
        <Image src='/assets/logo/lingr-logo.svg' alt='Lingr' className='lingr-splash__logo' width={596} height={492} priority />
        <div className='lingr-splash__loading' aria-hidden='true'>
          <span className='lingr-splash__loading-glow' />
        </div>
        <p className='lingr-splash__tagline'>Some people are worth to lingr 💕</p>
      </div>
    </section>
  )
}
