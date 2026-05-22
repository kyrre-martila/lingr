import PageIntro from '../../components/ui/PageIntro'

const SETTINGS_AREAS = [
  'Profile details and visibility preferences',
  'Safety tools: block, report, and pause controls',
  'Session access and account lifecycle actions'
]

export default function SettingsPage() {
  return (
    <PageIntro
      eyebrow='Settings'
      title='Safety and profile settings'
      description='Manage your boundaries, profile preferences, and account access in one place.'
    >
      <div className='card flow'>
        <h3>Settings areas</h3>
        <ul>
          {SETTINGS_AREAS.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
      <p className='onboarding-helper'>Placeholder sections will be replaced with full settings forms in a dedicated run.</p>
    </PageIntro>
  )
}
