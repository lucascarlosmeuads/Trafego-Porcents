import { useAuth } from '@/hooks/useAuth'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

interface ClienteParceiraHeaderProps {
  activeTab: string
}

export function ClienteParceiraHeader({ activeTab }: ClienteParceiraHeaderProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const getTabTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      perfil: 'Meu Perfil',
      negocio: 'Meu Negócio',
      orcamento: 'Orçamento',
      planejamento: 'Planejamento',
      status: 'Status do Projeto'
    }
    return titles[tab] || 'Portal do Cliente'
  }

  return (
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
              {getTabTitle(activeTab)}
            </h1>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 ${
              isMobile ? 'text-xs' : 'text-xs sm:text-sm'
            } text-muted-foreground`}>
              <span>Portal do Cliente Lead</span>
              {activeTab !== 'dashboard' && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>Parceria de Tráfego</span>
                </>
              )}
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
  )
}