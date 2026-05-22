import PageIntro from '../../components/ui/PageIntro'
import OnboardingForm from './OnboardingForm'

export default function OnboardingPage() {
  return (
    <PageIntro
      eyebrow='Arrival with intention'
      title='Onboarding'
      description='Set up your profile foundation with a warm, low-pressure flow.'
    >
      <OnboardingForm />
    </PageIntro>
  )
}
