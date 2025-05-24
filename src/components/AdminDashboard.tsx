import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { ProblemasPanel } from './ProblemasPanel'
import { GestoresManagement } from './GestoresManagement'
import { StatusFunnelDashboard } from './Dashboard/StatusFunnelDashboard'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Users, BarChart3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdminDashboardProps {
  selectedManager: string | null
}

export function AdminDashboard({ selectedManager }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clientes' | 'problemas'>('clientes')
  const [problemasCount, setProblemasCount] = useState(0)

  const buscarProblemasCount = async () => {
    try {
      const { count } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })
        .eq('status_campanha', 'Problema')

      setProblemasCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar contagem de problemas:', error)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
      buscarProblemasCount()
    }
  }, [user, isAdmin])

  useEffect(() => {
    // Se um manager específico foi selecionado, sempre mostrar a aba de clientes
    if (selectedManager && !selectedManager.startsWith('__')) {
      setActiveTab('clientes')
    }
    // Se o manager selecionado for '__PROBLEMAS__', mostrar a aba de problemas
    else if (selectedManager === '__PROBLEMAS__') {
      setActiveTab('problemas')
    }
    // Se o manager selecionado for '__GESTORES__', não alterar a aba (mantém na atual)
    else if (selectedManager === '__GESTORES__') {
      // Mantém a aba atual, mas o conteúdo será determinado pelo selectedManager
    }
  }, [selectedManager])

  useEffect(() => {
    // Configurar realtime para atualizar contagem de problemas
    const channel = supabase
      .channel('admin-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
        },
        () => {
          buscarProblemasCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  const renderContent = () => {
    // Se um gestor específico foi selecionado ou gestores gerais, mostrar tabela de clientes
    if (selectedManager === '__GESTORES__') {
      return <GestoresManagement />
    }
    
    // Verificar qual aba está ativa
    if (activeTab === 'dashboard') {
      return <StatusFunnelDashboard />
    } else if (activeTab === 'problemas') {
      return <ProblemasPanel />
    } else {
      return <ClientesTable selectedManager={selectedManager} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs - apenas quando não estiver gerenciando gestores */}
      {selectedManager !== '__GESTORES__' && (
        <div className="border-b border-border">
          <div className="flex gap-2 p-1">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'clientes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('clientes')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Clientes
            </Button>
            <Button
              variant={activeTab === 'problemas' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('problemas')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Problemas Pendentes
              {problemasCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {problemasCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  )
}
