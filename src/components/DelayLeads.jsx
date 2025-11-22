import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef, useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaEye, FaPhone, FaVideo } from 'react-icons/fa';
import { useTheme } from '../providers/ThemeProvider';
import EnhancedLeadDetailsModal from './EnhancedLeadDetailsModal';
import LeadHoverTooltip from './LeadHoverTooltip';

export const DelayLeads = ({ dateFrom, dateTo }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Tooltip state (click-based)
  const [hoveredLead, setHoveredLead] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const activeRowRef = useRef(null);

  // Load all leads from localStorage (shared with Leads page)
  const allLeadsFromStorage = useMemo(() => {
    try {
      const saved = localStorage.getItem('leadsData');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse leadsData from localStorage in DelayLeads.', e?.message);
      return [];
    }
  }, []);

  // Mock delayed leads for dashboard preview when storage is empty
  const MOCK_LEADS = [
    {
      id: 'DL-1001',
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '0501234567',
      company: 'Alpha Co',
      status: 'new',
      priority: 'high',
      source: 'Website',
      createdAt: new Date(Date.now() - 15*24*3600*1000).toISOString(), // 15 days ago
      lastContact: new Date(Date.now() - 9*24*3600*1000).toISOString(), // 9 days ago
      notes: 'اجتماع مؤجل؛ يحتاج متابعة',
    },
    {
      id: 'DL-1002',
      name: 'Sara Mohamed',
      email: 'sara@example.com',
      phone: '0559876543',
      company: 'Beta Ltd',
      status: 'in-progress',
      priority: 'medium',
      source: 'Facebook Ads',
      createdAt: new Date(Date.now() - 21*24*3600*1000).toISOString(),
      lastContact: new Date(Date.now() - 12*24*3600*1000).toISOString(),
      notes: 'لا يرد؛ حاولنا الاتصال أول مرة',
    },
    {
      id: 'DL-1003',
      name: 'Hassan Youssef',
      email: 'hassan@example.com',
      phone: '0563332211',
      company: 'Gamma Inc',
      status: 'qualified',
      priority: 'low',
      source: 'Referral',
      createdAt: new Date(Date.now() - 30*24*3600*1000).toISOString(),
      lastContact: new Date(Date.now() - 20*24*3600*1000).toISOString(),
      notes: 'إعادة جدولة الاجتماع الأسبوع القادم',
    },
  ];

  // Use storage if available; otherwise show mock preview data
  const allLeads = allLeadsFromStorage.length > 0 ? allLeadsFromStorage : MOCK_LEADS;

  // Load stage names from Settings (localStorage: crmStages)
  const stageNames = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crmStages') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        return saved
          .map((s) => (typeof s === 'string' ? s : s?.name))
          .filter(Boolean);
      }
      return ['new', 'qualified', 'in-progress', 'converted', 'lost'];
    } catch (e) {
      return ['new', 'qualified', 'in-progress', 'converted', 'lost'];
    }
  }, []);

  const delayThresholdDays = 7; // عدد الأيام قبل اعتبار الليد متأخرًا

  const deriveDelayCategory = (lead) => {
    const notes = (lead?.notes || '').toLowerCase();
    if (notes.includes('meeting') || notes.includes('اجتماع')) return 'followUpAfterMeeting';
    if (notes.includes('reschedule') || notes.includes('إعادة')) return 'rescheduleMeeting';
    if (notes.includes('no answer') || notes.includes('لا يرد')) return 'noAnswer1stCall';
    return 'followUp';
  };

  const isDelayedLead = (lead) => {
    const activeStatuses = ['new', 'qualified', 'in-progress'];
    if (!activeStatuses.includes(lead?.status)) return false;
    const lastActionStr = lead?.lastContact || lead?.createdAt;
    const lastAction = new Date(lastActionStr);
    if (isNaN(lastAction)) return false;
    const now = new Date();
    const diffDays = Math.floor((now - lastAction) / (1000 * 60 * 60 * 24));
    return diffDays > delayThresholdDays;
  };

  // Project delayed leads into the UI shape used by this component
  const delayLeads = useMemo(() => {
    const delayed = allLeads.filter(isDelayedLead);
    return delayed.map((l) => ({
      // keep original fields for tooltip actions
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      status: l.status,
      priority: l.priority,
      source: l.source,
      createdAt: l.createdAt,
      lastContact: l.lastContact,
      notes: l.notes,
      // fields used by DelayLeads table rendering
      leadName: l.name,
      mobile: l.phone ? `(${String(l.phone).slice(0, 3)}*****)` : '',
      stageDate: l.lastContact || l.createdAt,
      lastComment: l.notes || '',
      category: deriveDelayCategory(l),
    }));
  }, [allLeads]);

  // Helper: parse and compare dates safely
  const inDateRange = (leadDateStr) => {
    // If no range provided, include all
    if (!dateFrom && !dateTo) return true;
    const d = new Date(leadDateStr);
    if (isNaN(d)) return true; // If parsing fails, don't exclude
    // Normalize time for inclusive comparison
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (day < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(0, 0, 0, 0);
      if (day > to) return false;
    }
    return true;
  };

  // Calculate counts per stage within the selected date range
  const stageCounts = useMemo(() => {
    const init = Object.fromEntries(stageNames.map((n) => [n, 0]));
    const ranged = delayLeads.filter((lead) => inDateRange(lead.stageDate));
    ranged.forEach((lead) => {
      const statusKey = String(lead?.status || '').toLowerCase();
      const matched = stageNames.find((n) => String(n).toLowerCase() === statusKey);
      if (matched) init[matched] = (init[matched] || 0) + 1;
    });
    return init;
  }, [delayLeads, dateFrom, dateTo, stageNames]);

  // Filter leads based on selected stage and date range
  const filteredLeads = useMemo(() => {
    const ranged = delayLeads.filter((lead) => inDateRange(lead.stageDate));
    if (selectedFilter) {
      return ranged.filter((lead) => String(lead?.status || '').toLowerCase() === String(selectedFilter).toLowerCase());
    }
    return ranged;
  }, [delayLeads, selectedFilter, dateFrom, dateTo]);
  
  // Determine if we need to show scrollbar (when leads > 5)
  const showScroll = filteredLeads.length > 5;

  // Background colors matching the sidebar
  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-gray-100' : 'bg-gray-900';
  const textColor = isLight ? 'text-gray-800' : 'text-gray-100';

  // Click handler to show tooltip anchored above the clicked row/card
  const handleRowClick = (lead, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    activeRowRef.current = event.currentTarget;
    setHoveredLead(lead);
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowTooltip(true);
  };

  // Click-away to hide tooltip when clicking any other element
  useEffect(() => {
    const handleDocumentMouseDown = (e) => {
      if (!showTooltip) return;
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      if (activeRowRef.current && activeRowRef.current.contains(e.target)) return;
      setShowTooltip(false);
      setHoveredLead(null);
      activeRowRef.current = null;
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [showTooltip]);

  return (
    <div className={`p-4 ${bgColor} h-full overflow-auto rounded-lg shadow-md border ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor}`}>
      <h3 className="text-lg font-semibold mb-2">{t('Delay Leads')}</h3>
      
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {(() => {
          // Build filter buttons from Settings stages with counts
          const filterButtons = stageNames.map((name) => ({
            key: name,
            label: name,
            count: stageCounts[name] || 0,
          }));

          return (
            <>
              {/* Show first 2 buttons */}
              {filterButtons.slice(0, 2).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${selectedFilter === filter.key ? 'bg-blue-600 text-white' : isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{filter.label}</span>
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}

              {/* Show More button after the second button */}
              {!showAllFilters && filterButtons.length > 2 && (
                <button
                  onClick={() => setShowAllFilters(true)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded border-2 border-dashed ${isLight ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-blue-600 bg-blue-900/20 text-blue-400'}`}
                >
                  <span className="hidden sm:inline">{t('Show More')} ({filterButtons.length - 2})</span>
                  <span className="sm:hidden">+{filterButtons.length - 2}</span>
                </button>
              )}

              {/* Show remaining buttons when expanded */}
              {showAllFilters && filterButtons.slice(2).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${selectedFilter === filter.key ? 'bg-blue-600 text-white' : isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{filter.label}</span>
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}

              {selectedFilter && (
                <button
                  onClick={() => setSelectedFilter(null)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('Show All')}
                </button>
              )}

              {showAllFilters && (
                <button
                  onClick={() => setShowAllFilters(false)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded border-2 border-dashed ${isLight ? 'border-gray-300 bg-gray-50 text-gray-600' : 'border-gray-600 bg-gray-800 text-gray-400'}`}
                >
                  <span className="hidden sm:inline">{t('Show Less')}</span>
                  <span className="sm:hidden">−</span>
                </button>
              )}
            </>
          );
        })()}
      </div>
      
      {/* Table container with conditional max height and scrolling */}
      <div className={`${showScroll ? 'max-h-80 overflow-y-auto' : ''}`}>
        <div className="sm:hidden">
          {/* Mobile card layout */}
          {filteredLeads.map((lead, index) => (
            <div
              key={index}
              className={`p-3 mb-2 rounded-lg border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} cursor-pointer`}
              onClick={(e) => handleRowClick(lead, e)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-sm">{lead.leadName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{lead.mobile}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{lead.stageDate}</div>
              </div>
              <div className="text-sm mb-3">{lead.lastComment}</div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowLeadModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 p-1" 
                  title={t('preview')}
                >
                  <FaEye size={14} />
                </button>
                <button className="text-purple-600 hover:text-purple-900 p-1" title="Call">
                  <FaPhone size={14} />
                </button>
                <button className="text-green-600 hover:text-green-900 p-1" title="WhatsApp">
                  <FaWhatsapp size={14} />
                </button>
                <button className="text-gray-600 hover:text-gray-900 p-1" title="Email">
                  <FaEnvelope size={14} />
                </button>
                <button className="text-red-600 hover:text-red-900 p-1" title="Google Meet">
                  <FaVideo size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="hidden sm:block">
          {/* Desktop table layout */}
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase sticky top-0 ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <tr>
                <th scope="col" className="px-6 py-3">{t('Lead Name')}</th>
                <th scope="col" className="px-6 py-3">{t('Mobile')}</th>
                <th scope="col" className="px-6 py-3">{t('Stage Date')}</th>
                <th scope="col" className="px-6 py-3">{t('Last Comment')}</th>
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr
                  key={index}
                  className={`border-b ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                  onClick={(e) => handleRowClick(lead, e)}
                >
                  <td className="px-6 py-4">{lead.leadName}</td>
                  <td className="px-6 py-4">{lead.mobile}</td>
                  <td className="px-6 py-4">{lead.stageDate}</td>
                  <td className="px-6 py-4">{lead.lastComment}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1" 
                        title={t('preview')}
                      >
                        <FaEye size={16} />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 p-1" title="Call">
                        <FaPhone size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1" title="WhatsApp">
                        <FaWhatsapp size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1" title="Email">
                        <FaEnvelope size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1" title="Google Meet">
                        <FaVideo size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Lead Details Modal (same as Lead Management page) */}
      {showLeadModal && (
        <EnhancedLeadDetailsModal
          isOpen={showLeadModal}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          isArabic={i18n.language === 'ar'}
          theme={theme}
        />
      )}

      {/* Click-based Tooltip */}
      {showTooltip && hoveredLead && (
        <LeadHoverTooltip
          lead={hoveredLead}
          position={tooltipPosition}
          innerRef={tooltipRef}
          onAction={(action) => {
            setShowTooltip(false);
            setHoveredLead(null);
            switch (action) {
              case 'view':
                setSelectedLead(hoveredLead);
                setShowLeadModal(true);
                break;
              case 'call': {
                const raw = hoveredLead.phone || hoveredLead.mobile || '';
                const digits = String(raw).replace(/[^0-9]/g, '');
                if (digits) window.open(`tel:${digits}`);
                break;
              }
              case 'whatsapp': {
                const raw = hoveredLead.phone || hoveredLead.mobile || '';
                const digits = String(raw).replace(/[^0-9]/g, '');
                if (digits) window.open(`https://wa.me/${digits}`);
                break;
              }
              case 'email':
                if (hoveredLead.email) window.open(`mailto:${hoveredLead.email}`);
                break;
              case 'video':
                console.log('Video call:', hoveredLead);
                break;
              case 'delete':
                // DelayLeads is a derived/sample list; deleting is not supported here.
                alert(i18n.language === 'ar' ? 'الحذف غير متاح في هذه القائمة' : 'Delete not available in Delay Leads');
                break;
            }
          }}
          isRtl={i18n.language === 'ar'}
        />
      )}
    </div>
  );
};
