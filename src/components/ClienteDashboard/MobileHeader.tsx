
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Menu } from 'lucide-react'
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
          <div className="relative">
            {/* Animação de destaque no fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-30 animate-pulse"></div>
            
            {/* Botão do menu destacado */}
            <SidebarTrigger className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-2 border-white shadow-lg rounded-xl p-2 transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            
            {/* Pequeno indicador visual */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-bounce"></div>
          </div>
        )}
        <h1 className="text-lg font-bold text-gray-800 truncate">
          {currentLabel}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ProfileDropdown />
      </div>
    </header>
  )
}
