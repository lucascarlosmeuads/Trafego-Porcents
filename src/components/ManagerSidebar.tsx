
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AdminMainMenu } from './ManagerSidebar/AdminMainMenu'
import { GestorMenu } from './ManagerSidebar/GestorMenu'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        bg-gray-900 border-r border-gray-800 h-screen 
        transition-all duration-300 ease-in-out overflow-y-auto flex flex-col
        flex-shrink-0 sticky top-0 left-0 z-40 shadow-2xl
      `}
    >
      {/* Header com Logo e Toggle Button */}
      <div className={cn(
        "p-3 border-b border-gray-800 flex items-center transition-all duration-300",
        isCollapsed ? "justify-between" : "justify-center relative"
      )}>
        {/* Logo TráfegoPorcents */}
        <div className={cn(
          "flex items-center",
          !isCollapsed && "flex-1 justify-center"
        )}>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-hero rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className={cn(
              "relative bg-gradient-hero text-white rounded-lg font-bold transition-transform duration-300 hover:scale-105",
              isCollapsed ? "px-2 py-1.5 text-xs" : "px-4 py-2 text-lg"
            )}>
              {!isCollapsed ? (
                <>
                  <span>Tráfego</span>
                  <span className="text-orange-300">Porcents</span>
                </>
              ) : (
                <span className="text-orange-300">TP%</span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors bg-gray-800/50 border border-gray-700/50",
            !isCollapsed && "absolute right-3"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Card do Gestor */}
      <div className="p-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentManagerName}
              </p>
              <p className="text-xs text-blue-300">
                {isAdmin ? 'Administrador' : 'Gestor'}
              </p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 shadow-lg">
              <User className="h-4 w-4 text-white" />
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
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          className={`
            ${isCollapsed ? 'w-8 p-2' : 'w-full justify-start'} 
            text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30
            transition-all duration-200
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
