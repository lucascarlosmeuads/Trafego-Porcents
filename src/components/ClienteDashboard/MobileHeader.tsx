
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileSidebar } from './MobileSidebar'

interface MobileHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function MobileHeader({ activeTab, onTabChange, clienteInfo }: MobileHeaderProps) {
  const { user } = useAuth()

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'home':
        return 'Dashboard'
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
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 mobile-safe">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botão de Menu - Agora posicionado no canto superior esquerdo */}
          <MobileSidebar 
            activeTab={activeTab}
            onTabChange={onTabChange}
            clienteInfo={clienteInfo}
          />
          
          {/* Logo da Tráfego Por Cents */}
          <img 
            src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
            alt="Tráfego Por Cents" 
            className="h-8 w-auto object-contain"
          />
          
          <div>
            <h1 className="text-lg font-semibold text-white mobile-header">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
