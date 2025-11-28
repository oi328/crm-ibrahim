import { useState, useEffect, useRef, useMemo } from 'react'
import { PieChart } from '@shared/components/PieChart';
import ActiveUsersChart from '@features/Dashboard/components/ActiveUsersChart'
import ActiveCampaignsCard from '@features/Dashboard/components/ActiveCampaignsCard'
import { PipelineAnalysis } from '@features/Dashboard/components/PipelineAnalysis';
import { Comments } from '@features/Dashboard/components/Comments'
import RecentPhoneCalls from '@features/Dashboard/components/RecentPhoneCalls';
import { useTranslation } from 'react-i18next';
import { DelayLeads } from '@features/Dashboard/components/DelayLeads';
import { LeadsAnalysisChart } from '@features/Dashboard/components/LeadsAnalysisChart';
import { LeadsStatsCard } from '@features/Dashboard/components/LeadsStatsCard';
import { useTheme } from '@shared/context/ThemeProvider';
import SearchableSelect from '@shared/components/SearchableSelect'
import { 
  RiBarChart2Line, 
  RiLineChartLine, 
  RiPieChartLine, 
  RiStackLine,
  RiCalendarLine,
  RiFilterLine
} from 'react-icons/ri';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedManager, setSelectedManager] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [isMobileQuick, setIsMobileQuick] = useState(false);
  const [showAllQuick, setShowAllQuick] = useState(false);
  const [isDesktopQuick, setIsDesktopQuick] = useState(false);
  const [showAllDesktopQuick, setShowAllDesktopQuick] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState('Count');
  const [activeFilter, setActiveFilter] = useState('active');
  const [yearFilter, setYearFilter] = useState('2025');
  const [stageDefs, setStageDefs] = useState([]);
  const maxInitialStages = isMobileQuick ? 2 : (isDesktopQuick ? 3 : 2);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Panel height sync: make Active Users fill height but not exceed Leads Status
  const leadsPanelRef = useRef(null);
  const usersPanelRef = useRef(null);
  const [leadsPanelHeight, setLeadsPanelHeight] = useState(null);
  useEffect(() => {
    const measure = () => {
      if (leadsPanelRef.current) setLeadsPanelHeight(leadsPanelRef.current.clientHeight);
    };
    // initial and after layout
    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Load pipeline stages with colors/icons from Settings
  const defaultIconForName = (name) => {
    const key = (name || '').toLowerCase();
    if (key.includes('convert')) return '✅';
    if (key.includes('progress')) return '⏳';
    if (key.includes('lost')) return '❌';
    if (key.includes('new')) return '🆕';
    if (key.includes('qual')) return '🎯';
    return '📊';
  };
  const defaultColorForName = (name) => {
    const key = (name || '').toLowerCase();
    if (key.includes('convert')) return '#10b981'; // green-500
    if (key.includes('progress')) return '#f59e0b'; // amber-500
    if (key.includes('lost')) return '#ef4444'; // red-500
    if (key.includes('new')) return '#3b82f6'; // blue-500
    if (key.includes('qual')) return '#8b5cf6'; // violet-500
    return '#3b82f6';
  };
  
  // New states for Leads Analysis
  const [leadsChartType, setLeadsChartType] = useState('bar');
  const [leadsDataType, setLeadsDataType] = useState('monthly');
  const [leadsStatusFilter, setLeadsStatusFilter] = useState('all');
  const [leadsSourceFilter, setLeadsSourceFilter] = useState('all');

  const chartData = {
    Count: [
      { label: 'April 2025', value: 25, color: 'bg-blue-500' },
      { label: 'May 2025', value: 28, color: 'bg-blue-500' },
      { label: 'June 2025', value: 15, color: 'bg-blue-500' },
      { label: 'July 2025', value: 20, color: 'bg-blue-500' },
      { label: 'August 2025', value: 42, color: 'bg-blue-500' },
      { label: 'September 2025', value: 90, color: 'bg-blue-500' }
    ],
    'Days to Assign': [
      { label: 'April 2025', value: 3.2, color: 'bg-green-500' },
      { label: 'May 2025', value: 2.8, color: 'bg-green-500' },
      { label: 'June 2025', value: 4.1, color: 'bg-green-500' },
      { label: 'July 2025', value: 3.7, color: 'bg-green-500' },
      { label: 'August 2025', value: 2.5, color: 'bg-green-500' },
      { label: 'September 2025', value: 1.8, color: 'bg-green-500' }
    ],
    'Expected Revenue': [
      { label: 'April 2025', value: 125000, color: 'bg-purple-500' },
      { label: 'May 2025', value: 145000, color: 'bg-purple-500' },
      { label: 'June 2025', value: 98000, color: 'bg-purple-500' },
      { label: 'July 2025', value: 112000, color: 'bg-purple-500' },
      { label: 'August 2025', value: 189000, color: 'bg-purple-500' },
      { label: 'September 2025', value: 234000, color: 'bg-purple-500' }
    ]
  };

  const getCurrentChartData = () => {
    return chartData[selectedMeasure] || chartData.Count;
  };

  const getChartMax = () => {
    const currentData = getCurrentChartData();
    return Math.max(...currentData.map(d => d.value));
  };

  // يعرض بيانات الرسم مع تعديل سنة الملصقات حسب المرشح الحالي
  const getDisplayChartData = () => {
    const current = getCurrentChartData();
    return current.map(d => ({
      ...d,
      label: d.label.replace(/\b\d{4}\b/, yearFilter)
    }));
  };

  const formatValue = (value, measure) => {
    if (measure === 'Expected Revenue') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (measure === 'Days to Assign' || measure === 'Days to Close') {
      return `${value.toFixed(1)} days`;
    }
    return value.toLocaleString();
  };

  useEffect(() => {
    const handleResizeQN = () => setIsMobileQuick(window.innerWidth < 640);
    handleResizeQN();
    window.addEventListener('resize', handleResizeQN);
    return () => window.removeEventListener('resize', handleResizeQN);
  }, []);

  useEffect(() => {
    const handleResizeDesktop = () => setIsDesktopQuick(window.innerWidth >= 1024);
    handleResizeDesktop();
    window.addEventListener('resize', handleResizeDesktop);
    return () => window.removeEventListener('resize', handleResizeDesktop);
  }, []);

  // Load stages from Settings (localStorage)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crmStages') || '[]');
      const normalized = Array.isArray(saved)
        ? (typeof saved[0] === 'string'
            ? saved.map((name) => ({ name, color: defaultColorForName(name), icon: defaultIconForName(name) }))
            : saved.map((s) => ({ name: s.name || String(s), color: s.color || defaultColorForName(s.name || String(s)), icon: s.icon || defaultIconForName(s.name || String(s)) }))
          )
        : [];
      setStageDefs(normalized);
    } catch (e) {
      setStageDefs([]);
    }
  }, []);

  // Helpers to support custom hex colors from Settings
  const isHexColor = (c) => typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);
  const hexToRgb = (hex) => {
    try {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map((x) => x + x).join('');
      const bigint = parseInt(h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    } catch {
      return { r: 0, g: 0, b: 0 };
    }
  };
  const withAlpha = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Color style presets for named colors
  const COLOR_STYLES = {
    blue: {
      container: 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 shadow-blue-300/50 dark:shadow-blue-500/25',
      containerLight: 'border-blue-400 bg-gradient-to-br from-blue-100/60 via-blue-100/40 to-blue-100/30 backdrop-blur-sm shadow-blue-300/30',
      containerDark: 'border-blue-500 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 shadow-blue-500/25',
      patternFrom: 'from-blue-200',
      patternTo: 'to-blue-300',
      patternFromLight: 'from-blue-200/40',
      patternToLight: 'to-blue-300/30',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
      iconBgLight: 'bg-blue-600/80',
      iconBgDark: 'bg-blue-500',
    },
    green: {
      container: 'border-green-400 dark:border-green-500 bg-gradient-to-br from-green-100 via-green-200 to-green-300 dark:from-green-800 dark:via-green-700 dark:to-green-600 shadow-green-300/50 dark:shadow-green-500/25',
      containerLight: 'border-green-400 bg-gradient-to-br from-green-100/60 via-green-100/40 to-green-100/30 backdrop-blur-sm shadow-green-300/30',
      containerDark: 'border-green-500 bg-gradient-to-br from-green-800 via-green-700 to-green-600 shadow-green-500/25',
      patternFrom: 'from-green-200',
      patternTo: 'to-green-300',
      patternFromLight: 'from-green-200/40',
      patternToLight: 'to-green-300/30',
      iconBg: 'bg-green-600 dark:bg-green-500',
      iconBgLight: 'bg-green-600/80',
      iconBgDark: 'bg-green-500',
      badgeLightBg: 'bg-green-100/60',
      badgeLightText: 'text-green-700',
      badgeLightBorder: 'border-green-300',
    },
    yellow: {
      container: 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 dark:from-yellow-800 dark:via-yellow-700 dark:to-yellow-600 shadow-yellow-300/50 dark:shadow-yellow-500/25',
      containerLight: 'border-yellow-400 bg-gradient-to-br from-yellow-100/60 via-yellow-100/40 to-yellow-100/30 backdrop-blur-sm shadow-yellow-300/30',
      containerDark: 'border-yellow-500 bg-gradient-to-br from-yellow-800 via-yellow-700 to-yellow-600 shadow-yellow-500/25',
      patternFrom: 'from-yellow-200',
      patternTo: 'to-yellow-300',
      patternFromLight: 'from-yellow-200/40',
      patternToLight: 'to-yellow-300/30',
      iconBg: 'bg-yellow-600 dark:bg-yellow-500',
      iconBgLight: 'bg-yellow-600/80',
      iconBgDark: 'bg-yellow-500',
      badgeLightBg: 'bg-yellow-100/60',
      badgeLightText: 'text-yellow-700',
      badgeLightBorder: 'border-yellow-300',
    },
    red: {
      container: 'border-red-400 dark:border-red-500 bg-gradient-to-br from-red-100 via-red-200 to-red-300 dark:from-red-800 dark:via-red-700 dark:to-red-600 shadow-red-300/50 dark:shadow-red-500/25',
      containerLight: 'border-red-400 bg-gradient-to-br from-red-100/60 via-red-100/40 to-red-100/30 backdrop-blur-sm shadow-red-300/30',
      containerDark: 'border-red-500 bg-gradient-to-br from-red-800 via-red-700 to-red-600 shadow-red-500/25',
      patternFrom: 'from-red-200',
      patternTo: 'to-red-300',
      patternFromLight: 'from-red-200/40',
      patternToLight: 'to-red-300/30',
      iconBg: 'bg-red-600 dark:bg-red-500',
      iconBgLight: 'bg-red-600/80',
      iconBgDark: 'bg-red-500',
      badgeLightBg: 'bg-red-100/60',
      badgeLightText: 'text-red-700',
      badgeLightBorder: 'border-red-300',
    },
    purple: {
      container: 'border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600 shadow-purple-300/50 dark:shadow-purple-500/25',
      containerLight: 'border-purple-400 bg-gradient-to-br from-purple-100/60 via-purple-100/40 to-purple-100/30 backdrop-blur-sm shadow-purple-300/30',
      containerDark: 'border-purple-500 bg-gradient-to-br from-purple-800 via-purple-700 to-purple-600 shadow-purple-500/25',
      patternFrom: 'from-purple-200',
      patternTo: 'to-purple-300',
      patternFromLight: 'from-purple-200/40',
      patternToLight: 'to-purple-300/30',
      iconBg: 'bg-purple-600 dark:bg-purple-500',
      iconBgLight: 'bg-purple-600/80',
      iconBgDark: 'bg-purple-500',
      badgeLightBg: 'bg-purple-100/60',
      badgeLightText: 'text-purple-700',
      badgeLightBorder: 'border-purple-300',
    },
  };

  // Load all leads for counting by stage (shared storage with Leads page)
  const allLeads = useMemo(() => {
    const parse = (key) => {
      try {
        const s = localStorage.getItem(key)
        return s ? JSON.parse(s) : []
      } catch {
        return []
      }
    }
    const merged = [...parse('leadsData'), ...parse('leads')]
    const byId = new Map()
    merged.forEach((l) => { byId.set(l?.id ?? Math.random(), l) })
    const arr = Array.from(byId.values())
    const sel = (selectedEmployee || selectedManager || '').trim()
    const inRange = (lead) => {
      if (!dateFrom && !dateTo) return true
      const baseStr = lead?.lastContact || lead?.createdAt
      const d = new Date(baseStr)
      if (isNaN(d)) return true
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0,0,0,0)
        if (day < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(0,0,0,0)
        if (day > to) return false
      }
      return true
    }
    return arr.filter(l => {
      const matchesEmp = !sel || ((l.assignedTo || l.employee || '').trim() === sel)
      return matchesEmp && inRange(l)
    })
  }, [refreshTrigger, selectedEmployee, selectedManager, dateFrom, dateTo]);

  // Listen for localStorage changes to refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events from the same tab (when we update localStorage)
    window.addEventListener('leadsDataUpdated', handleStorageChange);

    // Trigger initial refresh to load data
    setRefreshTrigger(prev => prev + 1);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leadsDataUpdated', handleStorageChange);
    };
  }, []);

  // Calculate real statistics from actual leads data
  const leadsStats = useMemo(() => {
    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter(lead => lead.stage === 'new' || lead.status === 'new').length;
    const duplicateLeads = allLeads.filter(lead => lead.isDuplicate).length;
    const pendingLeads = allLeads.filter(lead => lead.stage === 'in-progress' || lead.status === 'in-progress').length;
    const coldCallLeads = allLeads.filter(lead => lead.source === 'direct' || lead.source === 'cold-call').length;

    return {
      total: totalLeads,
      new: newLeads,
      duplicate: duplicateLeads,
      pending: pendingLeads,
      coldCall: coldCallLeads
    };
  }, [allLeads]);

  const quickNumbers = [
    {
      title: 'All Leads',
      value: leadsStats.total.toLocaleString(),
      icon: '👥',
      color: 'text-blue-800',
      bgColor: 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600',
      borderColor: 'border-blue-400 dark:border-blue-500',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
      glowColor: 'shadow-blue-300/50 dark:shadow-blue-500/25',
      accentColor: 'from-blue-200 to-blue-300',
      subtitle: `${t('of all system leads')}`
    },
    {
      title: 'Duplicate Leads',
      value: leadsStats.duplicate.toLocaleString(),
      icon: '🔄',
      color: 'text-red-800',
      bgColor: 'bg-gradient-to-br from-red-100 via-red-200 to-red-300 dark:from-red-800 dark:via-red-700 dark:to-red-600',
      borderColor: 'border-red-400 dark:border-red-500',
      iconBg: 'bg-red-600 dark:bg-red-500',
      glowColor: 'shadow-red-300/50 dark:shadow-red-500/25',
      accentColor: 'from-red-200 to-red-300',
      subtitle: `${leadsStats.total > 0 ? ((leadsStats.duplicate / leadsStats.total) * 100).toFixed(1) : 0}% ${t('of all system leads')}`
    },
    {
      title: 'New Leads',
      value: leadsStats.new.toLocaleString(),
      icon: '✨',
      color: 'text-green-800',
      bgColor: 'bg-gradient-to-br from-green-100 via-green-200 to-green-300 dark:from-green-800 dark:via-green-700 dark:to-green-600',
      borderColor: 'border-green-400 dark:border-green-500',
      iconBg: 'bg-green-600 dark:bg-green-500',
      glowColor: 'shadow-green-300/50 dark:shadow-green-500/25',
      accentColor: 'from-green-200 to-green-300',
      subtitle: `${leadsStats.total > 0 ? ((leadsStats.new / leadsStats.total) * 100).toFixed(1) : 0}% ${t('of all system leads')}`
    },
    {
      title: 'Cold Calls',
      value: leadsStats.coldCall.toLocaleString(),
      icon: '📞',
      color: 'text-orange-800',
      bgColor: 'bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 dark:from-orange-800 dark:via-orange-700 dark:to-orange-600',
      borderColor: 'border-orange-400 dark:border-orange-500',
      iconBg: 'bg-orange-600 dark:bg-orange-500',
      glowColor: 'shadow-orange-300/50 dark:shadow-orange-500/25',
      accentColor: 'from-orange-200 to-orange-300',
      subtitle: `${leadsStats.total > 0 ? ((leadsStats.coldCall / leadsStats.total) * 100).toFixed(1) : 0}% ${t('of all system leads')}`
    },
    {
      title: 'Pending Leads',
      value: leadsStats.pending.toLocaleString(),
      icon: '⏳',
      color: 'text-yellow-500',
      subtitle: `${leadsStats.total > 0 ? ((leadsStats.pending / leadsStats.total) * 100).toFixed(1) : 0}% ${t('of all system leads')}`
    }
  ];

  const pieChartData = [
    { name: 'New', value: 400, color: '#3b82f6' },
    { name: 'Contacted', value: 300, color: '#10b981' },
    { name: 'Qualified', value: 200, color: '#f97316' },
    { name: 'Proposal', value: 150, color: '#8b5cf6' },
    { name: 'Won', value: 100, color: '#ef4444' },
    { name: 'Lost', value: 50, color: '#6b7280' },
  ];

  return (
    <>
      
      
          <div className="mt-4 mb-6">
            <div className={`relative inline-flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2`}>
              <span aria-hidden className="inline-block w-1.5 h-6 rounded bg-blue-500"></span>
              <h1 className="page-title text-2xl font-bold text-primary">{t('Dashboard')}</h1>
              <span
                aria-hidden
                className="absolute block h-[2px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent"
                style={{
                  width: 'calc(100% + 8px)',
                  left: i18n.language === 'ar' ? 'auto' : '-4px',
                  right: i18n.language === 'ar' ? '-4px' : 'auto',
                  bottom: '-6px'
                }}
              ></span>
            </div>
          </div>
          <section 
            className="p-4 rounded-xl shadow-lg glass-panel filter-card w-full mb-8"
          >
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-black' : 'text-white'}`}>
                  {t('Filter Options')}
                </h3>
              </div>
              {/* Reset Button - Moved to top right */}
              <button onClick={() => { setSelectedManager(''); setSelectedEmployee(''); setDateFrom(''); setDateTo(''); }} className="btn-reset flex items-center gap-2 font-medium transform hover:scale-105 transition-all duration-200 focus:outline-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('Reset')}
              </button>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Manager Filter */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('Manager')}
                </label>
                <SearchableSelect
                  value={selectedManager}
                  onChange={setSelectedManager}
                  placeholder={t('Select Manager')}
                  className="w-full lm-input"
                >
                  <option value="Manager 1">Manager 1</option>
                  <option value="Manager 2">Manager 2</option>
                  <option value="Manager 3">Manager 3</option>
                </SearchableSelect>
              </div>

              {/* Employees Filter */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('Employees')}
                </label>
                <SearchableSelect
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  placeholder={t('Select Employee')}
                  className="w-full lm-input"
                >
                  <option value="Employee 1">Employee 1</option>
                  <option value="Employee 2">Employee 2</option>
                  <option value="Employee 3">Employee 3</option>
                </SearchableSelect>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('From Date')}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  lang={i18n.language === 'ar' ? 'ar-EG' : 'en-US'}
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={t('Date Input Placeholder')}
                  className="lm-input w-full"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('To Date')}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  lang={i18n.language === 'ar' ? 'ar-EG' : 'en-US'}
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={t('Date Input Placeholder')}
                  className="lm-input w-full"
                />
              </div>
            </div>
          </section>

          
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'}`}>{t('Quick Numbers')}</h2>
            </div>
            {stageDefs.length > maxInitialStages ? (
              <button 
                onClick={() => {
                  if (isMobileQuick) {
                    setShowAllQuick(v => !v);
                  } else if (isDesktopQuick) {
                    setShowAllDesktopQuick(v => !v);
                  } else {
                    setShowAllQuick(v => !v);
                  }
                }}
                className="btn btn-primary"
              >
                {(isMobileQuick ? showAllQuick : (isDesktopQuick ? showAllDesktopQuick : showAllQuick)) ? t('Show Less') : t('Show More')}
              </button>
            ) : null}
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16`}>
            {(() => {
              const newCount = allLeads.filter(l => (l.stage === 'new' || l.status === 'new')).length;
              const duplicateCount = allLeads.filter(l => (l.isDuplicate || (l.duplicateStatus === 'duplicate'))).length;
              const pendingCount = allLeads.filter(l => (l.stage === 'in-progress' || l.status === 'in-progress' || l.status === 'pending')).length;
              const followUpCount = allLeads.filter(l => ((l.callType === 'follow-up') || (l.stage === 'follow-up') || (l.status === 'follow-up'))).length;

              const totalCard = (
                <div
                  key={'__fixed_total__'}
                  className={`relative overflow-hidden rounded-2xl p-4 group ${
                    isLight
                      ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-100/60 via-blue-100/40 to-blue-100/30 backdrop-blur-sm shadow-blue-300/30'
                      : 'border-2 border-blue-500 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 shadow-blue-500/25'
                  } shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500`}
                >
                  <div className="absolute inset-0 opacity-15">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isLight ? 'from-blue-200/40 to-blue-300/30' : 'from-blue-200 to-blue-300'} rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-700`}></div>
                    <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${isLight ? 'from-blue-200/40 to-blue-300/30' : 'from-blue-200 to-blue-300'} rounded-full transform -translate-x-12 translate-y-12 group-hover:scale-110 transition-transform duration-500`}></div>
                  </div>
                  <div className="relative z-20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-gray-900' : 'text-gray-300'}`}>{t('Total Leads')}</span>
                        <div className={`text-3xl font-black mb-2 tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>{allLeads.length}</div>
                      </div>
                      <div className={`flex items-center justify-center w-12 h-12 ${isLight ? 'bg-blue-600/80' : 'bg-blue-500'} rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-white/30`}>
                        <span className="text-4xl text-white">👥</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              );

              const fixedCards = [
                {
                  key: '__fixed_new__',
                  title: t('New'),
                  count: newCount,
                  percent: allLeads.length > 0 ? Math.round((newCount / allLeads.length) * 100) : 0,
                  icon: '✨',
                  color: 'green',
                  borderClass: 'border-green-400 dark:border-green-500',
                },
                {
                  key: '__fixed_duplicate__',
                  title: t('Duplicate'),
                  count: duplicateCount,
                  percent: allLeads.length > 0 ? Math.round((duplicateCount / allLeads.length) * 100) : 0,
                  icon: '🔄',
                  color: 'red',
                  borderClass: 'border-red-400 dark:border-red-500',
                },
                {
                  key: '__fixed_pending__',
                  title: t('Pending'),
                  count: pendingCount,
                  percent: allLeads.length > 0 ? Math.round((pendingCount / allLeads.length) * 100) : 0,
                  icon: '⏳',
                  color: 'yellow',
                  borderClass: 'border-yellow-400 dark:border-yellow-500',
                },
                {
                  key: '__fixed_followup__',
                  title: t('Follow-up'),
                  count: followUpCount,
                  percent: allLeads.length > 0 ? Math.round((followUpCount / allLeads.length) * 100) : 0,
                  icon: '📞',
                  color: 'purple',
                  borderClass: 'border-purple-400 dark:border-purple-500',
                },
              ].map(({ key, title, count, percent, icon, color, borderClass }) => {
                const style = COLOR_STYLES[color];
                return (
                  <div
                    key={key}
                    className={`relative overflow-hidden rounded-2xl p-4 group ${isLight ? style.containerLight : style.containerDark} border-2 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500`}
                  >
                    <div className="absolute inset-0 opacity-15">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isLight ? style.patternFromLight : style.patternFrom} ${isLight ? style.patternToLight : style.patternTo} rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-700`}></div>
                      <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${isLight ? style.patternFromLight : style.patternFrom} ${isLight ? style.patternToLight : style.patternTo} rounded-full transform -translate-x-12 translate-y-12 group-hover:scale-110 transition-transform duration-500`}></div>
                    </div>
                    <div className="relative z-20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-2">
                          <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-gray-900' : 'text-gray-300'}`}>{title}</span>
                          <div className={`text-3xl font-black mb-1 tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>{count}</div>
                          <div className={`${isLight ? 'text-base font-bold bg-[var(--lm-muted-surface)] text-[var(--lm-subtext)] inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-[var(--lm-border)]' : 'text-base font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600'}`}>
                            <span>٪</span>
                            <span>{percent}%</span>
                          </div>
                        </div>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-white/30 ${isLight ? style.iconBgLight : style.iconBgDark}`}>
                          <span className="text-4xl text-white">{icon}</span>
                        </div>
                      </div>
                      <div className={`${
                        isLight
                      ? `text-base font-semibold px-3 py-2 rounded-xl border ${style.badgeLightBg} ${style.badgeLightText} ${style.badgeLightBorder}`
                          : 'text-base text-gray-600 dark:text-gray-400 font-semibold bg-gray-100/80 dark:bg-gray-700/80 px-3 py-2 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-600'
                      }`}>
                        {t('Stage share of total')}: {percent}%
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                );
              });

              return [totalCard, ...fixedCards];
            })()}
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12 mt-8">
            <div className="lg:col-span-2">
              <DelayLeads dateFrom={dateFrom} dateTo={dateTo} selectedEmployee={selectedEmployee || selectedManager} />
            </div>
            <div className="lg:col-span-1">
              <div className="p-4 glass-panel h-full overflow-auto rounded-lg shadow-md">
                <div className="best-section-wrapper">
                  <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-3`}>
                    <span aria-hidden className="inline-block w-1 h-5 rounded bg-blue-500"></span>
                    <h3 className="text-xl font-semibold text-primary">{t('The Best')}</h3>
                  </div>
                  <p className={`text-sm mb-4 ${isLight ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{t('Your top agents for the number of actions.')}</p>
                  
                  {(() => {
                    const [bestAgentFilter, setBestAgentFilter] = useState('all');
                    
                    const agentData = {
                      all: [
                        { id: 1, name: t('Youssef Hemeda'), avatar: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><rect width=\'100%\' height=\'100%\' fill=\'%239ca3af\'/><text x=\'50%\' y=\'58%\' font-family=\'system-ui,Segoe UI,Arial\' font-size=\'18\' fill=\'white\' text-anchor=\'middle\'>Y</text></svg>', score: 3329, isCrowned: true },
                        { id: 2, name: t('Osama Sales'), avatar: '', score: 1968, isCrowned: false },
                        { id: 3, name: t('Engaz CRM Demo'), avatar: '', score: 1661, isCrowned: false }
                      ],
                      today: [
                        { id: 1, name: t('Osama Sales'), avatar: '', score: 245, isCrowned: true },
                        { id: 2, name: t('Youssef Hemeda'), avatar: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><rect width=\'100%\' height=\'100%\' fill=\'%239ca3af\'/><text x=\'50%\' y=\'58%\' font-family=\'system-ui,Segoe UI,Arial\' font-size=\'18\' fill=\'white\' text-anchor=\'middle\'>Y</text></svg>', score: 187, isCrowned: false },
                        { id: 3, name: t('Ahmed Ibrahim'), avatar: '', score: 142, isCrowned: false }
                      ],
                      weekly: [
                        { id: 1, name: t('Youssef Hemeda'), avatar: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><rect width=\'100%\' height=\'100%\' fill=\'%239ca3af\'/><text x=\'50%\' y=\'58%\' font-family=\'system-ui,Segoe UI,Arial\' font-size=\'18\' fill=\'white\' text-anchor=\'middle\'>Y</text></svg>', score: 1245, isCrowned: true },
                        { id: 2, name: t('Engaz CRM Demo'), avatar: '', score: 876, isCrowned: false },
                        { id: 3, name: t('Osama Sales'), avatar: '', score: 654, isCrowned: false }
                      ],
                      monthly: [
                        { id: 1, name: t('Youssef Hemeda'), avatar: 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><rect width=\'100%\' height=\'100%\' fill=\'%239ca3af\'/><text x=\'50%\' y=\'58%\' font-family=\'system-ui,Segoe UI,Arial\' font-size=\'18\' fill=\'white\' text-anchor=\'middle\'>Y</text></svg>', score: 3329, isCrowned: true },
                        { id: 2, name: t('Osama Sales'), avatar: '', score: 1968, isCrowned: false },
                        { id: 3, name: t('Engaz CRM Demo'), avatar: '', score: 1661, isCrowned: false }
                      ]
                    };
                    
                    const currentData = agentData[bestAgentFilter];
                    const topAgent = currentData[0];

                    return (
                      <>
                        <div className="bg-yellow-50 dark:bg-yellow-800/30 p-3 rounded-lg flex items-center justify-between mb-4 border border-white dark:border-yellow-700">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative">
                              {topAgent.avatar ? (
                                <img className="w-10 h-10 rounded-full" src={topAgent.avatar} alt={topAgent.name} />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                  {topAgent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-xs">👑</span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 dark:text-gray-100 truncate">{topAgent.name}</p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-gray-300">{topAgent.score.toLocaleString()} {t('actions')}</p>
                            </div>
                          </div>
                          <div className="text-2xl">🏆</div>
                        </div>
                        
                        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                          {[
                            { key: 'all', label: t('All Time') },
                            { key: 'monthly', label: t('Monthly') },
                            { key: 'weekly', label: t('Weekly') },
                            { key: 'today', label: t('Today') }
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => setBestAgentFilter(key)}
                              className={`flex-1 px-2 py-1 text-xs rounded-md transition-all ${
                                bestAgentFilter === key
                                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          {currentData.map((agent, index) => (
                            <div key={agent.id} className={`flex items-center gap-3 p-2 rounded-lg ${isLight ? 'bg-[var(--lm-muted-surface)] border border-[var(--lm-border)] hover:bg-[var(--lm-surface)]' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'} transition-colors`}>
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {index + 1}
                              </div>
                              <div className="relative">
                                {agent.avatar ? (
                                  <img className="w-8 h-8 rounded-full" src={agent.avatar} alt={agent.name} />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                    {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                )}
                                {agent.isCrowned && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-xs">👑</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{agent.name}</p>
                                <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{agent.score.toLocaleString()} {t('actions')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* Last Comments & Recent Phone Calls (moved up) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="p-4 glass-panel rounded-lg shadow-md">
              <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-4`}>
                <span aria-hidden className="inline-block w-1 h-5 rounded bg-blue-500"></span>
                <h3 className="text-2xl font-bold text-primary">{t('Last Comments')}</h3>
              </div>
              <Comments employee={selectedEmployee || selectedManager} dateFrom={dateFrom} dateTo={dateTo} />
            </div>
            <div className="p-4 glass-panel rounded-lg shadow-md">
              <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-4`}>
                <span aria-hidden className="inline-block w-1 h-5 rounded bg-blue-500"></span>
                <h3 className="text-2xl font-bold text-primary">{t('Recent Phone Calls')}</h3>
              </div>
              <RecentPhoneCalls employee={selectedEmployee || selectedManager} dateFrom={dateFrom} dateTo={dateTo} />
            </div>
          </section>
          {/* Leads Status (3), Active Users (4), Active Campaigns (5) in 12 cols - moved above Leads Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 items-stretch">
            {/* Active Users (first) */}
            <div ref={usersPanelRef} className="p-3 glass-panel rounded-lg shadow-md h-full lg:col-span-4" style={leadsPanelHeight ? { maxHeight: `${leadsPanelHeight}px` } : undefined}>
              <ActiveUsersChart />
            </div>

            {/* Leads Status (second) */}
            <div ref={leadsPanelRef} className="p-3 glass-panel rounded-lg shadow-md lg:col-span-3 h-full flex flex-col min-h-0">
              <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-2`}>
                <span aria-hidden className="inline-block w-1 h-4 rounded bg-blue-500"></span>
                <h3 className="text-lg font-bold text-primary">{t('Leads Status')}</h3>
              </div>

              {/* Enhanced Leads Statistics */}
              <div className="flex-1 min-h-0 grid grid-rows-4 gap-2">
                <LeadsStatsCard
                  title={t('Total Leads')}
                  value="16,766"
                  change="+12.5%"
                  changeType="positive"
                  icon="👥"
                  color="bg-blue-500"
                  compact
                />
                <LeadsStatsCard
                  title={t('Conversion Rate')}
                  value="24.3%"
                  change="+3.2%"
                  changeType="positive"
                  icon="📈"
                  color="bg-green-500"
                  compact
                />
                <LeadsStatsCard
                  title={t('Avg Response Time')}
                  value="2.4h"
                  change="-15min"
                  changeType="positive"
                  icon="⏱️"
                  color="bg-purple-500"
                  compact
                />
                <LeadsStatsCard
                  title={t('Hot Leads')}
                  value="253"
                  change="+18"
                  changeType="positive"
                  icon="🔥"
                  color="bg-red-500"
                  compact
                />
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="p-3 glass-panel rounded-lg shadow-md lg:col-span-5 h-full">
              <ActiveCampaignsCard employee={selectedEmployee || selectedManager} dateFrom={dateFrom} dateTo={dateTo} />
            </div>
          </div>
          {/* Leads Analysis Section (Toolbar style like screenshot) */}
          <div className="grid grid-cols-1 gap-4 mb-12">
            <div className="col-span-1 p-4 glass-panel rounded-lg shadow-md">
              <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-3`}>
                <span aria-hidden className="inline-block w-1 h-5 rounded bg-blue-500"></span>
                <h3 className="text-2xl font-bold text-primary">{t('Leads Analysis')}</h3>
              </div>

              {/* Top toolbar (chart type only) */}
              <div className="flex flex-wrap items-center gap-2 mb-3 justify-end">
                <span className={`${isLight ? 'text-blue-700 font-semibold' : 'dark:text-gray-300'} text-sm`}>
                  {leadsChartType === 'bar'
                    ? (i18n.language === 'ar' ? 'رسم بياني عمودي' : 'Bar Chart')
                    : leadsChartType === 'stackedBar'
                      ? (i18n.language === 'ar' ? 'رسم بياني عمودي مكدس' : 'Stacked Bar Chart')
                      : leadsChartType === 'line'
                        ? (i18n.language === 'ar' ? 'رسم بياني خطي' : 'Line Chart')
                        : (i18n.language === 'ar' ? 'رسم بياني دائري' : 'Pie Chart')}
                </span>
                {/* Chart type buttons - Enhanced Design */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* Bar Chart Button */}
                  <button 
                    onClick={() => setLeadsChartType('bar')} 
                    className={`
                      group relative flex items-center justify-center px-3 py-2 rounded-md transition-all duration-300 ease-in-out
                      ${leadsChartType === 'bar' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105'
                      }
                      border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500
                    `}
                    title={i18n.language === 'ar' ? 'رسم بياني عمودي' : 'Bar Chart'}
                  >
                    <RiBarChart2Line className="w-4 h-4" />
                    {leadsChartType === 'bar' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>

                  {/* Stacked Bar Chart Button */}
                  <button 
                    onClick={() => setLeadsChartType('stackedBar')} 
                    className={`
                      group relative flex items-center justify-center px-3 py-2 rounded-md transition-all duration-300 ease-in-out
                      ${leadsChartType === 'stackedBar' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 hover:text-green-600 dark:hover:text-green-400 hover:scale-105'
                      }
                      border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500
                    `}
                    title={i18n.language === 'ar' ? 'رسم بياني عمودي مكدس' : 'Stacked Bar Chart'}
                  >
                    <RiStackLine className="w-4 h-4" />
                    {leadsChartType === 'stackedBar' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>

                  {/* Line Chart Button */}
                  <button 
                    onClick={() => setLeadsChartType('line')} 
                    className={`
                      group relative flex items-center justify-center px-3 py-2 rounded-md transition-all duration-300 ease-in-out
                      ${leadsChartType === 'line' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105'
                      }
                      border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500
                    `}
                    title={i18n.language === 'ar' ? 'رسم بياني خطي' : 'Line Chart'}
                  >
                    <RiLineChartLine className="w-4 h-4" />
                    {leadsChartType === 'line' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </button>

                  {/* Pie Chart Button */}
                  <button 
                    onClick={() => setLeadsChartType('pie')} 
                    className={`
                      group relative flex items-center justify-center px-3 py-2 rounded-md transition-all duration-300 ease-in-out
                      ${leadsChartType === 'pie' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-105' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-600 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-105'
                      }
                      border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500
                    `}
                    title={i18n.language === 'ar' ? 'رسم بياني دائري' : 'Pie Chart'}
                  >
                    <RiPieChartLine className="w-4 h-4" />
                    {leadsChartType === 'pie' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                </div>

                

              </div>

              {/* Removed filter chips row per request */}

              {/* Chart */}
              <div className="h-auto">
                <LeadsAnalysisChart 
                  data={getDisplayChartData()}
                  chartType={leadsChartType}
                  filters={{ dataType: 'monthly', status: activeFilter, year: yearFilter, employee: selectedEmployee || selectedManager, dateFrom, dateTo }}
                />
              </div>
          </div>
          </div>

          <section className="grid grid-cols-1 gap-4 mt-4">
            <div className="lg:col-span-3">
              <div className="p-4 glass-panel h-full overflow-auto rounded-lg shadow-md">
                <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''} gap-2 mb-4`}>
                  <span aria-hidden className="inline-block w-1 h-5 rounded bg-blue-500"></span>
                  <h3 className="text-2xl font-bold text-primary">{t('Pipeline Analysis')}</h3>
                </div>
                <PipelineAnalysis selectedEmployee={selectedEmployee || selectedManager} dateFrom={dateFrom} dateTo={dateTo} />
              </div>
            </div>
          </section>

          
          
          {/* Leads Trend Analysis Section removed per request */}
          
          
    </>
  )
}
