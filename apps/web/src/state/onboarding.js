import { createStore } from './create-store.js'
import { createOnboardingInitialState } from '../data/mocks/onboarding.js'

export const onboardingState = createStore(createOnboardingInitialState())
