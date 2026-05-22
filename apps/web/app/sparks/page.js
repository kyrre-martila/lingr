import PageIntro from '../../components/ui/PageIntro'

const SPARK_COLUMNS = [
  {
    title: 'Incoming',
    description: 'People who sent a Spark your way appear here for thoughtful review.'
  },
  {
    title: 'Sent',
    description: 'Sparks you sent remain visible while waiting for a gentle response.'
  },
  {
    title: 'Mutual',
    description: 'When a Spark is mutual, it becomes ready for Layer 1 conversation.'
  }
]

export default function SparksPage() {
  return (
    <PageIntro
      eyebrow='Sparks'
      title='Shared momentum'
      description='A low-pressure overview of incoming, sent, and mutual Spark states.'
    >
      <div className='flow'>
        {SPARK_COLUMNS.map((column) => (
          <article className='card flow' key={column.title}>
            <h3>{column.title}</h3>
            <p>{column.description}</p>
          </article>
        ))}
      </div>
      <p className='onboarding-helper'>Placeholder data remains until Spark APIs are fully wired to this page.</p>
    </PageIntro>
  )
}
