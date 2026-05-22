import PageIntro from '../../components/ui/PageIntro'

const DEMO_GLIMPS = [
  'Feels most at home near quiet water and long walks.',
  'Values gentle communication and steady follow-through.',
  'Enjoys low-key evenings, warm tea, and shared playlists.'
]

export default function DiscoveryPage() {
  return (
    <PageIntro
      eyebrow='Discovery'
      title='Introductions, one at a time'
      description='A calm introduction space shaped around Glimps and intentional pacing.'
    >
      <article className='card flow'>
        <h3>Today’s introduction</h3>
        <ul>
          {DEMO_GLIMPS.map((glimps) => (
            <li key={glimps}>{glimps}</li>
          ))}
        </ul>
        <p className='onboarding-helper'>Primary actions remain gentle: Spark or Not now.</p>
      </article>
      <div className='conversation-empty'>
        <h3>If there are no new introductions</h3>
        <p>You will see a warm empty state here with a soft invitation to return later.</p>
      </div>
    </PageIntro>
  )
}
