/**
 * Layers domain
 *
 * Layers represent progressive emotional visibility over time.
 * This placeholder function returns a coarse reveal state for now.
 */

/**
 * @param {object} input
 * @param {number} input.totalLayers
 * @param {number} input.revealedLayers
 */
export const calculateLayerRevealState = ({ totalLayers = 5, revealedLayers = 0 } = {}) => {
  const safeTotal = Math.max(totalLayers, 1)
  const safeRevealed = Math.min(Math.max(revealedLayers, 0), safeTotal)
  const ratio = safeRevealed / safeTotal

  return {
    totalLayers: safeTotal,
    revealedLayers: safeRevealed,
    hiddenLayers: safeTotal - safeRevealed,
    revealRatio: ratio,
    stage: ratio >= 1 ? 'fully_revealed' : ratio >= 0.5 ? 'deepening' : 'early'
  }
}
