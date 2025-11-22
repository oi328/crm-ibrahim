import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useTranslation } from 'react-i18next'
import { useStages } from '../hooks/useStages'

const defaultColorForName = (name) => {
  const key = (name || '').toLowerCase()
  if (key.includes('new')) return '#3b82f6'
  if (key.includes('qual')) return '#22c55e'
  if (key.includes('progress')) return '#f59e0b'
  if (key.includes('convert') || key.includes('won')) return '#8b5cf6'
  if (key.includes('lost')) return '#ef4444'
  return '#2563eb'
}

const defaultIconForName = (name) => {
  const key = (name || '').toLowerCase()
  if (key.includes('new')) return '🆕'
  if (key.includes('qual')) return '✅'
  if (key.includes('progress')) return '⏳'
  if (key.includes('convert') || key.includes('won')) return '🎉'
  if (key.includes('lost')) return '❌'
  return '📊'
}

export default function LeadsStagesStatus() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { stages, statuses, loadStages, loadStatuses } = useStages()

  const [newStage, setNewStage] = useState('')
  const [newStageAr, setNewStageAr] = useState('')
  const [newStageColor, setNewStageColor] = useState('#3b82f6')
  const [newStageIcon, setNewStageIcon] = useState('📊')

  const [newStatus, setNewStatus] = useState('')
  const [newStatusAr, setNewStatusAr] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('#3b82f6')
  const [newStatusIcon, setNewStatusIcon] = useState('📊')

  useEffect(() => {
    setNewStageColor(defaultColorForName(newStage))
    setNewStageIcon(defaultIconForName(newStage))
  }, [newStage])

  useEffect(() => {
    setNewStatusColor(defaultColorForName(newStatus))
    setNewStatusIcon(defaultIconForName(newStatus))
  }, [newStatus])

  const allLeads = useMemo(() => {
    try {
      const saved = localStorage.getItem('leadsData')
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [])

  const countByStage = useMemo(() => {
    const map = {}
    const list = Array.isArray(stages) ? stages : []
    list.forEach(s => { map[(s.name || s).toLowerCase()] = 0 })
    const leads = Array.isArray(allLeads) ? allLeads : []
    leads.forEach(l => {
      const k = (l.stage || '').toLowerCase()
      if (k in map) map[k] = (map[k] || 0) + 1
    })
    return map
  }, [stages, allLeads])

  const countByStatus = useMemo(() => {
    const map = {}
    const list = Array.isArray(statuses) ? statuses : []
    list.forEach(s => { map[(s.name || s).toLowerCase()] = 0 })
    const leads = Array.isArray(allLeads) ? allLeads : []
    leads.forEach(l => {
      const k = (l.status || '').toLowerCase()
      if (k in map) map[k] = (map[k] || 0) + 1
    })
    return map
  }, [statuses, allLeads])

  const saveStages = (next) => {
    try {
      localStorage.setItem('crmStages', JSON.stringify(next))
      loadStages()
    } catch {}
  }

  const saveStatuses = (next) => {
    try {
      localStorage.setItem('crmStatuses', JSON.stringify(next))
      loadStatuses()
    } catch {}
  }

  const handleAddStage = (e) => {
    e?.preventDefault?.()
    const name = (newStage || '').trim()
    if (!name) return
    const exists = (stages || []).some(s => (s.name || s).toLowerCase() === name.toLowerCase())
    if (exists) return
    const next = [{ name, nameAr: (newStageAr || '').trim(), color: newStageColor, icon: newStageIcon }, ...stages]
    saveStages(next)
    setNewStage(''); setNewStageAr('')
  }

  const handleRemoveStage = (name) => {
    const next = (stages || []).filter(s => (s.name || s).toLowerCase() !== name.toLowerCase())
    saveStages(next)
  }

  const handleAddStatus = (e) => {
    e?.preventDefault?.()
    const name = (newStatus || '').trim()
    if (!name) return
    const exists = (statuses || []).some(s => (s.name || s).toLowerCase() === name.toLowerCase())
    if (exists) return
    const next = [{ name, nameAr: (newStatusAr || '').trim(), color: newStatusColor, icon: newStatusIcon }, ...statuses]
    saveStatuses(next)
    setNewStatus(''); setNewStatusAr('')
  }

  const handleRemoveStatus = (name) => {
    const next = (statuses || []).filter(s => (s.name || s).toLowerCase() !== name.toLowerCase())
    saveStatuses(next)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">{t('Pipeline Stages & Leads Status')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t('Pipeline Stages')}</h2>
            </div>
            <form className="grid grid-cols-2 gap-3 mb-4" onSubmit={handleAddStage}>
              <input className="input" placeholder={t('Stage name (EN)')} value={newStage} onChange={e => setNewStage(e.target.value)} />
              <input className="input" placeholder={t('Stage name (AR)')} value={newStageAr} onChange={e => setNewStageAr(e.target.value)} />
              <input className="input" placeholder={t('Color')} value={newStageColor} onChange={e => setNewStageColor(e.target.value)} />
              <input className="input" placeholder={t('Icon')} value={newStageIcon} onChange={e => setNewStageIcon(e.target.value)} />
              <div className="col-span-2 flex items-center gap-2">
                <button className="btn btn-primary" type="submit">{t('Add')}</button>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: newStageColor }}>
                  <span>{newStageIcon}</span>
                  <span>{(isRTL ? (newStageAr || newStage) : newStage) || t('Preview')}</span>
                </span>
              </div>
            </form>

            <div className="space-y-2">
              {(stages || []).length === 0 && (
                <div className="text-sm text-[var(--muted-text)]">{t('No stages added yet.')}</div>
              )}
              {(stages || []).map(s => {
                const name = s.name || String(s)
                const label = isRTL ? (s.nameAr || name) : name
                const count = countByStage[(name || '').toLowerCase()] || 0
                return (
                  <div key={name} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: s.color || '#3b82f6' }}>
                        <span>{s.icon || '📊'}</span>
                        <span>{label}</span>
                      </span>
                      <span className="text-xs text-[var(--muted-text)]">{t('Leads')}: {count}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveStage(name)}>{t('Remove')}</button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t('Leads Status')}</h2>
            </div>
            <form className="grid grid-cols-2 gap-3 mb-4" onSubmit={handleAddStatus}>
              <input className="input" placeholder={t('Status name (EN)')} value={newStatus} onChange={e => setNewStatus(e.target.value)} />
              <input className="input" placeholder={t('Status name (AR)')} value={newStatusAr} onChange={e => setNewStatusAr(e.target.value)} />
              <input className="input" placeholder={t('Color')} value={newStatusColor} onChange={e => setNewStatusColor(e.target.value)} />
              <input className="input" placeholder={t('Icon')} value={newStatusIcon} onChange={e => setNewStatusIcon(e.target.value)} />
              <div className="col-span-2 flex items-center gap-2">
                <button className="btn btn-primary" type="submit">{t('Add')}</button>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: newStatusColor }}>
                  <span>{newStatusIcon}</span>
                  <span>{(isRTL ? (newStatusAr || newStatus) : newStatus) || t('Preview')}</span>
                </span>
              </div>
            </form>

            <div className="space-y-2">
              {(statuses || []).length === 0 && (
                <div className="text-sm text-[var(--muted-text)]">{t('No statuses added yet.')}</div>
              )}
              {(statuses || []).map(s => {
                const name = s.name || String(s)
                const label = isRTL ? (s.nameAr || name) : name
                const count = countByStatus[(name || '').toLowerCase()] || 0
                return (
                  <div key={name} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: s.color || '#3b82f6' }}>
                        <span>{s.icon || '📊'}</span>
                        <span>{label}</span>
                      </span>
                      <span className="text-xs text-[var(--muted-text)]">{t('Leads')}: {count}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveStatus(name)}>{t('Remove')}</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}