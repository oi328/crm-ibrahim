import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SearchModal({ onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [filterField, setFilterField] = useState('all'); // 'all' | 'lead' | 'mobile' | 'comment' | 'country'
  const [query, setQuery] = useState('');

  const applySearch = () => {
    // حالياً سنكتفي بعرض القيم في الـ console، ويمكن لاحقاً ربطها بالتطبيق
    console.log('Global Search:', { filterField, query });
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]" aria-label={t('Search')}>
      {/* طبقة خارجية لإغلاق القائمة عند النقر خارجها */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-label={isRTL ? 'إغلاق البحث' : 'Close search'}
      />

      {/* القائمة المنسدلة أسفل التوب بار */}
      <div
        className={`absolute top-14 ${isRTL ? 'left-4' : 'right-4'} w-[90vw] max-w-md rounded-xl backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        {/* رأس القائمة */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm font-semibold">
            {t('Search')}
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* محتوى البحث والفلتر */}
        <div className="px-4 py-3 space-y-3">
          {/* اختيار الحقل (الدولة أو الليد) */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 min-w-[70px]">
              {isRTL ? 'الفلتر' : 'Filter'}
            </label>
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="all">{isRTL ? 'الكل' : 'All'}</option>
              <option value="lead">{isRTL ? 'الليد' : 'Lead'}</option>
              <option value="mobile">{isRTL ? 'الموبايل' : 'Mobile'}</option>
              <option value="comment">{isRTL ? 'تعليق' : 'Comment'}</option>
              <option value="country">{isRTL ? 'الدولة' : 'Country'}</option>
            </select>
          </div>

          {/* حقل البحث */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 min-w-[70px]">
              {t('Search')}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRTL ? 'اكتب للبحث...' : 'Type to search...'}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* أزرار التحكم */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setQuery(''); }}
              className="text-xs px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              {isRTL ? 'مسح' : 'Clear'}
            </button>
            <button
              onClick={applySearch}
              className="text-xs px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isRTL ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}