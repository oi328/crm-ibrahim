import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppSidebar from '@shared/components/AppSidebar'
import Topbar from '@shared/components/Topbar'

export default function Layout({ children }) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  // إزالة منطق توسعة/انكماش السايدبار لجعله ثابتًا دائمًا

  // قفل تمرير الصفحة عند فتح السايدبار في الموبايل فقط
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile && isMobileSidebarOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isMobileSidebarOpen])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobileView(e.matches)
    mq.addEventListener('change', handler)
    setIsMobileView(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="app-glass-neon relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] overflow-x-hidden">
      {/* Topbar fixed at root level (hidden on mobile when sidebar open) */}
      <div className={`${isMobileSidebarOpen && isMobileView ? 'hidden md:block' : ''}`}>
        <Topbar 
          onMobileToggle={() => {
            setIsMobileSidebarOpen(v => !v)
          }}
          mobileSidebarOpen={isMobileSidebarOpen}
        />
      </div>

      {/* Sidebar (desktop pinned, mobile slides via open state) */}
      <AppSidebar 
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Content area (hidden on mobile when sidebar open) */}
      <div
        className={`content-container relative z-[10] pt-16 min-h-screen w-full `}
      >
         {/* Main content */}
         <main className="flex-1 overflow-auto sidebar-scrollbar pt-2 sm:pt-3 lg:pt-4 px-3 sm:px-4 lg:px-6 pb-4 mt-0 ml-0">
           <div className="w-full">
             {children ?? <Outlet />}
           </div>
         </main>
      </div>
    </div>
  )
}
