
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'
import { VendedorSidebar } from './VendedorDashboard/VendedorSidebar'
import { SimplifiedSalesReport } from './VendedorDashboard/SimplifiedSalesReport'
import { VendedorLeadsPanel } from './VendedorDashboard/VendedorLeadsPanel'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

export function VendedorDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, totalClientes, loading } = useSimpleSellerData(user?.email || '')
  const [activeTab, setActiveTab] = useState('dashboard')
  const isMobile = useIsMobile()

  const renderContent = () => {
    switch (activeTab) {
      case 'leads-parceria':
        return <VendedorLeadsPanel />
      default:
        return <SimplifiedSalesReport clientes={clientes} loading={loading} />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VendedorSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <header className="bg-card shadow-sm border-b sticky top-0 z-40 w-full">
            <div className={`flex justify-between items-center ${
              isMobile ? 'py-3 px-3' : 'py-4 px-4 sm:px-6 lg:px-8'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <SidebarTrigger className={`flex-shrink-0 ${isMobile ? 'w-8 h-8' : ''}`} />
                <div className="min-w-0 flex-1">
                  <h1 className={`${
                    isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'
                  } font-bold text-foreground truncate`}>
                    {activeTab === 'leads-parceria' ? 'Leads de Parceria' : 'Relatório de Vendas'}
                  </h1>
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 ${
                    isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                  } text-muted-foreground`}>
                    <span>Painel do Vendedor</span>
                  </div>
                </div>
              </div>
              
              {!isMobile && (
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="truncate max-w-[120px] lg:max-w-none">{user?.email}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <main className={`flex-1 overflow-auto ${
            isMobile ? 'py-3 px-3' : 'py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8'
          }`}>
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
