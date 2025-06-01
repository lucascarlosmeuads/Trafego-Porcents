
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AdminMainMenu } from './ManagerSidebar/AdminMainMenu'
import { GestorMenu } from './ManagerSidebar/GestorMenu'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react'

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
  const { isAdmin, signOut, currentManagerName } = useAuth()
  const [problemasPendentes, setProblemasPendentes] = useState(0)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetchProblemasPendentes()
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

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div 
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'} 
        bg-card border-r border-border h-screen 
        transition-all duration-300 ease-in-out overflow-y-auto flex flex-col
        flex-shrink-0 sticky top-0 left-0 z-40
      `}
    >
      {/* Toggle Button */}
      <div className="p-2 border-b border-border flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Header com nome do gestor */}
      <div className="p-4 border-b border-border">
        {!isCollapsed && (
          <>
            <h2 className="text-lg font-semibold text-card-foreground mb-3">
              {isAdmin ? 'Painel Admin' : 'Gestores'}
            </h2>
            
            {/* Nome do gestor */}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-accent/30">
              <div className="bg-primary rounded-full p-1.5">
                <User className="h-3 w-3 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {currentManagerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Gestor'}
                </p>
              </div>
            </div>
          </>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-2">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1">
        {isAdmin ? (
          <AdminMainMenu
            activeTab={activeTab}
            selectedManager={selectedManager}
            problemasPendentes={problemasPendentes}
            onTabChange={onTabChange}
            onManagerSelect={onManagerSelect}
            isCollapsed={isCollapsed}
          />
        ) : (
          <GestorMenu
            activeTab={activeTab}
            onTabChange={onTabChange}
            problemasPendentes={problemasPendentes}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={`
            ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'} 
            text-red-600 hover:text-red-700 hover:bg-red-50
          `}
          onClick={handleSignOut}
          disabled={isSigningOut}
          title={isCollapsed ? (isSigningOut ? 'Saindo...' : 'Sair do Sistema') : ''}
        >
          <LogOut className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && (isSigningOut ? 'Saindo...' : 'Sair do Sistema')}
        </Button>
      </div>
    </div>
  )
}
