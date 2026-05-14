const profileData = {
  name: 'Noor',
  age: 31,
  pronouns: 'she/her',
  location: 'Brooklyn, NY',
  presenceNote: 'Usually notices small details before speaking.',
  joined: 'Layer 1 open',
  about:
    'I feel most like myself in slow mornings, bookstores with old wooden floors, and conversations where silence is welcome too.',
  reflections: [
    {
      prompt: 'A belief I have changed my mind about',
      answer: 'I used to think certainty made me strong. Now I trust curiosity more than being right.'
    },
    {
      prompt: 'Something I am currently learning emotionally',
      answer: 'How to ask for reassurance clearly instead of pretending I do not need it.'
    },
    {
      prompt: 'What makes me feel close to someone',
      answer: 'When they remember a small thing I said and ask about it later.'
    }
  ],
  glimpses: [
    { title: 'Window light at 7:10', caption: 'Tea cooling beside an unread page.' },
    { title: 'Saturday market', caption: 'Bought pears and forgot my tote, again.' },
    { title: 'After rain walk', caption: 'Shoes damp, mind quieter.' }
  ],
  interests: ['Urban birdwatching', 'Essay podcasts', 'Ceramics nights', 'Cozy co-op games'],
  emotionalValues: ['Gentleness under stress', 'Repair after conflict', 'Mutual effort', 'Playfulness'],
  connectionIntention:
    'Looking for a relationship that grows from honest friendship into committed partnership, at a pace that feels grounded for both people.',
  layers: [
    { level: 'Layer 1 · Presence', description: 'Shared from the beginning: rhythm, tone, and what daily life feels like.' },
    { level: 'Layer 2 · Stories', description: 'Opens with trust: meaningful memories and personal context.' },
    { level: 'Layer 3 · Inner world', description: 'Revealed gradually: tender fears, hopes, and deeper emotional patterns.' }
  ]
}

const createList = (items, className) => {
  const list = document.createElement('ul')
  list.className = className
  items.forEach(item => {
    const li = document.createElement('li')
    li.textContent = item
    list.append(li)
  })
  return list
}

export const createProfileExperienceSection = () => {
  const section = document.createElement('section')
  section.id = 'profile-experience'
  section.className = 'section section--paper'

  section.innerHTML = `
    <div class="container profile-shell flow">
      <p class="eyebrow">First profile experience</p>
      <h2>Discovering a person slowly.</h2>
      <p class="lead">Designed for reflection over reaction. Lingr profiles unfold in layers, inviting understanding before judgment.</p>

      <article class="profile-card" aria-label="Profile preview for ${profileData.name}">
        <header class="profile-header soft-panel">
          <div>
            <p class="profile-header__meta">${profileData.joined}</p>
            <h3>${profileData.name}, ${profileData.age}</h3>
            <p class="profile-header__detail">${profileData.pronouns} · ${profileData.location}</p>
          </div>
          <p class="profile-header__note">${profileData.presenceNote}</p>
        </header>

        <section class="profile-section soft-panel" aria-labelledby="about-title">
          <h4 id="about-title">About</h4>
          <p>${profileData.about}</p>
        </section>

        <section class="profile-section soft-panel" aria-labelledby="reflections-title">
          <h4 id="reflections-title">Reflection answers</h4>
          <div class="reflection-stack"></div>
        </section>

        <section class="profile-section soft-panel" aria-labelledby="glimpses-title">
          <h4 id="glimpses-title">Glimps gallery</h4>
          <div class="glimps-grid" role="list"></div>
        </section>

        <section class="profile-section soft-panel" aria-labelledby="interests-title">
          <h4 id="interests-title">Interests</h4>
          <div class="pill-wrap interests-wrap"></div>
        </section>

        <section class="profile-section soft-panel" aria-labelledby="values-title">
          <h4 id="values-title">Emotional values</h4>
          <div class="pill-wrap values-wrap"></div>
        </section>

        <section class="profile-section soft-panel" aria-labelledby="intention-title">
          <h4 id="intention-title">Connection intention</h4>
          <p>${profileData.connectionIntention}</p>
        </section>

        <section class="profile-section profile-layers soft-panel" aria-labelledby="layers-title">
          <h4 id="layers-title">Layers</h4>
          <p class="profile-layers__intro">Some parts are visible now. Deeper parts emerge with consistency and care.</p>
          <ol class="layer-track" aria-label="Relationship depth layers"></ol>
        </section>
      </article>
    </div>
  `

  const reflectionHost = section.querySelector('.reflection-stack')
  profileData.reflections.forEach(entry => {
    const item = document.createElement('article')
    item.className = 'reflection-item'
    item.innerHTML = `<p class="reflection-item__prompt">${entry.prompt}</p><p class="reflection-item__answer">${entry.answer}</p>`
    reflectionHost?.append(item)
  })

  const glimpsHost = section.querySelector('.glimps-grid')
  profileData.glimpses.forEach(glimpse => {
    const card = document.createElement('article')
    card.className = 'glimpse-card'
    card.setAttribute('role', 'listitem')
    card.innerHTML = `
      <div class="glimpse-card__image" aria-hidden="true">${glimpse.title}</div>
      <p class="glimpse-card__caption">${glimpse.caption}</p>
    `
    glimpsHost?.append(card)
  })

  section.querySelector('.interests-wrap')?.append(createList(profileData.interests, 'pill-list'))
  section.querySelector('.values-wrap')?.append(createList(profileData.emotionalValues, 'pill-list pill-list--warm'))

  const layerHost = section.querySelector('.layer-track')
  profileData.layers.forEach((layer, index) => {
    const li = document.createElement('li')
    li.className = 'layer-step'
    li.innerHTML = `
      <div class="layer-step__depth" aria-hidden="true">${index + 1}</div>
      <div>
        <p class="layer-step__label">${layer.level}</p>
        <p class="layer-step__description">${layer.description}</p>
      </div>
    `
    layerHost?.append(li)
  })

  return section
}
