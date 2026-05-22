import PageIntro from '../../../components/ui/PageIntro'

const APPS_MENU_ITEMS = ['Match Cards', 'Guess Me', 'Snuggle', 'Playing now']

export default async function ConversationIdPage({ params }) {
  const { conversationId } = await params

  return (
    <PageIntro
      eyebrow='Conversation'
      title='Conversation space'
      description='A focused chat layout with optional apps kept secondary to conversation.'
    >
      <div className='conversation-shell__detail flow'>
        <p>Conversation ID: {conversationId}</p>
        <h3>Composer menu baseline</h3>
        <ul>
          {APPS_MENU_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className='onboarding-helper'>
          Placeholder shell: live message stream, trust-aware layer events, and safety actions will hydrate from API contracts.
        </p>
      </div>
    </PageIntro>
  )
}
