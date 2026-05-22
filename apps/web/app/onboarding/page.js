import PageIntro from '../../components/ui/PageIntro'

const ONBOARDING_STEPS = [
  'Share what you are hoping to find, in your own words.',
  'Set a gentle pace that feels respectful and comfortable.',
  'Choose profile details you are ready to reveal first.'
]

export default function OnboardingPage() {
  return (
    <PageIntro
      eyebrow='Arrival with intention'
      title='Onboarding'
      description='Set up your profile foundation with a warm, low-pressure flow.'
    >
      <div className='onboarding-card flow'>
        <h3>What this step includes</h3>
        <ul>
          {ONBOARDING_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <p className='onboarding-helper'>
          Placeholder flow: profile persistence, visibility controls, and region checks will connect to API in a later run.
        </p>
      </div>
    </PageIntro>
  )
}
