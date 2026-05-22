'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import PageIntro from '../../components/ui/PageIntro'
import { apiClient } from '../../lib/api-client'

const initialForm = {
  email: '',
  password: '',
  countryCode: '',
  regionSlug: ''
}

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [countries, setCountries] = useState([])
  const [regions, setRegions] = useState([])
  const [loadingRegions, setLoadingRegions] = useState(false)
  const [status, setStatus] = useState({ loadingCountries: true, loadingRegionsError: '', countriesError: '', submitting: false, error: '' })

  const title = mode === 'register' ? 'Create account' : 'Login'
  const eyebrow = mode === 'register' ? 'Start with care' : 'Welcome back'
  const description = mode === 'register'
    ? 'Create your Lingr account to start onboarding.'
    : 'Use your Lingr account to continue at your own pace.'

  useEffect(() => {
    const loadCountries = async () => {
      setStatus((prev) => ({ ...prev, loadingCountries: true, error: '' }))
      try {
        const response = await apiClient.listCountries()
        const nextCountries = Array.isArray(response?.countries)
          ? response.countries
          : Array.isArray(response?.data?.countries)
            ? response.data.countries
            : []
        setCountries(nextCountries)
        setStatus((prev) => ({ ...prev, loadingCountries: false, countriesError: '' }))
      } catch {
        setCountries([])
        setStatus((prev) => ({ ...prev, loadingCountries: false, countriesError: 'We could not load countries right now. Please try again.' }))
      }
    }

    loadCountries()
  }, [])

  useEffect(() => {
    const loadRegions = async () => {
      if (!form.countryCode || mode !== 'register') {
        setRegions([])
        setStatus((prev) => ({ ...prev, loadingRegionsError: '' }))
        return
      }

      setLoadingRegions(true)
      try {
        const response = await apiClient.listRegionsByCountry({ countryCode: form.countryCode })
        const nextRegions = Array.isArray(response?.regions)
          ? response.regions
          : Array.isArray(response?.data?.regions)
            ? response.data.regions
            : []
        setRegions(nextRegions)
        setStatus((prev) => ({ ...prev, loadingRegionsError: '' }))
      } catch {
        setRegions([])
        setStatus((prev) => ({ ...prev, loadingRegionsError: 'We could not load regions for that country right now.' }))
      } finally {
        setLoadingRegions(false)
      }
    }

    loadRegions()
  }, [form.countryCode, mode])

  const submitLabel = useMemo(() => {
    if (status.submitting) return mode === 'register' ? 'Creating account…' : 'Signing in…'
    return mode === 'register' ? 'Create account' : 'Sign in'
  }, [mode, status.submitting])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setStatus((prev) => ({ ...prev, error: '' }))
    setForm((prev) => ({ ...prev, countryCode: '', regionSlug: '' }))
    setRegions([])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus((prev) => ({ ...prev, submitting: true, error: '' }))

    try {
      if (mode === 'register') {
        await apiClient.register({
          email: form.email,
          password: form.password,
          countryCode: form.countryCode,
          regionSlug: form.regionSlug
        })
        window.location.assign('/onboarding')
        return
      }

      const response = await apiClient.login({ email: form.email, password: form.password })
      const onboardingComplete = Boolean(response?.onboardingComplete)
      window.location.assign(onboardingComplete ? '/discovery' : '/onboarding')
    } catch {
      setStatus((prev) => ({ ...prev, submitting: false, error: mode === 'register' ? 'We could not create your account yet. Please review your details and try again.' : 'We could not sign you in. Please verify your email and password.' }))
    }
  }

  return (
    <PageIntro eyebrow={eyebrow} title={title} description={description}>
      <form className='onboarding-card flow' onSubmit={handleSubmit}>
        <label className='flow'>
          <span>Email</span>
          <input className='onboarding-input' name='email' type='email' autoComplete='email' required value={form.email} onChange={handleChange} />
        </label>
        <label className='flow'>
          <span>Password</span>
          <input className='onboarding-input' name='password' type='password' autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required value={form.password} onChange={handleChange} />
        </label>

        {mode === 'register' ? (
          <>
            <label className='flow'>
              <span>Country</span>
              <select className='onboarding-input' name='countryCode' value={form.countryCode} onChange={handleChange} required disabled={status.loadingCountries}>
                <option value=''>{status.loadingCountries ? 'Loading countries…' : status.countriesError ? 'Could not load countries' : 'Select a country'}</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.isoCode}>{country.name}</option>
                ))}
              </select>
            </label>
            <label className='flow'>
              <span>Region</span>
              <select className='onboarding-input' name='regionSlug' value={form.regionSlug} onChange={handleChange} required disabled={!form.countryCode || loadingRegions}>
                <option value=''>{loadingRegions ? 'Loading regions…' : status.loadingRegionsError ? 'Could not load regions' : 'Select a region'}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.slug}>{region.name}</option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {status.countriesError ? <p className='onboarding-helper'>{status.countriesError}</p> : null}
        {status.loadingRegionsError ? <p className='onboarding-helper'>{status.loadingRegionsError}</p> : null}
        {status.error ? <p className='onboarding-helper'>{status.error}</p> : null}

        <div>
          <button className='button' type='submit' disabled={status.submitting || status.loadingCountries}>{submitLabel}</button>
        </div>
      </form>

      {mode === 'login' ? (
        <p>
          Need an account? <button className='linklike-button' type='button' onClick={() => switchMode('register')}>Start onboarding</button>.
        </p>
      ) : (
        <p>
          Already have an account? <button className='linklike-button' type='button' onClick={() => switchMode('login')}>Sign in</button>.
        </p>
      )}
      <p><Link href='/onboarding'>Continue to onboarding</Link></p>
    </PageIntro>
  )
}
