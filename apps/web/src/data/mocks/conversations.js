import { clone } from './shared.js'
import { WINDOW_RHYTHMS, WINDOW_STATES } from '../../domain/window/index.js'
import { createCompatibilityProfile } from '../../domain/compatibility/index.js'

export const conversationStarters = [
  'What is something you wish more people understood about you?',
  'What kind of silence feels comfortable to you?',
  'When do you feel most present?'
]

const conversationTemplate = [
  { id: 'c1', name: 'Maya', mood: 'Soft curiosity', paused: false, windowState: WINDOW_STATES.OPEN, windowRhythm: WINDOW_RHYTHMS.GENTLE, emotionalSpaceLevel: 'steady', mutualParticipationReady: true, preview: 'I have been thinking about your question from yesterday.', messages: [
    { id: 'm1', sender: 'them', text: 'I appreciate how unrushed this space feels.' },
    { id: 'm1b', sender: 'system', type: 'layer_unlock', content: { title: 'You have come to know a little more about them.', subtitle: 'Something new is now visible.', ctaLabel: 'See a little more', ctaRoute: '/profiles/maja' }, text: 'A new layer is now visible.' },
    { id: 'm2', sender: 'me', text: 'Same. It helps me answer more honestly.' },
    { id: 'm3', sender: 'them', text: 'What kind of silence feels comfortable to you?' }
  ], compatibilityProfile: createCompatibilityProfile({ communicationPreference: 'reflective', emotionalPace: 'steady', conversationStyle: 'curious', valuesAlignment: ['care', 'honesty', 'growth'], socialEnergy: 'balanced', relationshipIntention: 'intentional_connection', emotionalSafetyPreference: 'gentle_clarity' }) },
  { id: 'c2', name: 'Noor', mood: 'Reflective', paused: true, windowState: WINDOW_STATES.PAUSED, windowRhythm: WINDOW_RHYTHMS.REFLECTIVE, emotionalSpaceLevel: 'tender', mutualParticipationReady: true, preview: 'Paused for reflection.', messages: [], compatibilityProfile: createCompatibilityProfile({ communicationPreference: 'reflective', emotionalPace: 'slow', conversationStyle: 'reflective', valuesAlignment: ['care', 'trust', 'family'], socialEnergy: 'calm', relationshipIntention: 'intentional_connection', emotionalSafetyPreference: 'paced_space' }) },
  { id: 'c3', name: 'Eli', mood: 'Gentle momentum', paused: false, windowState: WINDOW_STATES.OPENING, windowRhythm: WINDOW_RHYTHMS.NORMAL, emotionalSpaceLevel: 'steady', mutualParticipationReady: false, preview: 'I feel most present when I am walking without my phone.', messages: [
    { id: 'm31', sender: 'me', text: 'When do you feel most present?' },
    { id: 'm32', sender: 'them', text: 'I feel most present when I am walking without my phone.' }
  ], compatibilityProfile: createCompatibilityProfile({ communicationPreference: 'direct_kind', emotionalPace: 'steady', conversationStyle: 'curious', valuesAlignment: ['growth', 'adventure', 'care'], socialEnergy: 'balanced', relationshipIntention: 'exploring_connection', emotionalSafetyPreference: 'gentle_clarity' }) }
]

export const createConversationsMockData = () => clone(conversationTemplate)
