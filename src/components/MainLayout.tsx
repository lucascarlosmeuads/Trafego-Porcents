
import { ReactNode, useState, useEffect } from 'react'

interface MainLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256) // 64 collapsed, 256 expanded

  // Listen for sidebar width changes
  useEffect(() => {
    const handleResize = () => {
      const sidebarElement = document.querySelector('[data-sidebar]')
      if (sidebarElement) {
        setSidebarWidth(sidebarElement.clientWidth)
      }
    }

    // Create observer to watch for sidebar width changes
    const observer = new MutationObserver(handleResize)
    const sidebarElement = document.querySelector('[data-sidebar]')
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      })
    }

    // Initial check
    handleResize()

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <div data-sidebar>
        {sidebar}
      </div>
      
      {/* Main Content with dynamic margin */}
      <div 
        className="transition-all duration-300 ease-in-out min-h-screen"
        style={{ 
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        <div className="p-6 w-full max-w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
