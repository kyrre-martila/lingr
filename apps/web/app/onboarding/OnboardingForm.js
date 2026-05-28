'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, apiClient } from '../../lib/api-client'

const AUTH_REASON_CODES = new Set(['auth.requires_auth', 'auth.session_expired'])

const initialForm = {
  displayName: '',
  pronouns: '',
  ageRange: '',
  bio: '',
  layersSummary: '',
  countryCode: '',
  regionSlug: '',
  avatarAssetId: ''
}

const initialAccountForm = { email: '', password: '' }

export default function OnboardingForm() {
  const [form, setForm] = useState(initialForm)
  const [accountForm, setAccountForm] = useState(initialAccountForm)
  const [countries, setCountries] = useState([])
  const [regions, setRegions] = useState([])
  const [regionAvailability, setRegionAvailability] = useState(null)
  const [profileCompleteness, setProfileCompleteness] = useState(null)
  const [status, setStatus] = useState({ loading: true, saving: false, registering: false, countriesError: '', regionsError: '', error: '', success: '', authRequired: false })

  const selectedRegion = useMemo(
    () => regions.find((region) => region.slug === form.regionSlug) || null,
    [regions, form.regionSlug]
  )

  const normalizeCountries = (response) => Array.isArray(response?.countries)
    ? response.countries
    : Array.isArray(response?.data?.countries)
      ? response.data.countries
      : []

  const loadOnboardingData = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: '', success: '' }))

    const countriesResult = await apiClient.listCountries()
      .then((response) => ({ ok: true, countries: normalizeCountries(response) }))
      .catch(() => ({ ok: false, countries: [] }))

    setCountries(countriesResult.countries)

    try {
      const [profileResponse, completenessResponse] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getProfileCompleteness().catch(() => null)
      ])

      const profile = profileResponse?.profile || {}
      const nextForm = {
        displayName: profile.displayName || '',
        pronouns: profile.pronouns || '',
        ageRange: profile.ageRange || '',
        bio: profile.bio || '',
        layersSummary: profile.layersSummary || '',
        countryCode: '',
        regionSlug: '',
        avatarAssetId: profile.avatarUrl ? String(profile.avatarUrl).replace('/assets/', '') : ''
      }

      setForm(nextForm)
      setProfileCompleteness(completenessResponse)
      setStatus((prev) => ({
        ...prev,
        authRequired: false,
        loading: false,
        countriesError: countriesResult.ok ? '' : 'We could not load countries right now.',
        error: ''
      }))
    } catch (error) {
      if (error instanceof ApiError && AUTH_REASON_CODES.has(error.reasonCode)) {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          saving: false,
          registering: false,
          error: '',
          success: '',
          authRequired: true,
          countriesError: countriesResult.ok ? '' : 'We could not load countries right now.'
        }))
        return
      }

      setStatus((prev) => ({ ...prev, loading: false, error: 'We could not load onboarding right now. Please try again in a moment.' }))
    }
  }, [])

  useEffect(() => {
    loadOnboardingData()
  }, [loadOnboardingData])

  useEffect(() => {
    const loadRegions = async () => {
      if (!form.countryCode) {
        setRegions([])
        setForm((prev) => ({ ...prev, regionSlug: '' }))
        setRegionAvailability(null)
        setStatus((prev) => ({ ...prev, regionsError: '' }))
        return
      }

      try {
        const response = await apiClient.listRegionsByCountry({ countryCode: form.countryCode })
        const nextRegions = Array.isArray(response?.regions)
          ? response.regions
          : Array.isArray(response?.data?.regions)
            ? response.data.regions
            : []
        setRegions(nextRegions)
        setRegionAvailability(null)
        setStatus((prev) => ({ ...prev, regionsError: '' }))
      } catch {
        setRegions([])
        setStatus((prev) => ({ ...prev, regionsError: 'We could not load regions for that country right now.' }))
      }
    }

    loadRegions()
  }, [form.countryCode])

  useEffect(() => {
    const checkAvailability = async () => {
      if (!form.countryCode || !form.regionSlug) {
        setRegionAvailability(null)
        return
      }

      try {
        const result = await apiClient.checkRegionAvailability({ countryCode: form.countryCode, regionSlug: form.regionSlug })
        setRegionAvailability(result)
      } catch {
        setRegionAvailability(null)
      }
    }

    checkAvailability()
  }, [form.countryCode, form.regionSlug])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAccountChange = (event) => {
    const { name, value } = event.target
    setAccountForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setStatus((prev) => ({ ...prev, registering: true, error: '', success: '' }))

    try {
      await apiClient.register({
        email: accountForm.email,
        password: accountForm.password,
        countryCode: form.countryCode,
        regionSlug: form.regionSlug
      })
      setAccountForm(initialAccountForm)
      await loadOnboardingData()
    } catch {
      setStatus((prev) => ({ ...prev, registering: false, error: 'We could not create your account yet. Please review your details and try again.' }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus((prev) => ({ ...prev, saving: true, error: '', success: '' }))

    try {
      const locationRegion = selectedRegion ? `${selectedRegion.name}, ${form.countryCode}` : null
      await apiClient.updateProfile({
        displayName: form.displayName,
        pronouns: form.pronouns,
        ageRange: form.ageRange,
        bio: form.bio,
        layersSummary: form.layersSummary,
        locationRegion,
        avatarAssetId: form.avatarAssetId
      })
      const completenessResponse = await apiClient.getProfileCompleteness().catch(() => null)
      setProfileCompleteness(completenessResponse)
      setStatus((prev) => ({ ...prev, saving: false, success: 'Profile saved. You can continue whenever it feels right.' }))
    } catch (error) {
      if (error instanceof ApiError && AUTH_REASON_CODES.has(error.reasonCode)) {
        setStatus((prev) => ({ ...prev, loading: false, saving: false, error: '', success: '', authRequired: true }))
        return
      }
      setStatus((prev) => ({ ...prev, saving: false, error: 'We could not save yet. Please review your details and try again.' }))
    }
  }

  const readiness = profileCompleteness?.lifecycleState === 'active' || Number(profileCompleteness?.profileCompleteness || 0) >= 80
  const missingFields = Array.isArray(profileCompleteness?.missingFields) ? profileCompleteness.missingFields : []
  const missingFieldLabels = {
    displayName: 'display name',
    bio: 'bio',
    pronouns: 'pronouns',
    ageRange: 'age range',
    layersSummary: 'pace summary',
    locationRegion: 'location region',
    avatarUrl: 'avatar',
    avatarAssetId: 'avatar'
  }
  const missingFieldMessage = missingFields.length
    ? `To finish this step, please add: ${missingFields.map((field) => missingFieldLabels[field] || field).join(', ')}.`
    : ''

  if (status.loading) return <div className='onboarding-card'><p>Loading your onboarding details…</p></div>

  if (status.authRequired) {
    return (
      <form className='onboarding-card flow' onSubmit={handleRegister}>
        <h3>Create your Lingr account</h3>
        <p className='onboarding-helper'>Start onboarding with a calm account setup. You will continue to your profile foundation after this step.</p>
        <label className='flow'>
          <span>Email</span>
          <input className='onboarding-input' name='email' type='email' autoComplete='email' required value={accountForm.email} onChange={handleAccountChange} />
        </label>
        <label className='flow'>
          <span>Password</span>
          <input className='onboarding-input' name='password' type='password' autoComplete='new-password' minLength={8} required value={accountForm.password} onChange={handleAccountChange} />
        </label>
        <label className='flow'>
          <span>Country</span>
          <select className='onboarding-input' name='countryCode' required value={form.countryCode} onChange={handleChange}>
            <option value=''>{status.countriesError ? 'Could not load countries' : 'Select a country'}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.isoCode}>{country.name}</option>
            ))}
          </select>
        </label>
        <label className='flow'>
          <span>Region</span>
          <select className='onboarding-input' name='regionSlug' required value={form.regionSlug} onChange={handleChange} disabled={!form.countryCode}>
            <option value=''>{status.regionsError ? 'Could not load regions' : 'Select a region'}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.slug}>{region.name}</option>
            ))}
          </select>
        </label>
        {regionAvailability?.reasonCode ? (
          <p className='onboarding-helper'>
            {regionAvailability.reasonCode === 'region.open' ? 'Your region is open for onboarding.' : 'Your region is not open yet. You can come back when Lingr opens there.'}
          </p>
        ) : null}
        {status.error ? <p className='onboarding-helper'>{status.error}</p> : null}
        {status.countriesError ? <p className='onboarding-helper'>{status.countriesError}</p> : null}
        {status.regionsError ? <p className='onboarding-helper'>{status.regionsError}</p> : null}
        <div>
          <button className='button' type='submit' disabled={status.registering}>{status.registering ? 'Creating account…' : 'Create account'}</button>
        </div>
        <p className='onboarding-helper'>Already have an account? <Link href='/login'>Back to login</Link></p>
      </form>
    )
  }

  return (
    <form className='onboarding-card flow' onSubmit={handleSubmit}>
      <label className='flow'>
        <span>Display name</span>
        <input className='onboarding-input' name='displayName' maxLength={80} required value={form.displayName} onChange={handleChange} />
      </label>
      <label className='flow'>
        <span>Pronouns</span>
        <input className='onboarding-input' name='pronouns' maxLength={50} value={form.pronouns} onChange={handleChange} />
      </label>
      <label className='flow'>
        <span>Age range</span>
        <input className='onboarding-input' name='ageRange' maxLength={20} value={form.ageRange} onChange={handleChange} />
      </label>
      <label className='flow'>
        <span>Bio</span>
        <textarea className='onboarding-input' name='bio' maxLength={300} rows={4} value={form.bio} onChange={handleChange} />
      </label>
      <label className='flow'>
        <span>What helps someone get to know your pace?</span>
        <textarea className='onboarding-input' name='layersSummary' maxLength={300} rows={3} value={form.layersSummary} onChange={handleChange} />
      </label>

      <label className='flow'>
        <span>Avatar asset ID</span>
        <input className='onboarding-input' name='avatarAssetId' maxLength={120} value={form.avatarAssetId} onChange={handleChange} />
      </label>

      <label className='flow'>
        <span>Country</span>
        <select className='onboarding-input' name='countryCode' value={form.countryCode} onChange={handleChange}>
          <option value=''>{status.countriesError ? 'Could not load countries' : 'Select a country'}</option>
          {countries.map((country) => (
            <option key={country.id} value={country.isoCode}>{country.name}</option>
          ))}
        </select>
      </label>
      <label className='flow'>
        <span>Region</span>
        <select className='onboarding-input' name='regionSlug' value={form.regionSlug} onChange={handleChange} disabled={!form.countryCode}>
          <option value=''>{status.regionsError ? 'Could not load regions' : 'Select a region'}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.slug}>{region.name}</option>
          ))}
        </select>
      </label>

      {regionAvailability?.reasonCode && (
        <p className='onboarding-helper'>
          {regionAvailability.reasonCode === 'region.open' ? 'Your region is open for discovery.' : 'Your region is not open yet. You can still save your profile and continue later.'}
        </p>
      )}
      {status.error ? <p className='onboarding-helper'>{status.error}</p> : null}
      {status.countriesError ? <p className='onboarding-helper'>{status.countriesError}</p> : null}
      {status.regionsError ? <p className='onboarding-helper'>{status.regionsError}</p> : null}
      {status.success ? <p className='onboarding-helper'>{status.success}</p> : null}
      {profileCompleteness?.profileCompleteness != null ? <p className='onboarding-helper'>Profile completeness: {profileCompleteness.profileCompleteness}%</p> : null}
      {missingFieldMessage ? <p className='onboarding-helper'>{missingFieldMessage}</p> : null}

      <div>
        <button className='button' type='submit' disabled={status.saving}>{status.saving ? 'Saving…' : 'Save profile'}</button>
      </div>
      {status.success && readiness ? (
        <p><Link href='/discovery'>Continue to discovery</Link></p>
      ) : null}
    </form>
  )
}
