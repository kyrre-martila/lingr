export default function PageIntro({ eyebrow, title, description, children }) {
  return <section className='section'><div className='container flow'><p className='eyebrow'>{eyebrow}</p><h2>{title}</h2><p className='lead'>{description}</p>{children}</div></section>
}
