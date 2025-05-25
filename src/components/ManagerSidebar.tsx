import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface ManagerSidebarProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ManagerSidebar({ 
  selectedManager, 
  onManagerSelect, 
  activeTab, 
  onTabChange 
}: ManagerSidebarProps) {
  const { isAdmin } = useAuth()
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      fetchSolicitacoesPendentes()
    }
  }, [isAdmin])

  const fetchSolicitacoesPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_saque')
        .select('id')
        .eq('status_saque', 'pendente')

      if (!error && data) {
        setSolicitacoesPendentes(data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error)
    }
  }

  const handleManagerSelect = (email: string | null) => {
    onManagerSelect(email)
  }

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          {isAdmin ? 'Painel Admin' : 'Gestores'}
        </h2>
        
        {/* Abas para Admin */}
        {isAdmin && (
          <div className="space-y-2 mb-6">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => onTabChange('clientes')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'clientes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              👥 Clientes
            </button>
            
            <button
              onClick={() => onTabChange('problemas')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'problemas'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              ⚠️ Problemas
            </button>

            <button
              onClick={() => onTabChange('solicitacoes')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                activeTab === 'solicitacoes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <span>💸 Solicitações de Saque</span>
              {solicitacoesPendentes > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {solicitacoesPendentes}
                </Badge>
              )}
            </button>
          </div>
        )}

        {/* Lista de Gestores */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase">
            Gerenciar Gestores
          </h3>
          <button
            onClick={() => {
              onManagerSelect('__GESTORES__')
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedManager === '__GESTORES__'
                ? 'bg-primary text-primary-foreground'
                : 'text-card-foreground hover:bg-muted'
            }`}
          >
            ⚙️ Gestores
          </button>
        </div>

        <div className="space-y-2 mt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase">
            Filtros de Gestores
          </h3>
          <button
            onClick={() => handleManagerSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedManager === null
                ? 'bg-primary text-primary-foreground'
                : 'text-card-foreground hover:bg-muted'
            }`}
          >
            Todos os Gestores
          </button>
          <button
            onClick={() => handleManagerSelect('andreza@gestor.com')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedManager === 'andreza@gestor.com'
                ? 'bg-primary text-primary-foreground'
                : 'text-card-foreground hover:bg-muted'
            }`}
          >
            Andreza
          </button>
          <button
            onClick={() => handleManagerSelect('lucas.falcao@gestor.com')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedManager === 'lucas.falcao@gestor.com'
                ? 'bg-primary text-primary-foreground'
                : 'text-card-foreground hover:bg-muted'
            }`}
          >
            Lucas Falcão
          </button>
        </div>
      </div>
    </div>
  )
}
