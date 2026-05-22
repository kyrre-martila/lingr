import Link from 'next/link'
export default function NotFound() {
  return (
    <main className='shell shell--narrow'>
      <section className='panel stack-md'>
        <p className='eyebrow'>This page stepped away</p>
        <h1>We couldn’t find that path.</h1>
        <p className='text-muted'>
          Let’s bring you back to a familiar place.
        </p>
        <div className='action-row'>
          <Link className='button button--primary' href='/'>
            Go to home
          </Link>
        </div>
      </section>
    </main>
  )
}
