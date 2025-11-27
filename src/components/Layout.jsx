import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import Topbar from './Topbar'
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

  return (
    <div className="app-glass-neon relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* Sidebar */}
      <Sidebar 
        className="" 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile overlay to close sidebar when clicking outside */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
          role="button"
        />
      )}

      {/* Content area */}
      <div
        className="content-container"
      >
        <style>{SCROLLBAR_CSS}</style>
        {/* Welcome moved to header overlay */}
        {/* Topbar */}
        <Topbar 
          onMobileToggle={() => {
            console.log('toggleMobileSidebar called, current state:', isMobileSidebarOpen)
            setIsMobileSidebarOpen(v => {
              console.log('toggleMobileSidebar new state will be:', !v)
              return !v
            })
          }}
          mobileSidebarOpen={isMobileSidebarOpen}
        />

         {/* Main content */}
         <main className="flex-1 overflow-auto sidebar-scrollbar scrollbar-thin-blue pt-0 px-3 sm:px-4 lg:px-6 pb-4 mt-0 ml-0">
          <div className="w-full page-title-auto">
            {children}
          </div>
         </main>
      </div>
    </div>
  )
}
