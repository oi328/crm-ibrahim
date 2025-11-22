import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import Topbar from './Topbar'
import MobileSidebarToggle from './MobileSidebarToggle'

export default function Layout({ children }) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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
         <main className="flex-1 overflow-auto sidebar-scrollbar pt-2 sm:pt-3 lg:pt-4 px-3 sm:px-4 lg:px-6 pb-4 mt-0 ml-0">
           <div className="w-full">
             {children}
           </div>
         </main>
      </div>
    </div>
  )
}