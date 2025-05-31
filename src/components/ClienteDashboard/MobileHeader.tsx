
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
    <header className="flex items-center justify-between p-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-card-foreground truncate">
          {currentLabel}
        </h1>
      </div>
      
      <div className="hidden md:flex items-center gap-2">
        <SidebarTrigger />
      </div>
    </header>
  )
}
