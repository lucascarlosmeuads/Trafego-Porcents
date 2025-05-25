
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react'

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
  const [problemasPendentes, setProblemasPendentes] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      fetchSolicitacoesPendentes()
      fetchProblemasPendentes()
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

  const fetchProblemasPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .not('descricao_problema', 'is', null)
        .neq('descricao_problema', '')

      if (!error && data) {
        setProblemasPendentes(data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar problemas pendentes:', error)
    }
  }

  const handleTabChange = (tab: string) => {
    // Limpar seleção de gestor ao mudar de aba
    onManagerSelect(null)
    onTabChange(tab)
  }

  const handleManagerSelect = (email: string | null) => {
    // Ir para aba de clientes ao selecionar gestor
    onTabChange('clientes')
    onManagerSelect(email)
  }

  const handleGestoresManagement = () => {
    // Ir para gestão de gestores
    onManagerSelect('__GESTORES__')
    onTabChange('clientes')
  }

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          {isAdmin ? 'Painel Admin' : 'Gestores'}
        </h2>
        
        {/* Menu Principal para Admin */}
        {isAdmin && (
          <div className="space-y-2 mb-6">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => handleTabChange('clientes')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'clientes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <Users size={16} />
              <span>Todos os Clientes</span>
            </button>
            
            <button
              onClick={handleGestoresManagement}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                selectedManager === '__GESTORES__'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <Settings size={16} />
              <span>Gestores</span>
            </button>

            <button
              onClick={() => handleTabChange('solicitacoes')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                activeTab === 'solicitacoes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>Solicitações de Saque</span>
              </div>
              {solicitacoesPendentes > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {solicitacoesPendentes}
                </Badge>
              )}
            </button>

            <button
              onClick={() => handleTabChange('problemas')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                activeTab === 'problemas'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Problemas</span>
              </div>
              {problemasPendentes > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {problemasPendentes}
                </Badge>
              )}
            </button>
          </div>
        )}

        {/* Lista de Gestores simplificada */}
        <div className="space-y-2">
          <button
            onClick={() => handleManagerSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedManager === null && activeTab === 'clientes'
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
