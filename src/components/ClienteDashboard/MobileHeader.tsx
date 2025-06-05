
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
  tutoriais: 'Tutoriais',
  suporte: 'Suporte'
}

export function MobileHeader({ activeTab, onBack }: MobileHeaderProps) {
  const currentLabel = TAB_LABELS[activeTab as keyof typeof TAB_LABELS] || 'Painel do Cliente'

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <SidebarTrigger className="text-gray-700 hover:text-blue-600 transition-colors" />
        )}
        <h1 className="text-lg font-bold text-gray-800 truncate">
          {currentLabel}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ProfileDropdown />
        {!onBack && (
          <div className="hidden md:flex items-center gap-2">
            <SidebarTrigger className="text-gray-700 hover:text-blue-600 transition-colors" />
          </div>
        )}
      </div>
    </header>
  )
}
