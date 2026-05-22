import PageIntro from '../../../components/ui/PageIntro'
import { ApiError, apiClient } from '../../../lib/api-client'

const formatMessageText = (message) => {
  if (message?.type === 'text') return message?.content?.text || ''
  if (message?.type === 'layer_unlock') return 'You have come to know a little more about each other.'
  if (message?.type === 'app_invite') return 'A chat app invite was shared.'
  if (message?.type === 'playing_now') return message?.content?.title ? `Shared: ${message.content.title}` : 'Shared a now-playing update.'
  return 'System message.'
}

export default async function ConversationIdPage({ params }) {
  const { conversationId } = await params

  let conversation = null
  let messages = []
  let error = ''

  try {
    const [conversationResponse, messagesResponse] = await Promise.all([
      apiClient.getConversationById({ conversationId }),
      apiClient.listConversationMessages({ conversationId, limit: 30 })
    ])

    conversation = conversationResponse
    messages = messagesResponse?.items || []
  } catch (requestError) {
    if (requestError instanceof ApiError && requestError.reasonCode === 'conversation.not_found') {
      error = 'This conversation is unavailable for your account right now.'
    } else if (requestError instanceof ApiError && requestError.reasonCode === 'auth.requires_auth') {
      error = 'Please sign in to view this conversation.'
    } else {
      error = 'This conversation is unavailable right now. Please try again a little later.'
    }
  }

  const profile = conversation?.visibleProfile?.profile || {}
  const name = profile.firstName || 'Conversation'

  return (
    <PageIntro
      eyebrow='Conversation'
      title={name}
      description='A focused chat layout with optional apps kept secondary to conversation.'
    >
      {error ? (
        <div className='conversation-empty'>
          <h3>Unable to load conversation</h3>
          <p>{error}</p>
        </div>
      ) : (
        <article className='conversation-shell__detail flow'>
          <p className='conversation-list__meta'>State: {conversation?.state || 'active'}</p>
          {messages.length === 0 ? (
            <div className='conversation-empty'>
              <h3>Take your time.</h3>
              <p>No messages yet.</p>
            </div>
          ) : (
            <ul className='conversation-list' aria-label='Conversation messages'>
              {messages.map((message) => (
                <li key={message.messageId} className='conversation-list__item'>
                  <p className='conversation-list__meta'>{message.senderUserId ? 'Member' : 'Lingr'}</p>
                  <p className='conversation-list__preview'>{formatMessageText(message)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}
    </PageIntro>
  )
}
