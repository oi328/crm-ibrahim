import { useTranslation } from 'react-i18next'
import { 
  RiTimeLine, 
  RiCircleFill, 
  RiRefreshLine,
  RiMoreLine,
  RiUserStarLine,
  RiUserSettingsLine
} from 'react-icons/ri'
import { useState } from 'react'

export default function ActiveUsersChart({ users = [] }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'
  const [refreshing, setRefreshing] = useState(false)
  const VISIBLE_USERS_COUNT = 6
  const ITEM_HEIGHT = 72 // approx item height in px

  const defaultUsers = [
    { 
      name: lang === 'ar' ? 'إبراهيم أحمد' : 'Ibrahim Ahmed', 
      active: true, 
      lastSeen: new Date(),
      role: lang === 'ar' ? 'مدير' : 'Manager',
      avatar: '👨‍💼'
    },
    { 
      name: lang === 'ar' ? 'آدم محمد' : 'Adam Mohamed', 
      active: false, 
      lastSeen: new Date(Date.now() - (3 * 60 + 25) * 60 * 1000),
      role: lang === 'ar' ? 'مطور' : 'Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'سارة علي' : 'Sara Ali', 
      active: true, 
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      role: lang === 'ar' ? 'مصممة' : 'Designer',
      avatar: '👩‍🎨'
    },
    { 
      name: lang === 'ar' ? 'محمد حسن' : 'Mohamed Hassan', 
      active: false, 
      lastSeen: new Date(Date.now() - (26 * 60 + 5) * 60 * 1000),
      role: lang === 'ar' ? 'محلل' : 'Analyst',
      avatar: '👨‍📊'
    },
    { 
      name: lang === 'ar' ? 'فاطمة خالد' : 'Fatima Khaled', 
      active: true, 
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      role: lang === 'ar' ? 'مسوقة' : 'Marketer',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'زينب حسام' : 'Zeinab Hossam', 
      active: true, 
      lastSeen: new Date(Date.now() - 7 * 60 * 1000),
      role: lang === 'ar' ? 'مديرة التسويق' : 'Marketing Manager',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'كريم صلاح' : 'Karim Salah', 
      active: false, 
      lastSeen: new Date(Date.now() - 180 * 60 * 1000),
      role: lang === 'ar' ? 'مطور أمان' : 'Security Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'هدى عبدالله' : 'Hoda Abdullah', 
      active: true, 
      lastSeen: new Date(Date.now() - 20 * 60 * 1000),
      role: lang === 'ar' ? 'مصممة جرافيك' : 'Graphic Designer',
      avatar: '👩‍🎨'
    },
    { 
      name: lang === 'ar' ? 'طارق فؤاد' : 'Tarek Fouad', 
      active: true, 
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      role: lang === 'ar' ? 'مهندس DevOps' : 'DevOps Engineer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'رنا سمير' : 'Rana Samir', 
      active: false, 
      lastSeen: new Date(Date.now() - 240 * 60 * 1000),
      role: lang === 'ar' ? 'كاتبة محتوى' : 'Content Writer',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'حسام الدين' : 'Hossam Eldeen', 
      active: true, 
      lastSeen: new Date(Date.now() - 10 * 60 * 1000),
      role: lang === 'ar' ? 'مطور موبايل' : 'Mobile Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'مريم عادل' : 'Mariam Adel', 
      active: false, 
      lastSeen: new Date(Date.now() - 300 * 60 * 1000),
      role: lang === 'ar' ? 'محاسبة' : 'Accountant',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'خالد وليد' : 'Khaled Waleed', 
      active: true, 
      lastSeen: new Date(Date.now() - 25 * 60 * 1000),
      role: lang === 'ar' ? 'مدير الموارد البشرية' : 'HR Manager',
      avatar: '👨‍💼'
    },
    { 
      name: lang === 'ar' ? 'دينا محمد' : 'Dina Mohamed', 
      active: true, 
      lastSeen: new Date(Date.now() - 6 * 60 * 1000),
      role: lang === 'ar' ? 'مطورة قواعد بيانات' : 'Database Developer',
      avatar: '👩‍💻'
    },
    { 
      name: lang === 'ar' ? 'عبدالرحمن أحمد' : 'Abdulrahman Ahmed', 
      active: false, 
      lastSeen: new Date(Date.now() - 150 * 60 * 1000),
      role: lang === 'ar' ? 'مهندس شبكات' : 'Network Engineer',
      avatar: '👨‍💻'
    }
  ]
  const dataUsers = users.length ? users : defaultUsers

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const formatHM = (d) => {
    try {
      return new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
    } catch {
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }

  const formatRelative = (d) => {
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    if (lang === 'ar') {
      if (hours <= 0) return `قبل ${rem} دقيقة`
      return `قبل ${hours} ساعة و${rem} دقيقة`
    }
    if (hours <= 0) return `${rem} min ago`
    return `${hours}h ${rem}m ago`
  }


  const activeCount = dataUsers.filter(u => u.active).length
  const totalCount = dataUsers.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <RiUserStarLine className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('Active Users')}</h3>
              <p className="text-blue-100 text-sm">
                {activeCount} {lang === 'ar' ? 'نشط من' : 'active of'} {totalCount} {lang === 'ar' ? 'مستخدمين' : 'users'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-105 ${refreshing ? 'animate-spin' : ''}`}
              title={t('Refresh')}
            >
              <RiRefreshLine className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar" style={{ maxHeight: VISIBLE_USERS_COUNT * ITEM_HEIGHT }}>
            <div className="p-2 space-y-2">
              {dataUsers.map((u, idx) => (
                <div 
                  key={idx} 
                  className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {u.avatar || u.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        <RiCircleFill className="w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</span>
                        {u.active && (
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
                            {lang === 'ar' ? 'متصل' : 'Online'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <RiUserSettingsLine className="text-xs" />
                        <span>{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <RiTimeLine className="text-xs" />
                      <span>{formatHM(u.lastSeen)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatRelative(u.lastSeen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                {activeCount} {lang === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">
                {totalCount - activeCount} {lang === 'ar' ? 'غير نشط' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {formatHM(new Date())}
          </div>
        </div>
      </div>
    </div>
  )
}