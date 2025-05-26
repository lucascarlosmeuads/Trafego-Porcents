
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AdminMainMenu } from './ManagerSidebar/AdminMainMenu'
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
  const [problemasPendentes, setProblemasPendentes] = useState(0)
  const [saquesPendentes, setSaquesPendentes] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      fetchProblemasPendentes()
      fetchSaquesPendentes()
    }
  }, [isAdmin])

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

  const fetchSaquesPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id')
        .eq('status_campanha', 'Saque Pendente')

      if (!error && data) {
        setSaquesPendentes(data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar saques pendentes:', error)
    }
  }

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">
          {isAdmin ? 'Painel Admin' : 'Gestores'}
        </h2>
        
        {isAdmin ? (
          <AdminMainMenu
            activeTab={activeTab}
            selectedManager={selectedManager}
            problemasPendentes={problemasPendentes}
            saquesPendentes={saquesPendentes}
            onTabChange={onTabChange}
            onManagerSelect={onManagerSelect}
          />
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
