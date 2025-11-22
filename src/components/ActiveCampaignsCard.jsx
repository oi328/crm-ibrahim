import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart } from './PieChart'

export default function ActiveCampaignsCard({ segments }) {
  const { t, i18n } = useTranslation()
  const [showPaused, setShowPaused] = useState(true)
  const lang = i18n.language || 'en'
  const isRTL = lang === 'ar'

  const allSegments =
    segments || [
      { label: t('On Track'), value: 12, color: '#22c55e' },
      { label: t('At Risk'), value: 5, color: '#f59e0b' },
      { label: t('Paused'), value: 3, color: '#ef4444' }
    ]

  const displaySegments = showPaused
    ? allSegments
    : allSegments.filter((s) => s.label !== t('Paused'))

  const totalActive = allSegments
    .filter((d) => d.label === t('On Track') || d.label === t('At Risk'))
    .reduce((acc, d) => acc + (d.value || 0), 0)

  const topCampaigns = [
    { name: lang === 'ar' ? 'حملة الصيف' : 'Summer Promo', status: 'onTrack', openRate: 32, clickRate: 4.1, conversionRate: 5.2 },
    { name: lang === 'ar' ? 'استرجاع العملاء' : 'Winback Series', status: 'atRisk', openRate: 18, clickRate: 2.3, conversionRate: 2.1 },
    { name: lang === 'ar' ? 'إطلاق المنتج' : 'Product Launch', status: 'paused', openRate: 0, clickRate: 0, conversionRate: 0 }
  ]

  const activeTop = topCampaigns.filter(c => c.status !== 'paused')
  const avgOpenRate = Math.round(activeTop.reduce((a, c) => a + c.openRate, 0) / activeTop.length)
  const avgClickRate = Number((activeTop.reduce((a, c) => a + c.clickRate, 0) / activeTop.length).toFixed(1))
  const avgConversionRate = Number((activeTop.reduce((a, c) => a + c.conversionRate, 0) / activeTop.length).toFixed(1))

  const statusColor = (s) => {
    if (s === 'onTrack') return 'bg-emerald-500'
    if (s === 'atRisk') return 'bg-amber-500'
    return 'bg-red-500'
  }

  const statusLabel = (s) => {
    if (s === 'onTrack') return t('On Track')
    if (s === 'atRisk') return t('At Risk')
    return t('Paused')
  }

  const statusBadgeClass = (s) => {
    if (s === 'onTrack') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    if (s === 'atRisk') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('Active Campaigns')}</h3>
        <span className="text-xs text-gray-500 dark:text-blue-200">{t('Last 30 Days')}</span>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-blue-900">
          <div className="text-xs text-gray-600 dark:text-gray-300">{t('Avg. Open Rate')}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{avgOpenRate}%</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-blue-900">
          <div className="text-xs text-gray-600 dark:text-gray-300">{t('Avg. Click Rate')}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{avgClickRate}%</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-blue-900">
          <div className="text-xs text-gray-600 dark:text-gray-300">{t('Conversion Rate')}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{avgConversionRate}%</div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 md:gap-6">
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start gap-4 md:gap-6 w-full`}>
          <div className="shrink-0 self-start">
            <PieChart
              segments={displaySegments}
              centerValue={totalActive}
              centerLabel={t('Total Active')}
              size={160}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('Active Campaigns Overview')}</h4>
              <button
                type="button"
                onClick={() => setShowPaused(v => !v)}
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-blue-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-blue-800"
              >
                {showPaused ? t('Hide Paused') : t('Show Paused')}
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {displaySegments.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{seg.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-3">{t('Top Campaigns')}</h4>
          <div className="flex flex-row flex-nowrap gap-3 w-full items-stretch overflow-x-auto pr-1 snap-x snap-mandatory">
            {topCampaigns.map((c, idx) => (
              <div key={idx} className="flex flex-col p-3 rounded-xl border border-gray-200 dark:border-blue-700 bg-transparent dark:bg-transparent shadow-sm hover:shadow-md transition-shadow duration-200 h-full min-h-[120px] flex-shrink-0 w-fit max-w-[200px] md:max-w-[220px] snap-start">
                <div className="flex flex-col items-start gap-1 min-w-0">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <span className={`inline-block w-3 h-3 rounded-full ${statusColor(c.status)}`} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-normal break-words">{c.name}</span>
                  </div>
                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(c.status)}`}>{statusLabel(c.status)}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-xs md:text-sm text-[var(--muted-text)]">
                  <div>{t('Open Rate')}: {c.openRate}%</div>
                  <div>{t('Click Rate')}: {c.clickRate}%</div>
                  <div>{t('Conversion Rate')}: {c.conversionRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}