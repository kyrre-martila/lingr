const COMPATIBILITY_DIMENSIONS = {
  COMMUNICATION_PREFERENCE: 'communication_preference',
  EMOTIONAL_PACE: 'emotional_pace',
  CONVERSATION_STYLE: 'conversation_style',
  VALUES_ALIGNMENT: 'values_alignment',
  SOCIAL_ENERGY: 'social_energy',
  RELATIONSHIP_INTENTION: 'relationship_intention',
  EMOTIONAL_SAFETY: 'emotional_safety'
}

const SIGNAL_STATES = {
  RESONANT: 'resonant',
  FLEXIBLE: 'flexible',
  DIFFERENT: 'different',
  UNKNOWN: 'unknown'
}

const createCompatibilityProfile = ({
  communicationPreference = 'reflective',
  emotionalPace = 'steady',
  conversationStyle = 'curious',
  valuesAlignment = ['care', 'honesty'],
  socialEnergy = 'balanced',
  relationshipIntention = 'intentional_connection',
  emotionalSafetyPreference = 'gentle_clarity'
} = {}) => ({
  communicationPreference,
  emotionalPace,
  conversationStyle,
  valuesAlignment,
  socialEnergy,
  relationshipIntention,
  emotionalSafetyPreference
})

const compareField = (a, b) => {
  if (!a || !b) return SIGNAL_STATES.UNKNOWN
  if (a === b) return SIGNAL_STATES.RESONANT
  return SIGNAL_STATES.FLEXIBLE
}

const compareValuesAlignment = (mine = [], theirs = []) => {
  if (!mine.length || !theirs.length) return SIGNAL_STATES.UNKNOWN
  const overlap = mine.filter((value) => theirs.includes(value))
  if (overlap.length >= 2) return SIGNAL_STATES.RESONANT
  if (overlap.length === 1) return SIGNAL_STATES.FLEXIBLE
  return SIGNAL_STATES.DIFFERENT
}

export const createCompatibilitySignals = ({ me, other }) => {
  const myProfile = createCompatibilityProfile(me)
  const otherProfile = createCompatibilityProfile(other)

  return {
    communicationPreference: compareField(myProfile.communicationPreference, otherProfile.communicationPreference),
    emotionalPace: compareField(myProfile.emotionalPace, otherProfile.emotionalPace),
    conversationStyle: compareField(myProfile.conversationStyle, otherProfile.conversationStyle),
    valuesAlignment: compareValuesAlignment(myProfile.valuesAlignment, otherProfile.valuesAlignment),
    socialEnergy: compareField(myProfile.socialEnergy, otherProfile.socialEnergy),
    relationshipIntention: compareField(myProfile.relationshipIntention, otherProfile.relationshipIntention),
    emotionalSafety: compareField(myProfile.emotionalSafetyPreference, otherProfile.emotionalSafetyPreference)
  }
}

export const createConversationResonancePlaceholder = (signals) => ({
  tone: signals.conversationStyle,
  rhythm: signals.communicationPreference,
  note: signals.conversationStyle === SIGNAL_STATES.RESONANT
    ? 'You may appreciate similar conversation rhythms.'
    : 'Your conversation styles may complement each other with a little patience.'
})

export const createPacingFitPlaceholder = (signals) => ({
  paceFit: signals.emotionalPace,
  note: signals.emotionalPace === SIGNAL_STATES.RESONANT
    ? 'You might approach closeness at a similar pace.'
    : 'You may move at different emotional speeds, which can still work with clear check-ins.'
})

export const createEmotionalAlignmentHints = (signals) => {
  const hints = []

  if (signals.valuesAlignment !== SIGNAL_STATES.DIFFERENT) {
    hints.push('You both seem to value emotional openness and care in conversation.')
  }

  if (signals.emotionalSafety === SIGNAL_STATES.RESONANT) {
    hints.push('You appear to share similar emotional safety preferences.')
  } else if (signals.emotionalSafety === SIGNAL_STATES.FLEXIBLE) {
    hints.push('Naming boundaries early may help both of you feel emotionally safe.')
  }

  if (!hints.length) {
    hints.push('Stay curious about what helps each person feel understood.')
  }

  return hints
}

export const createReflectivePromptsFromCompatibility = (signals) => {
  const prompts = [
    'What helps you feel heard during a difficult conversation?',
    'How do you know when a conversation pace feels right for you?'
  ]

  if (signals.socialEnergy === SIGNAL_STATES.FLEXIBLE) {
    prompts.push('When do you prefer connection, and when do you prefer quiet?')
  }

  if (signals.relationshipIntention !== SIGNAL_STATES.RESONANT) {
    prompts.push('What does a meaningful connection look like to you right now?')
  }

  return prompts
}

export {
  COMPATIBILITY_DIMENSIONS,
  SIGNAL_STATES,
  createCompatibilityProfile
}
