export const createField = ({
  id,
  label,
  type = 'text',
  value = '',
  placeholder = '',
  required = false,
  min,
  max,
  helper,
  multiline = false,
  rows = 4
}) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'onboarding-field flow'

  const labelEl = document.createElement('label')
  labelEl.className = 'onboarding-label'
  labelEl.htmlFor = id
  labelEl.textContent = label

  const input = multiline ? document.createElement('textarea') : document.createElement('input')
  input.className = 'onboarding-input'
  input.id = id
  input.name = id
  if (!multiline) input.type = type
  input.placeholder = placeholder
  input.value = value
  input.required = required
  if (typeof min !== 'undefined') input.min = String(min)
  if (typeof max !== 'undefined') input.max = String(max)
  if (multiline) input.rows = rows

  wrapper.append(labelEl, input)

  if (helper) {
    const helperEl = document.createElement('p')
    helperEl.className = 'onboarding-helper'
    helperEl.textContent = helper
    wrapper.append(helperEl)
  }

  return { wrapper, input }
}

export const createIntentionsField = ({ selected, options }) => {
  const wrapper = document.createElement('fieldset')
  wrapper.className = 'onboarding-field onboarding-options flow'

  const legend = document.createElement('legend')
  legend.className = 'onboarding-label'
  legend.textContent = 'Choose one intention'
  wrapper.append(legend)

  const list = document.createElement('div')
  list.className = 'onboarding-options__list'

  options.forEach((option) => {
    const label = document.createElement('label')
    label.className = 'onboarding-option'

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'relationshipIntention'
    input.value = option
    input.checked = selected === option

    const text = document.createElement('span')
    text.textContent = option

    label.append(input, text)
    list.append(label)
  })

  wrapper.append(list)
  return wrapper
}
