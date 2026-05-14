export const createPageContainer = ({ className = '' } = {}) => {
  const container = document.createElement('div')
  container.className = `container app-page-container ${className}`.trim()
  return container
}

export const createPageSection = ({ title, eyebrow, description, sectionClass = '' } = {}) => {
  const section = document.createElement('section')
  section.className = `app-page-section flow ${sectionClass}`.trim()

  if (eyebrow || title || description) {
    const header = document.createElement('header')
    header.className = 'section-header'

    if (eyebrow) {
      const eyebrowNode = document.createElement('p')
      eyebrowNode.className = 'eyebrow'
      eyebrowNode.textContent = eyebrow
      header.append(eyebrowNode)
    }

    if (title) {
      const titleNode = document.createElement('h1')
      titleNode.className = 'app-page-title'
      titleNode.textContent = title
      header.append(titleNode)
    }

    if (description) {
      const descriptionNode = document.createElement('p')
      descriptionNode.className = 'lead'
      descriptionNode.textContent = description
      header.append(descriptionNode)
    }

    section.append(header)
  }

  return section
}
