import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
import { PieChart } from './PieChart'
import { FaSlidersH, FaSearch, FaUser, FaCalendar, FaDollarSign, FaTimes, FaFilter } from 'react-icons/fa';
import { BiSlider } from 'react-icons/bi';
import { 
  RiSearchLine,
  RiUserLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiCloseLine,
  RiFilterLine,
  RiCalendarEventLine,
  RiCalendarCheckLine,
  RiCalendar2Line,
  RiTimeLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiArrowLeftLine
} from 'react-icons/ri';

export const LeadsAnalysisChart = ({ data, chartType = 'bar', filters = {}, legendLabel = 'Sales' }) => {
  const { t } = useTranslation()
  const [chartData, setChartData] = useState([])
  const [maxValue, setMaxValue] = useState(0)
  const containerHeightPx = 192 // h-48 ~= 12rem ~= 192px

  // Advanced search states
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState({
    employee: '',
    stage: '',
    leadName: '',
    dateFrom: '',
    dateTo: '',
    valueMin: '',
    valueMax: ''
  })

  // Date management functions
  const setDateRange = (days) => {
    const today = new Date()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - days)
    
    setAdvancedFilters(prev => ({
      ...prev,
      dateFrom: fromDate.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    }))
  }

  const setCurrentMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    setAdvancedFilters(prev => ({
      ...prev,
      dateFrom: firstDay.toISOString().split('T')[0],
      dateTo: lastDay.toISOString().split('T')[0]
    }))
  }

  const setCurrentYear = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), 0, 1)
    const lastDay = new Date(today.getFullYear(), 11, 31)
    
    setAdvancedFilters(prev => ({
      ...prev,
      dateFrom: firstDay.toISOString().split('T')[0],
      dateTo: lastDay.toISOString().split('T')[0]
    }))
  }

  const clearDateRange = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      dateFrom: '',
      dateTo: ''
    }))
  }

  const swapDates = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      dateFrom: prev.dateTo,
      dateTo: prev.dateFrom
    }))
  }

  // Sample data for employees and stages
  const employees = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'محمد حسن' },
    { id: 4, name: 'نور الدين' },
    { id: 5, name: 'سارة أحمد' }
  ]

  const stages = [
    { id: 'new', name: t('New') },
    { id: 'contacted', name: t('Contacted') },
    { id: 'qualified', name: t('Qualified') },
    { id: 'proposal', name: t('Proposal') },
    { id: 'negotiation', name: t('Negotiation') },
    { id: 'closed_won', name: t('Closed Won') },
    { id: 'closed_lost', name: t('Closed Lost') }
  ]

  // Sample data for leads analysis
  const sampleData = {
    monthly: [
      { label: t('January'), value: 120, converted: 45, lost: 25, inProgress: 50, employee: 'أحمد محمد', stage: 'qualified', leadName: 'عميل يناير', date: '2024-01-15' },
      { label: t('February'), value: 98, converted: 38, lost: 20, inProgress: 40, employee: 'فاطمة علي', stage: 'contacted', leadName: 'عميل فبراير', date: '2024-02-10' },
      { label: t('March'), value: 145, converted: 55, lost: 30, inProgress: 60, employee: 'محمد حسن', stage: 'proposal', leadName: 'عميل مارس', date: '2024-03-20' },
      { label: t('April'), value: 167, converted: 62, lost: 35, inProgress: 70, employee: 'نور الدين', stage: 'new', leadName: 'عميل أبريل', date: '2024-04-05' },
      { label: t('May'), value: 134, converted: 48, lost: 28, inProgress: 58, employee: 'سارة أحمد', stage: 'negotiation', leadName: 'عميل مايو', date: '2024-05-12' },
      { label: t('June'), value: 189, converted: 71, lost: 40, inProgress: 78, employee: 'أحمد محمد', stage: 'closed_won', leadName: 'عميل يونيو', date: '2024-06-18' }
    ],
    weekly: [
      { label: t('Week 1'), value: 45, converted: 18, lost: 8, inProgress: 19 },
      { label: t('Week 2'), value: 52, converted: 22, lost: 10, inProgress: 20 },
      { label: t('Week 3'), value: 38, converted: 15, lost: 7, inProgress: 16 },
      { label: t('Week 4'), value: 61, converted: 25, lost: 12, inProgress: 24 }
    ],
    bySource: [
      { label: t('Website'), value: 245, converted: 98, lost: 47, inProgress: 100 },
      { label: t('Social Media'), value: 189, converted: 76, lost: 38, inProgress: 75 },
      { label: t('Email Campaign'), value: 156, converted: 62, lost: 31, inProgress: 63 },
      { label: t('Referral'), value: 134, converted: 54, lost: 27, inProgress: 53 },
      { label: t('Direct'), value: 98, converted: 39, lost: 20, inProgress: 39 }
    ],
    byStatus: [
      { label: t('New'), value: 234, color: '#3B82F6' },
      { label: t('Contacted'), value: 189, color: '#10B981' },
      { label: t('Qualified'), value: 145, color: '#F59E0B' },
      { label: t('Proposal'), value: 98, color: '#8B5CF6' },
      { label: t('Negotiation'), value: 67, color: '#EF4444' },
      { label: t('Closed Won'), value: 156, color: '#059669' },
      { label: t('Closed Lost'), value: 89, color: '#DC2626' }
    ]
  }

  // Filter functions
  const applyFilters = (rawData) => {
    let filteredData = rawData

    // Apply search term filter
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply advanced filters
    if (advancedFilters.employee) {
      filteredData = filteredData.filter(item => item.employee === advancedFilters.employee)
    }

    if (advancedFilters.stage) {
      filteredData = filteredData.filter(item => item.stage === advancedFilters.stage)
    }

    if (advancedFilters.leadName) {
      filteredData = filteredData.filter(item =>
        item.leadName?.toLowerCase().includes(advancedFilters.leadName.toLowerCase())
      )
    }

    if (advancedFilters.dateFrom) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        const fromDate = new Date(advancedFilters.dateFrom)
        return itemDate >= fromDate
      })
    }

    if (advancedFilters.dateTo) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date)
        const toDate = new Date(advancedFilters.dateTo)
        return itemDate <= toDate
      })
    }

    if (advancedFilters.valueMin) {
      filteredData = filteredData.filter(item => item.value >= parseFloat(advancedFilters.valueMin))
    }

    if (advancedFilters.valueMax) {
      filteredData = filteredData.filter(item => item.value <= parseFloat(advancedFilters.valueMax))
    }

    return filteredData
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setAdvancedFilters({
      employee: '',
      stage: '',
      leadName: '',
      dateFrom: '',
      dateTo: '',
      valueMin: '',
      valueMax: ''
    })
  }

  useEffect(() => {
    const rawData = data || sampleData[filters.dataType || 'monthly']
    const filteredData = applyFilters(rawData)
    setChartData(filteredData)
    
    if (chartType === 'pie' || chartType === 'doughnut') {
      setMaxValue(filteredData.reduce((sum, item) => sum + item.value, 0))
    } else {
      setMaxValue(Math.max(...filteredData.map(item => item.value)) * 1.2)
    }
  }, [data, filters, chartType, searchTerm, advancedFilters])

  const getBarHeightPx = (value) => {
    if (!maxValue || maxValue <= 0) return '1px'
    const h = (value / maxValue) * containerHeightPx
    return `${Math.max(1, Math.round(h))}px`
  }

  const renderBarChart = () => {
    const labels = chartData.map(item => item.label)
    const values = chartData.map(item => item.value || 0)

    const dataObj = {
      labels,
      datasets: [
        {
          label: t(legendLabel),
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderSkipped: false,
          borderRadius: 6,
          maxBarThickness: 36
        }
      ]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
      plugins: {
        legend: { position: 'top', display: true, labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: { enabled: true }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0 } },
        y: { beginAtZero: true, grid: { display: true }, ticks: { precision: 0 } }
      }
    }

    return (
      <div className="w-full h-48 px-2">
        <Bar data={dataObj} options={options} />
      </div>
    )
  }

  const renderStackedBarChart = () => {
    const labels = chartData.map(item => item.label)
    const converted = chartData.map(item => item.converted || 0)
    const inProgress = chartData.map(item => item.inProgress || 0)
    const lost = chartData.map(item => item.lost || 0)

    const dataObj = {
      labels,
      datasets: [
        { label: t('Converted'), data: converted, backgroundColor: '#22c55e', stack: 'status' },
        { label: t('In Progress'), data: inProgress, backgroundColor: '#eab308', stack: 'status' },
        { label: t('Lost'), data: lost, backgroundColor: '#ef4444', stack: 'status' },
      ]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: { enabled: true }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0 } },
        y: { stacked: true, beginAtZero: true, grid: { display: true }, ticks: { precision: 0 } }
      }
    }

    return (
      <div className="w-full h-48 px-2">
        <Bar data={dataObj} options={options} />
      </div>
    )
  }

  const renderLineChart = () => {
    const points = chartData.map((item, index) => {
      const x = (index / (chartData.length - 1)) * 100
      const y = 100 - (item.value / maxValue) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="h-48 p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polyline
            fill="url(#lineGradient)"
            stroke="#3B82F6"
            strokeWidth="0.5"
            points={`0,100 ${points} 100,100`}
          />
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.8"
            points={points}
          />
          {chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#3B82F6"
                className="hover:r-2 transition-all"
              />
            )
          })}
        </svg>
        <div className="flex justify-between mt-2">
          {chartData.map((item, index) => (
            <span key={index} className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0)
    const palette = [
      '#2563eb', // blue-600
      '#06b6d4', // cyan-500
      '#22c55e', // green-500
      '#a3e635', // lime-400
      '#f59e0b', // amber-500
      '#f97316', // orange-500
      '#ef4444', // red-500
      '#f43f5e', // rose-500
      '#a78bfa', // purple-400
      '#8b5cf6', // violet-500
    ]
    const segments = chartData.map((item, index) => ({
      label: item.label,
      value: item.value || 0,
      color: palette[index % palette.length]
    }))

    return (
      <div className="flex items-center justify-center h-48">
        <PieChart
          segments={segments}
          centerValue={total}
          centerLabel={t('Total Leads')}
          size={192}
        />
        <div className="ml-6 space-y-2">
          {segments.map((seg, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{seg.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart()
      case 'stackedBar':
        return renderStackedBarChart()
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <div className="w-full">
      {/* Search Toolbar */}
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-end gap-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder={t('Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
            />
          </div>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center gap-2 font-medium ${
              showAdvancedSearch
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500 shadow-lg'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <BiSlider className="text-lg" />
            {t('Advanced')}
          </button>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiUserLine className="text-blue-600 dark:text-blue-400" />
                  {t('Employee')}
                </label>
                <select
                  value={advancedFilters.employee}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, employee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                >
                  <option value="">{t('All Employees')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiFilterLine className="text-green-600 dark:text-green-400" />
                  {t('Stage')}
                </label>
                <select
                  value={advancedFilters.stage}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                >
                  <option value="">{t('All Stages')}</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              {/* Lead Name Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiSearchLine className="text-purple-600 dark:text-purple-400" />
                  {t('Lead Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('Search by lead name...')}
                  value={advancedFilters.leadName}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, leadName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                />
              </div>

              {/* Date Range Section */}
              <div className="col-span-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-800 dark:text-orange-200">
                    <RiCalendarEventLine className="text-lg" />
                    {t('Date Range Selection')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={swapDates}
                      disabled={!advancedFilters.dateFrom || !advancedFilters.dateTo}
                      className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('Swap Dates')}
                    >
                      <RiArrowRightLine className="transform rotate-180" />
                    </button>
                    <button
                      onClick={clearDateRange}
                      className="p-1.5 rounded-lg bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700 transition-all duration-200"
                      title={t('Clear Date Range')}
                    >
                      <RiRefreshLine />
                    </button>
                  </div>
                </div>

                {/* Quick Date Selection */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                    onClick={() => setDateRange(7)}
                    className="px-3 py-2 text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <RiTimeLine className="text-sm" />
                    {t('7 Days')}
                  </button>
                  <button
                    onClick={() => setDateRange(30)}
                    className="px-3 py-2 text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <RiCalendar2Line className="text-sm" />
                    {t('30 Days')}
                  </button>
                  <button
                    onClick={setCurrentMonth}
                    className="px-3 py-2 text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <RiCalendarCheckLine className="text-sm" />
                    {t('This Month')}
                  </button>
                  <button
                    onClick={setCurrentYear}
                    className="px-3 py-2 text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <RiCalendarEventLine className="text-sm" />
                    {t('This Year')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date From */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                      <RiCalendarLine className="text-orange-600 dark:text-orange-400" />
                      {t('Date From')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={advancedFilters.dateFrom}
                        onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full px-3 py-2 pl-10 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      />
                      <RiCalendarLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                      <RiCalendarCheckLine className="text-orange-600 dark:text-orange-400" />
                      {t('Date To')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={advancedFilters.dateTo}
                        onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full px-3 py-2 pl-10 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      />
                      <RiCalendarCheckLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* Date Range Info */}
                {advancedFilters.dateFrom && advancedFilters.dateTo && (
                  <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                      <RiTimeLine />
                      <span>
                        {t('Range')}: {Math.ceil((new Date(advancedFilters.dateTo) - new Date(advancedFilters.dateFrom)) / (1000 * 60 * 60 * 24))} {t('days')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Value Min */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiMoneyDollarCircleLine className="text-emerald-600 dark:text-emerald-400" />
                  {t('Min Value')}
                </label>
                <input
                  type="number"
                  placeholder={t('Minimum value')}
                  value={advancedFilters.valueMin}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, valueMin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                />
              </div>

              {/* Value Max */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <RiMoneyDollarCircleLine className="text-emerald-600 dark:text-emerald-400" />
                  {t('Max Value')}
                </label>
                <input
                  type="number"
                  placeholder={t('Maximum value')}
                  value={advancedFilters.valueMax}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, valueMax: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 font-medium"
              >
                {t('Clear All')}
              </button>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                {t('Apply Filters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {renderChart()}
      
      {/* Legend handled by Chart.js for stackedBar */}
    </div>
  )
}