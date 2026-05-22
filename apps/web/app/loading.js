export default function Loading() {
  return (
    <main className='shell shell--narrow'>
      <section className='panel stack-md' aria-live='polite' aria-busy='true'>
        <p className='eyebrow'>Taking a quiet moment</p>
        <h1>Setting things up…</h1>
        <p className='text-muted'>
          We are preparing your space with care.
        </p>
      </section>
    </main>
  )
}
