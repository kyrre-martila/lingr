import { clone } from './shared.js'

const profileTemplate = {
  name: 'Noor', age: 31, pronouns: 'she/her', location: 'Brooklyn, NY', presenceNote: 'Usually notices small details before speaking.', joined: 'Layer 1 open',
  about: 'I feel most like myself in slow mornings, bookstores with old wooden floors, and conversations where silence is welcome too.',
  reflections: [
    { prompt: 'A belief I have changed my mind about', answer: 'I used to think certainty made me strong. Now I trust curiosity more than being right.' },
    { prompt: 'Something I am currently learning emotionally', answer: 'How to ask for reassurance clearly instead of pretending I do not need it.' },
    { prompt: 'What makes me feel close to someone', answer: 'When they remember a small thing I said and ask about it later.' }
  ],
  glimpses: [
    { title: 'Window light at 7:10', caption: 'Tea cooling beside an unread page.' },
    { title: 'Saturday market', caption: 'Bought pears and forgot my tote, again.' },
    { title: 'After rain walk', caption: 'Shoes damp, mind quieter.' }
  ],
  interests: ['Urban birdwatching', 'Essay podcasts', 'Ceramics nights', 'Cozy co-op games'],
  emotionalValues: ['Gentleness under stress', 'Repair after conflict', 'Mutual effort', 'Playfulness'],
  connectionIntention: 'Looking for a relationship that grows from honest friendship into committed partnership, at a pace that feels grounded for both people.',
  layers: [
    { level: 'Layer 1 · Presence', description: 'Shared from the beginning: rhythm, tone, and what daily life feels like.' },
    { level: 'Layer 2 · Stories', description: 'Opens with trust: meaningful memories and personal context.' },
    { level: 'Layer 3 · Inner world', description: 'Revealed gradually: tender fears, hopes, and deeper emotional patterns.' }
  ]
}

export const createProfileMockData = () => clone(profileTemplate)
