import { SAFETY_SEVERITY } from '../contracts.js'

export const SAFETY_CHANNELS = Object.freeze({
  CONVERSATION: 'conversation',
  GLIMPS: 'glimps'
})

export const SAFETY_EVENT_CATEGORIES = Object.freeze({
  PACE_MISMATCH: 'pace_mismatch',
  BOUNDARY_SIGNAL: 'boundary_signal',
  UNRESOLVED_TENSION: 'unresolved_tension',
  SELF_HARM_SIGNAL: 'self_harm_signal',
  HARASSMENT_SIGNAL: 'harassment_signal'
})

export const classifySafetySeverity = ({ category } = {}) => {
  if ([SAFETY_EVENT_CATEGORIES.SELF_HARM_SIGNAL, SAFETY_EVENT_CATEGORIES.HARASSMENT_SIGNAL].includes(category)) {
    return SAFETY_SEVERITY.HIGH
  }

  if ([SAFETY_EVENT_CATEGORIES.BOUNDARY_SIGNAL, SAFETY_EVENT_CATEGORIES.UNRESOLVED_TENSION].includes(category)) {
    return SAFETY_SEVERITY.MEDIUM
  }

  return SAFETY_SEVERITY.LOW
}

export const createSafetyEvent = ({
  channel = SAFETY_CHANNELS.CONVERSATION,
  category,
  signal,
  detail = ''
} = {}) => ({
  channel,
  category,
  signal,
  detail,
  severity: classifySafetySeverity({ category })
})
