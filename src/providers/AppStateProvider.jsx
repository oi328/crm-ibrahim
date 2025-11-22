import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'
import { captureDeviceInfo, saveDeviceForUser } from '../utils/device'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [activeModules, setActiveModules] = useState([])
  const [bootstrapped, setBootstrapped] = useState(false)
  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false
    const status = String(subscription.status || '').toLowerCase()
    if (status !== 'active') return false
    const end = subscription.end_date ? new Date(subscription.end_date) : null
    return end ? end.getTime() >= Date.now() : true
  }, [subscription])

  const setProfile = useCallback((payload) => {
    if (!payload) return
    setUser(payload.user || null)
    setCompany(payload.company || null)
    setSubscription(payload.subscription || null)
    setActiveModules(Array.isArray(payload.activeModules) ? payload.activeModules : [])
  }, [])

  const fetchCompanyInfo = useCallback(async () => {
    const res = await api.get('/api/company-info')
    const payload = (res && res.data && res.data.data) ? res.data.data : res.data
    setProfile(payload)
    return payload
  }, [setProfile])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/login', { email, password })
    const token = (res && res.data && res.data.data && res.data.data.token) ? res.data.data.token : res?.data?.token
    if (token) {
      window.localStorage.setItem('token', token)
    }
    const payload = await fetchCompanyInfo()
    try {
      const uid = payload?.user?.id || email
      const device = captureDeviceInfo()
      saveDeviceForUser(uid, device)
    } catch {}
    return token
  }, [fetchCompanyInfo])

  const canAccess = useCallback((moduleKey) => {
    if (!moduleKey) return false
    return activeModules.includes(moduleKey)
  }, [activeModules])

  const value = useMemo(() => ({
    user,
    company,
    subscription,
    activeModules,
    isSubscriptionActive,
    setProfile,
    fetchCompanyInfo,
    login,
    canAccess,
    bootstrapped,
  }), [user, company, subscription, activeModules, isSubscriptionActive, setProfile, fetchCompanyInfo, login, canAccess])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const token = window.localStorage.getItem('token')
        if (token) {
          try { await fetchCompanyInfo() } catch {}
        }
      } finally {
        if (mounted) setBootstrapped(true)
      }
    })()
    return () => { mounted = false }
  }, [fetchCompanyInfo])

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}