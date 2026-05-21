import Link from 'next/link'

export default function LandingPage(){
  return <section className='section hero'><div className='container hero__grid'><div><p className='eyebrow'>A softer way to meet</p><h1>Dating with emotional pacing, not urgency.</h1><p className='lead'>Lingr is designed for calm introductions, thoughtful conversation, and trust that unfolds naturally.</p><div className='hero__actions'><Link href='/login' className='button'>Continue to Lingr</Link><Link href='/onboarding' className='button button--ghost'>Start onboarding</Link></div></div><article className='hero-card'><p className='hero-card__label'>Today’s rhythm</p><p className='hero-card__text'>One introduction. A few warm prompts. No pressure loops.</p><p className='hero-card__meta'>Spark when it feels right.</p></article></div></section>
}
