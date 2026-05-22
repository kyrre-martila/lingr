import Link from 'next/link'
import PageIntro from '../../components/ui/PageIntro'
import { ApiError, apiClient } from '../../lib/api-client'

export default async function ConversationsPage() {
  let conversations = []
  let error = ''

  try {
    conversations = await apiClient.listViewerConversations()
  } catch (requestError) {
    if (requestError instanceof ApiError && requestError.reasonCode === 'auth.requires_auth') {
      error = 'Please sign in to view conversations.'
    } else {
      error = 'Conversations are unavailable right now. Please try again a little later.'
    }
  }

  return (
    <PageIntro
      eyebrow='Conversations'
      title='Speak with presence'
      description='Normal-first chat with optional apps and emotional safety.'
    >
      {error ? (
        <div className='conversation-empty'>
          <h3>Unable to load conversations</h3>
          <p>{error}</p>
        </div>
      ) : null}

      {!error && conversations.length === 0 ? (
        <div className='conversation-empty'>
          <h3>No active conversations yet</h3>
          <p>When a Spark is accepted, conversations will appear here.</p>
        </div>
      ) : null}

      {!error && conversations.length > 0 ? (
        <ul className='conversation-list' aria-label='Conversations'>
          {conversations.map((conversation) => {
            const profile = conversation.visibleProfile?.profile || {}
            const title = profile.firstName || 'Conversation'
            const subtitle = profile.intro || (conversation.state === 'paused' ? 'Paused for reflection.' : 'Take your time.')

            return (
              <li key={conversation.conversationId}>
                <Link className='conversation-list__item' href={`/conversations/${conversation.conversationId}`}>
                  <p className='conversation-list__name'>{title}</p>
                  <p className='conversation-list__meta'>{conversation.state}</p>
                  <p className='conversation-list__preview'>{subtitle}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </PageIntro>
  )
}
