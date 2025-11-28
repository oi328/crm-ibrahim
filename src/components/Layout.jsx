import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sidebar } from '@shared/components/Sidebar'
import Topbar from '@shared/components/Topbar'
import { Outlet } from 'react-router-dom'
import MobileSidebarToggle from './MobileSidebarToggle'

export default function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { width: 8px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; border-radius: 9999px; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb:hover { background-color: #1d4ed8; }
  `
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

  const alreadyHasSidebar = typeof document !== 'undefined' && !!document.getElementById('app-sidebar')

  return (
    <div className="app-glass-neon relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {!alreadyHasSidebar && (
        <Sidebar 
          className="" 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile overlay to close sidebar when clicking outside */}
      {(!alreadyHasSidebar && isMobileSidebarOpen) && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
          role="button"
        />
      )}

      {/* Topbar fixed above content */}
      {!alreadyHasSidebar && (
        <Topbar 
          onMobileToggle={() => {
            setIsMobileSidebarOpen(v => !v)
          }}
          mobileSidebarOpen={isMobileSidebarOpen}
        />
      )}

      {/* Content area (scroll container) */}
      <div
        className="content-container overflow-auto sidebar-scrollbar scrollbar-thin-blue"
      >
        <style>{SCROLLBAR_CSS}</style>
         <main className="flex-1 pt-0 px-0 pb-0 mt-0 ml-0">
          <div className="w-full page-title-auto">
            {children}
            <Outlet />
          </div>
         </main>
      </div>
    </div>
  )
}
