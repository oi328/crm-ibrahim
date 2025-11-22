import React, { useMemo, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaTable, 
  FaListUl, 
  FaFilter, 
  FaSearch, 
  FaSlidersH, 
  FaUser, 
  FaCalendar, 
  FaDollarSign, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp 
} from 'react-icons/fa';
import { 
  HiOutlineChartBar, 
  HiOutlineChartPie, 
  HiOutlineTable, 
  HiOutlineViewList,
  HiOutlineAdjustments,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineX,
  HiOutlineFilter
} from 'react-icons/hi';
import { 
  BiBarChart, 
  BiLineChart, 
  BiPieChart, 
  BiTable, 
  BiListUl,
  BiSearch,
  BiSlider,
  BiUser,
  BiCalendar,
  BiDollar,
  BiX,
  BiFilter
} from 'react-icons/bi';
import { 
  RiBarChart2Line, 
  RiLineChartLine, 
  RiPieChartLine, 
  RiTable2, 
  RiListUnordered,
  RiSearchLine,
  RiUserLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiCloseLine,
  RiFilterLine
} from 'react-icons/ri';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const PipelineAnalysis = () => {
  const { t } = useTranslation();

  // Toolbar state
  const [selectedMeasure, setSelectedMeasure] = useState('count');
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'pie' | 'pivot' | 'list'
  const [aggregator, setAggregator] = useState('sum'); // 'sum' | 'avg' | 'min' | 'max'
  const [yearFilter, setYearFilter] = useState('2025');
  const [query, setQuery] = useState('');

  // Advanced search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    employee: '',
    dateFrom: '',
    dateTo: '',
    valueMin: '',
    valueMax: '',
    stage: '',
    leadName: ''
  });

  // Sample data
  const sampleData = [
    { date: '2025-01-01', employee: 'Osama Sales', leadName: 'Ahmed Ali', stage: 'New', value: 5000, prorated: 1000 },
    { date: '2025-01-02', employee: 'Youssef Hemeda', leadName: 'Sara Mohamed', stage: 'Qualified', value: 7500, prorated: 3750 },
    { date: '2025-01-03', employee: 'Ahmed Ibrahim', leadName: 'Omar Hassan', stage: 'Proposal', value: 12000, prorated: 9000 },
    { date: '2025-01-04', employee: 'Noura', leadName: 'Fatima Ahmed', stage: 'Negotiation', value: 8500, prorated: 6800 },
    { date: '2025-01-05', employee: 'Ali', leadName: 'Khaled Mahmoud', stage: 'Closed Won', value: 15000, prorated: 15000 },
    { date: '2025-01-06', employee: 'Osama Sales', leadName: 'Mona Saleh', stage: 'Closed Lost', value: 6000, prorated: 0 },
    { date: '2025-01-07', employee: 'Youssef Hemeda', leadName: 'Tamer Farouk', stage: 'New', value: 4500, prorated: 900 },
    { date: '2025-01-08', employee: 'Ahmed Ibrahim', leadName: 'Layla Nasser', stage: 'Qualified', value: 9000, prorated: 4500 },
    { date: '2025-01-09', employee: 'Noura', leadName: 'Youssef Ali', stage: 'Proposal', value: 11000, prorated: 8250 },
    { date: '2025-01-10', employee: 'Ali', leadName: 'Dina Mostafa', stage: 'Negotiation', value: 13500, prorated: 10800 }
  ];

  const labels = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const seriesLabels = ['Osama Sales', 'Youssef Hemeda', 'Ahmed Ibrahim', 'Noura', 'Ali'];

  // Advanced filter functions
  const updateAdvancedFilter = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setAdvancedFilters({
      employee: '',
      dateFrom: '',
      dateTo: '',
      valueMin: '',
      valueMax: '',
      stage: '',
      leadName: ''
    });
  };

  const applyFilters = () => {
    setShowAdvancedSearch(false);
    // The filters are already applied through the useMemo dependency
    // This function mainly serves to close the panel and provide user feedback
  };

  // Apply year filter to date labels
  const applyYearToLabel = (dateStr) => {
    const date = new Date(dateStr);
    date.setFullYear(parseInt(yearFilter));
    return date.toLocaleDateString();
  };

  // Filter data based on search query and advanced filters
  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      // Basic search filter
      const matchesBasicSearch = !query || 
        item.stage.toLowerCase().includes(query.toLowerCase()) ||
        item.leadName.toLowerCase().includes(query.toLowerCase());

      // Advanced filters
      const matchesEmployee = !advancedFilters.employee || item.employee === advancedFilters.employee;
      const matchesStage = !advancedFilters.stage || item.stage === advancedFilters.stage;
      const matchesLeadName = !advancedFilters.leadName || 
        item.leadName.toLowerCase().includes(advancedFilters.leadName.toLowerCase());
      
      // Value range filter
      const matchesValueMin = !advancedFilters.valueMin || item.value >= parseFloat(advancedFilters.valueMin);
      const matchesValueMax = !advancedFilters.valueMax || item.value <= parseFloat(advancedFilters.valueMax);
      
      // Date range filter (placeholder - would need proper date parsing)
      const matchesDateFrom = !advancedFilters.dateFrom || item.date >= advancedFilters.dateFrom;
      const matchesDateTo = !advancedFilters.dateTo || item.date <= advancedFilters.dateTo;

      return matchesBasicSearch && matchesEmployee && matchesStage && matchesLeadName && 
             matchesValueMin && matchesValueMax && matchesDateFrom && matchesDateTo;
    });
  }, [sampleData, query, advancedFilters]);

  // Aggregate data by stage
  const aggregatedData = useMemo(() => {
    const result = {};
    labels.forEach(label => {
      result[label] = filteredData
        .filter(item => item.stage === label)
        .reduce((sum, item) => {
          const value = selectedMeasure === 'count' ? 1 : 
                       selectedMeasure === 'value' ? item.value : item.prorated;
          return aggregator === 'sum' ? sum + value :
                 aggregator === 'avg' ? sum + value :
                 aggregator === 'min' ? Math.min(sum, value) :
                 aggregator === 'max' ? Math.max(sum, value) : sum + value;
        }, aggregator === 'min' ? Infinity : aggregator === 'max' ? -Infinity : 0);
      
      if (aggregator === 'avg') {
        const count = filteredData.filter(item => item.stage === label).length;
        result[label] = count > 0 ? result[label] / count : 0;
      }
    });
    return result;
  }, [filteredData, selectedMeasure, aggregator, labels]);

  // Chart data
  const barAggData = {
    labels,
    datasets: [{
      label: t(selectedMeasure),
      data: labels.map(label => aggregatedData[label] || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const lineData = {
    labels: filteredData.map(item => applyYearToLabel(item.date)),
    datasets: [{
      label: t(selectedMeasure),
      data: filteredData.map(item => selectedMeasure === 'count' ? 1 : 
                                   selectedMeasure === 'value' ? item.value : item.prorated),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const pieData = {
    labels,
    datasets: [{
      data: labels.map(label => aggregatedData[label] || 0),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  };

  // Chart options
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tickColor = isDark ? '#e5e7eb' : '#374151';
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: tickColor } },
      title: { display: true, text: `${t('Pipeline Analysis')} - ${t(selectedMeasure)} (${t('by Stage')})`, color: tickColor }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } },
      y: { beginAtZero: true, grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } }
    }
  };
  
  const optionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: tickColor } },
      title: { display: true, text: `${t('Pipeline Analysis')} - ${t(selectedMeasure)} (${t('Over Time')})`, color: tickColor }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } },
      y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } }
    }
  };

  // Pivot table data
  const pivotRows = useMemo(() => {
    return labels.map(stage => {
      const values = seriesLabels.map(employee => {
        const items = filteredData.filter(item => item.stage === stage && item.employee === employee);
        const value = items.reduce((sum, item) => {
          const val = selectedMeasure === 'count' ? 1 : 
                     selectedMeasure === 'value' ? item.value : item.prorated;
          return aggregator === 'sum' ? sum + val :
                 aggregator === 'avg' ? sum + val :
                 aggregator === 'min' ? Math.min(sum, val) :
                 aggregator === 'max' ? Math.max(sum, val) : sum + val;
        }, aggregator === 'min' ? Infinity : aggregator === 'max' ? -Infinity : 0);
        
        if (aggregator === 'avg' && items.length > 0) {
          return value / items.length;
        }
        return items.length === 0 && (aggregator === 'min' || aggregator === 'max') ? 0 : value;
      });
      
      const total = values.reduce((sum, val) => sum + val, 0);
      return { stage, values, total };
    });
  }, [filteredData, selectedMeasure, aggregator, labels, seriesLabels]);

  // List view data
  const listRows = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left group: Measures + chart type icons */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">{t('Measures')}:</label>
            <select
              value={selectedMeasure}
              onChange={(e) => setSelectedMeasure(e.target.value)}
              className="px-3 py-2 text-sm rounded-md bg-purple-600 text-white border border-purple-600 hover:bg-purple-700"
            >
              <option value="count">{t('Count')}</option>
              <option value="value">{t('Value')}</option>
              <option value="prorated">{t('Prorated Revenue')}</option>
            </select>

            {/* Chart type buttons */}
            <div className="flex gap-1 ml-3">
              <button
                onClick={() => setChartType('bar')}
                title={t('Bar')}
                aria-label={t('Bar')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 ${chartType === 'bar' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
              >
                <RiBarChart2Line className="text-lg" />
              </button>
              <button
                onClick={() => setChartType('line')}
                title={t('Line')}
                aria-label={t('Line')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 ${chartType === 'line' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400 hover:text-green-600'}`}
              >
                <RiLineChartLine className="text-lg" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                title={t('Pie')}
                aria-label={t('Pie')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 ${chartType === 'pie' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600'}`}
              >
                <RiPieChartLine className="text-lg" />
              </button>
              <button
                onClick={() => setChartType('pivot')}
                title={t('Pivot')}
                aria-label={t('Pivot')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 ${chartType === 'pivot' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:text-orange-600'}`}
              >
                <RiTable2 className="text-lg" />
              </button>
              <button
                onClick={() => setChartType('list')}
                title={t('List')}
                aria-label={t('List')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 ${chartType === 'list' ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:text-teal-600'}`}
              >
                <RiListUnordered className="text-lg" />
              </button>
            </div>
          </div>

          {/* Right group: Search + Advanced Search Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder={t('Search...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${showAdvancedSearch ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:text-indigo-600'}`}
              title={t('Advanced Search')}
            >
              <BiSlider className="text-lg" />
            </button>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">{t('Min/Max')}:</label>
            <select
              value={aggregator}
              onChange={(e) => setAggregator(e.target.value)}
              className="input px-3 py-2 text-sm"
            >
              <option value="sum">{t('Sum')}</option>
              <option value="avg">{t('Average')}</option>
              <option value="min">{t('Min')}</option>
              <option value="max">{t('Max')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">{t('Created on')}:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input px-3 py-2 text-sm"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BiSlider className="text-indigo-600 dark:text-indigo-400" />
                {t('Advanced Search Options')}
              </h3>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiUserLine className="text-blue-600 dark:text-blue-400" />
                  {t('Employee')}
                </label>
                <select
                  value={advancedFilters.employee}
                  onChange={(e) => updateAdvancedFilter('employee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">{t('All Employees')}</option>
                  <option value="Osama Sales">{t('Osama Sales')}</option>
                  <option value="Youssef Hemeda">{t('Youssef Hemeda')}</option>
                  <option value="Ahmed Ibrahim">{t('Ahmed Ibrahim')}</option>
                  <option value="Noura">{t('Noura')}</option>
                  <option value="Ali">{t('Ali')}</option>
                </select>
              </div>

              {/* Stage Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiFilterLine className="text-green-600 dark:text-green-400" />
                  {t('Stage')}
                </label>
                <select
                  value={advancedFilters.stage}
                  onChange={(e) => updateAdvancedFilter('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('All Stages')}</option>
                  {labels.map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Lead Name Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiSearchLine className="text-purple-600 dark:text-purple-400" />
                  {t('Lead Name')}
                </label>
                <input
                  type="text"
                  value={advancedFilters.leadName}
                  onChange={(e) => updateAdvancedFilter('leadName', e.target.value)}
                  placeholder={t('Enter lead name')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiCalendarLine className="text-orange-600 dark:text-orange-400" />
                  {t('Date From')}
                </label>
                <input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => updateAdvancedFilter('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiCalendarLine className="text-orange-600 dark:text-orange-400" />
                  {t('Date To')}
                </label>
                <input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => updateAdvancedFilter('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Value Range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <RiMoneyDollarCircleLine className="text-emerald-600 dark:text-emerald-400" />
                  {t('Value Range')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={advancedFilters.valueMin}
                    onChange={(e) => updateAdvancedFilter('valueMin', e.target.value)}
                    placeholder={t('Min')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={advancedFilters.valueMax}
                    onChange={(e) => updateAdvancedFilter('valueMax', e.target.value)}
                    placeholder={t('Max')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('Use filters to narrow down your search results')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 font-medium"
                >
                  {t('Clear All')}
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  {t('Apply Filters')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {chartType === 'bar' && (
        <div className="w-full h-72">
          <Bar options={barOptions} data={barAggData} />
        </div>
      )}

      {chartType === 'line' && (
        <div className="w-full h-72">
          <Line options={optionsBase} data={lineData} />
        </div>
      )}

      {chartType === 'pie' && (
        <div className="w-full h-72">
          <Pie options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { color: tickColor } },
              title: { display: true, text: `${t('Pipeline Analysis')} - ${t(selectedMeasure)} (${t('by Stage')})`, color: tickColor }
            }
          }} data={pieData} />
        </div>
      )}

      {chartType === 'pivot' && (
        <div className="w-full overflow-auto">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-md">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Stage')}</th>
                {seriesLabels.map((sl, i) => (
                  <th key={i} className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{sl}</th>
                ))}
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Total')} ({t(aggregator)})</th>
              </tr>
            </thead>
            <tbody>
              {pivotRows.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{row.stage}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-3 py-2 text-gray-700 dark:text-gray-300">{v}</td>
                  ))}
                  <td className="px-3 py-2 font-semibold">{Math.round(row.total * 100) / 100}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chartType === 'list' && (
        <div className="w-full overflow-auto">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-md">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Date')}</th>
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Employee')}</th>
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Lead name')}</th>
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Stage name')}</th>
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Value')}</th>
                <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{t('Prorated Revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {listRows.map((r, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{applyYearToLabel(r.date)}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.employee}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.leadName}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.stage}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.value}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.prorated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};