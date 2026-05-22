'use client'

export default function GlobalError({ reset }) {
  return (
    <main className='shell shell--narrow'>
      <section className='panel stack-md' aria-live='polite'>
        <p className='eyebrow'>We can try again gently</p>
        <h1>Something felt out of step just now.</h1>
        <p className='text-muted'>
          Lingr is still here. Take a breath, then try once more.
        </p>
        <div className='action-row'>
          <button type='button' className='button button--primary' onClick={() => reset()}>
            Try again
          </button>
          <a className='button button--ghost' href='/'>
            Return home
          </a>
        </div>
      </section>
    </main>
  )
}
