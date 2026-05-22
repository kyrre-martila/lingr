import PageIntro from '../../components/ui/PageIntro'
import { apiClient, ApiError } from '../../lib/api-client'

const EMPTY_REASON_COPY = {
  'discovery.no_available_people': 'No new introductions right now. A quieter day can still be a good day.',
  'discovery.daily_limit_reached': 'That is enough for today. Let it settle.',
  'discovery.unavailable_region': 'Discovery opens once your region is active.',
  'discovery.onboarding_required': 'Finish onboarding to begin discovery.',
  'discovery.profile_incomplete': 'Complete your profile to begin discovery.'
}

const DEFAULT_EMPTY_COPY = 'No new introductions right now. Please check back later.'
const ERROR_COPY = 'Discovery is taking a quiet pause. Please try again shortly.'

export default async function DiscoveryPage() {
  let discovery = null
  let loadError = null

  try {
    discovery = await apiClient.getDiscoveryDaily()
  } catch (error) {
    loadError = error
  }

  const introductions = discovery?.introductions || []
  const firstIntro = introductions[0] || null
  const glimpses = firstIntro?.glimpses || []
  const reasonCode = discovery?.reasonCode || (loadError instanceof ApiError ? loadError.reasonCode : null)
  const emptyMessage = EMPTY_REASON_COPY[reasonCode] || DEFAULT_EMPTY_COPY

  return (
    <PageIntro
      eyebrow='Discovery'
      title='Introductions, one at a time'
      description='A calm introduction space shaped around Glimps and intentional pacing.'
    >
      {loadError ? (
        <div className='conversation-empty'>
          <h3>Discovery is unavailable</h3>
          <p>{ERROR_COPY}</p>
        </div>
      ) : firstIntro ? (
        <article className='card flow'>
          <h3>Today’s introduction</h3>
          <ul>
            {glimpses.map((glimpse) => (
              <li key={glimpse.glimpsId}>{glimpse.reflection}</li>
            ))}
          </ul>
          <p className='onboarding-helper'>Primary actions remain gentle: Spark or Not now.</p>
        </article>
      ) : (
        <div className='conversation-empty'>
          <h3>If there are no new introductions</h3>
          <p>{emptyMessage}</p>
        </div>
      )}
    </PageIntro>
  )
}
