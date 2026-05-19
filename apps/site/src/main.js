import { en } from './i18n/en.js'
import { nbNO } from './i18n/nb-NO.js'

const API_BASE = 'https://api.lingr.dating'
const packs = { en, 'nb-NO': nbNO }

const state = { locale: 'en', countries: [], regions: [], selectedCountry: '', selectedRegion: '', regionStatus: '', canContinueInApp: false }

const t = (key) => key.split('.').reduce((o, k) => o?.[k], packs[state.locale]) || key

const render = () => {
  document.documentElement.lang = state.locale
  document.getElementById('main-content').innerHTML = `
    <div class="shell">
      <header class="topbar">
        <p class="brand">Lingr</p>
        <label>${t('common.localeLabel')}
          <select id="locale-select" aria-label="${t('common.localeLabel')}">
            <option value="en" ${state.locale === 'en' ? 'selected' : ''}>English</option>
            <option value="nb-NO" ${state.locale === 'nb-NO' ? 'selected' : ''}>Norsk bokmål</option>
          </select>
        </label>
      </header>
      <section class="hero">
        <h1>${t('hero.title')}</h1><p>${t('hero.body')}</p>
        <a class="button" href="#waitlist">${t('common.chooseRegion')}</a>
      </section>
      <section><h2>${t('what.title')}</h2><p>${t('what.body')}</p></section>
      <section><h2>${t('how.title')}</h2><ol>${t('how.steps').map((s) => `<li>${s}</li>`).join('')}</ol></section>
      <section><h2>${t('rollout.title')}</h2><p>${t('rollout.body')}</p></section>
      <section id="waitlist"><h2>${t('waitlist.title')}</h2><p>${t('waitlist.helper')}</p>
        <form id="waitlist-form">
          <label>${t('waitlist.country')}<select id="country" required><option value="">${t('waitlist.chooseCountry')}</option>${state.countries.map((c) => `<option value="${c.isoCode}" ${state.selectedCountry === c.isoCode ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
          <label>${t('waitlist.region')}<select id="region" required ${state.selectedCountry ? '' : 'disabled'}><option value="">${state.selectedCountry ? t('waitlist.chooseRegion') : t('waitlist.loading')}</option>${state.regions.map((r) => `<option value="${r.slug}" ${state.selectedRegion === r.slug ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label>
          <label>${t('waitlist.firstName')}<input id="firstName" type="text" maxlength="120" /></label>
          <label>${t('waitlist.email')}<input id="email" type="email" required autocomplete="email" /></label>
          <button class="button" type="submit">${t('waitlist.submit')}</button>
        </form>
        <p id="region-status" aria-live="polite">${state.regionStatus}</p>
        ${state.canContinueInApp ? `<p><a class="button" href="https://app.lingr.dating/onboarding?countryCode=${encodeURIComponent(state.selectedCountry)}&regionSlug=${encodeURIComponent(state.selectedRegion)}&locale=${encodeURIComponent(state.locale)}">${t('common.continueInApp')}</a></p>` : ''}
      </section>
      <section><h2>${t('screenshots.title')}</h2><div class="shots">${t('screenshots.placeholders').map((s) => `<article class="shot" aria-label="${s}">${s}</article>`).join('')}</div></section>
    </div>`
  bindEvents()
}

const bindEvents = () => {
  document.getElementById('locale-select').onchange = (e) => { state.locale = e.target.value; localStorage.setItem('lingr.site.locale', state.locale); render() }
  document.getElementById('country').onchange = async (e) => { state.selectedCountry = e.target.value; state.selectedRegion = ''; state.regions = []; state.regionStatus = ''; state.canContinueInApp = false; render(); if (state.selectedCountry) await loadRegions() }
  document.getElementById('region').onchange = async (e) => { state.selectedRegion = e.target.value; await checkRegion() }
  document.getElementById('waitlist-form').onsubmit = submitVote
}

const loadCountries = async () => {
  const res = await fetch(`${API_BASE}/v1/regions/countries`)
  const body = await res.json()
  state.countries = body.data.countries || []
}

const loadRegions = async () => {
  const res = await fetch(`${API_BASE}/v1/regions/${state.selectedCountry}?locale=${state.locale}`)
  const body = await res.json()
  state.regions = body.data.regions || []
  render()
}

const checkRegion = async () => {
  if (!state.selectedCountry || !state.selectedRegion) return
  const res = await fetch(`${API_BASE}/v1/regions/check?countryCode=${state.selectedCountry}&regionSlug=${state.selectedRegion}`)
  const body = await res.json()
  const reason = body.data.reasonCode
  state.canContinueInApp = reason === 'region.open'
  state.regionStatus = reason === 'region.open' ? t('waitlist.statusOpen') : `${t('waitlist.unavailableTitle')} ${t('waitlist.unavailableBody')}`
  render()
}

const submitVote = async (event) => {
  event.preventDefault()
  const payload = { countryCode: state.selectedCountry, regionSlug: state.selectedRegion, firstName: document.getElementById('firstName').value, email: document.getElementById('email').value, locale: state.locale }
  await fetch(`${API_BASE}/v1/regions/vote`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  state.regionStatus = t('waitlist.success')
  render()
}

const init = async () => {
  state.locale = localStorage.getItem('lingr.site.locale') || (navigator.language === 'nb-NO' ? 'nb-NO' : 'en')
  await loadCountries()
  render()
}

init()
