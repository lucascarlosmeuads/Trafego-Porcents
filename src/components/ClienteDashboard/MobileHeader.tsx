
import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface MobileHeaderProps {
  activeTab: string
}

export function MobileHeader({ activeTab }: MobileHeaderProps) {
  const { user } = useAuth()

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Painel Principal'
      case 'briefing':
        return 'Formulário'
      case 'arquivos':
        return 'Materiais'
      case 'suporte':
        return 'Suporte'
      case 'comissao':
        return 'Comissão'
      case 'site':
        return 'Site'
      case 'vendas':
        return 'Métricas'
      case 'steps':
        return 'Guia Completo'
      case 'chat':
        return 'Chat'
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
