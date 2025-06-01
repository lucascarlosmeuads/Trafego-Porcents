
import React from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface ResponsiveTableWrapperProps {
  children: React.ReactNode
}

export function ResponsiveTableWrapper({ children }: ResponsiveTableWrapperProps) {
  return (
    <div className="w-full">
      {/* Desktop: Normal scroll */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          {children}
        </div>
      </div>
      
      {/* Mobile/Tablet: Enhanced scroll with ScrollArea */}
      <div className="block lg:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="min-w-[800px]">
            {children}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
