
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ProfileDropdown } from '../ProfileDropdown'

interface MobileHeaderProps {
  activeTab: string
  onBack?: () => void
}

const TAB_LABELS = {
  overview: 'Visão Geral',
  briefing: 'Briefing',
  arquivos: 'Arquivos',
  vendas: 'Vendas',
  chat: 'Chat',
  tutoriais: 'Tutoriais'
}

export function MobileHeader({ activeTab, onBack }: MobileHeaderProps) {
  const currentLabel = TAB_LABELS[activeTab as keyof typeof TAB_LABELS] || 'Painel do Cliente'

  return (
    <header 
      className="flex items-center justify-between p-4 border-b border-trafego-border-subtle backdrop-blur-sm sticky top-0 z-40 shadow-sm"
      style={{backgroundColor: '#1a1a1a'}}
    >
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="text-trafego-text-primary hover:text-trafego-accent-primary hover:bg-trafego-bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <SidebarTrigger className="text-trafego-text-primary hover:text-trafego-accent-primary transition-colors" />
        )}
        <h1 className="text-lg font-bold text-trafego-text-primary truncate">
          {currentLabel}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ProfileDropdown />
        {!onBack && (
          <div className="hidden md:flex items-center gap-2">
            <SidebarTrigger className="text-trafego-text-primary hover:text-trafego-accent-primary transition-colors" />
          </div>
        )}
      </div>
    </header>
  )
}
