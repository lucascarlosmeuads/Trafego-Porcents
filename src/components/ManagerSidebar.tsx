
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AdminMainMenu } from './ManagerSidebar/AdminMainMenu'
import { ManagerFilter } from './ManagerSidebar/ManagerFilter'
import { GestorMenu } from './ManagerSidebar/GestorMenu'

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

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          {isAdmin ? 'Painel Admin' : 'Gestores'}
        </h2>
        
        {isAdmin ? (
          <>
            <AdminMainMenu
              activeTab={activeTab}
              selectedManager={selectedManager}
              solicitacoesPendentes={solicitacoesPendentes}
              problemasPendentes={problemasPendentes}
              onTabChange={onTabChange}
              onManagerSelect={onManagerSelect}
            />

            <div className="border-t border-border my-4"></div>

            <ManagerFilter
              selectedManager={selectedManager}
              activeTab={activeTab}
              onManagerSelect={onManagerSelect}
              onTabChange={onTabChange}
            />
          </>
        ) : (
          <GestorMenu
            selectedManager={selectedManager}
            activeTab={activeTab}
            onManagerSelect={onManagerSelect}
          />
        )}
      </div>
    </div>
  )
}
