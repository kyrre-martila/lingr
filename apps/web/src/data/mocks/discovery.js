import { clone, createSessionLabel } from './shared.js'

const discoveryTemplate = {
  session: { weekday: 'Thursday', paceLabel: 'pace', remainingIntroductions: 2, totalIntroductions: 3 },
  cards: [
    {
      id: 'arden', name: 'Arden', age: 30, location: 'Queens, NY', intention: 'Wants to build a slow and steady relationship with lots of check-ins.', compatibilityHint: 'Both of you value repair after conflict and quiet mornings.', emotionalRhythm: 'Reflective and grounded',
      glimps: { title: 'Late-night kitchen ritual', caption: 'Homemade soup, soft music, and a call with my sister.' },
      reflection: { prompt: 'A way I feel cared for', answer: 'When someone notices my energy and asks what I need before I ask.' }
    },
    {
      id: 'lena', name: 'Lena', age: 33, location: 'Jersey City, NJ', intention: 'Hoping for emotional consistency and shared curiosity over time.', compatibilityHint: 'You both enjoy gentle structure and intentional communication.', emotionalRhythm: 'Warm with thoughtful pauses',
      glimps: { title: 'Sunday sketchbook hour', caption: 'I draw strangers at the cafe and imagine their stories.' },
      reflection: { prompt: 'Something I am practicing', answer: 'Saying how I feel in the moment instead of making it smaller.' }
    }
  ],
  recommended: [
    { name: 'Milo', reason: 'Shared desire for calm routines and clear emotional boundaries.' },
    { name: 'Sana', reason: 'Mutual interest in reflective prompts and patient pacing.' }
  ]
}

export const createDiscoveryMockData = () => {
  const data = clone(discoveryTemplate)
  return { ...data, dateLabel: createSessionLabel(data.session) }
}
