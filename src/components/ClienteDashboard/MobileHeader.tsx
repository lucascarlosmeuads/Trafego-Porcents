
import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface MobileHeaderProps {
  activeTab: string
}

export function MobileHeader({ activeTab }: MobileHeaderProps) {
  const { user } = useAuth()

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'briefing':
        return '1. Formulário'
      case 'arquivos':
        return '2. Materiais'
      case 'suporte':
        return '3. Suporte'
      case 'comissao':
        return '4. Comissão'
      case 'site':
        return '5. Site'
      case 'vendas':
        return '6. Métricas'
      case 'steps':
        return 'Guia Completo'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="bg-card border-b border-border px-4 py-3 mobile-safe">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TP</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground mobile-header">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
