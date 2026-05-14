export const createStepFlowController = ({
  form,
  stepHost,
  title,
  subtitle,
  progress,
  backBtn,
  nextBtn,
  errorEl,
  steps,
  persist,
  validateStep,
  renderStep,
  getNextLabel,
  onComplete,
  onStepChange
}) => {
  let stepIndex = 0
  let lastActiveElement = null

  const clearError = () => {
    errorEl.hidden = true
    errorEl.textContent = ''
  }

  const announceError = (message) => {
    errorEl.hidden = false
    errorEl.textContent = message
  }

  const focusFirstInput = () => {
    const target = stepHost.querySelector('input, textarea, select, button, [tabindex]:not([tabindex="-1"])')
    target?.focus()
  }

  const render = () => {
    const step = steps[stepIndex]
    title.textContent = step.title
    subtitle.textContent = step.description
    progress.textContent = `Step ${stepIndex + 1} of ${steps.length}`
    backBtn.disabled = stepIndex === 0
    nextBtn.textContent = getNextLabel(stepIndex, steps.length)
    clearError()

    stepHost.classList.remove('is-visible')
    stepHost.innerHTML = ''
    const rendered = renderStep(step, stepIndex)
    if (typeof rendered === 'string') stepHost.innerHTML = rendered
    else if (rendered?.wrapper) stepHost.append(rendered.wrapper)
    else stepHost.append(rendered)

    requestAnimationFrame(() => {
      stepHost.classList.add('is-visible')
      focusFirstInput()
      onStepChange?.(step, stepIndex)
    })
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    persist()
    const current = steps[stepIndex]
    const error = validateStep(current.id)
    if (error) return announceError(error)

    if (stepIndex < steps.length - 1) {
      stepIndex += 1
      render()
      return
    }

    onComplete?.({ reset: () => { stepIndex = 0; render() }, announceError, clearError })
  })

  backBtn.addEventListener('click', () => {
    persist()
    if (stepIndex > 0) {
      stepIndex -= 1
      render()
    }
  })

  return { render, captureActiveElement: () => { lastActiveElement = document.activeElement }, restoreFocus: () => lastActiveElement?.focus?.() }
}
