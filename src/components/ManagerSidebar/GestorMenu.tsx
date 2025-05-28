
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle,
  Wallet
} from 'lucide-react'

interface GestorMenuProps {
  selectedManager: string | null
  activeTab: string
  onManagerSelect: (manager: string | null) => void
}

export function GestorMenu({ 
  selectedManager, 
  activeTab, 
  onManagerSelect 
}: GestorMenuProps) {
  const { user } = useAuth()
  const [problemasPendentes, setProblemasPendentes] = useState(0)
  const [saquesPendentes, setSaquesPendentes] = useState(0)

  useEffect(() => {
    if (user?.email) {
      fetchProblemasPendentes()
      fetchSaquesPendentes()
    }
  }, [user?.email])

  const fetchProblemasPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id')
        .eq('email_gestor', user?.email)
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
        .eq('email_gestor', user?.email)
        .eq('status_campanha', 'Saque Pendente')

      if (!error && data) {
        setSaquesPendentes(data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar saques pendentes:', error)
    }
  }

  const handleTabChange = (tab: string) => {
    onManagerSelect(null)
  }

  return (
    <div className="space-y-2">
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
        <span>Clientes Ativos</span>
      </button>

      <button
        onClick={() => handleTabChange('saques-pendentes')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
          activeTab === 'saques-pendentes'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          <Wallet size={16} />
          <span>Saques Solicitados</span>
        </div>
        {saquesPendentes > 0 && (
          <Badge variant="destructive" className="text-xs">
            {saquesPendentes}
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
  )
}
