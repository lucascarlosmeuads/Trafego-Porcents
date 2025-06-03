
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { supabase } from '@/lib/supabase'
import { AdminMainMenu } from './ManagerSidebar/AdminMainMenu'
import { GestorMenu } from './ManagerSidebar/GestorMenu'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProfileAvatarUpload } from './ProfileAvatarUpload'

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
  const { profileData, updateProfileData } = useProfileData('gestor')
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

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
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
      {/* Header reorganizado */}
      <div className="p-3 border-b border-gray-800">
        {isCollapsed ? (
          /* Layout quando colapsado */
          <div className="flex flex-col items-center space-y-3">
            {/* Logo pequena centralizada */}
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-hero rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-hero text-white rounded-lg font-bold px-2 py-1.5 text-xs transition-transform duration-300 hover:scale-105">
                <span className="text-orange-300">TP%</span>
              </div>
            </div>
            
            {/* Avatar do perfil */}
            <ProfileAvatarUpload
              currentAvatarUrl={profileData?.avatar_url}
              userName={currentManagerName}
              userType="gestor"
              onAvatarChange={handleAvatarChange}
              size="sm"
              showEditButton={true}
            />
            
            {/* Botão de toggle bem visível */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 bg-gray-800/40 border border-gray-600/40 hover:border-gray-500/60 rounded-lg"
              title="Expandir menu"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Layout quando expandido */
          <div className="space-y-4">
            {/* Header com logo e botão de toggle */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-hero rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-hero text-white rounded-lg font-bold px-4 py-2 text-lg transition-transform duration-300 hover:scale-105">
                    <span>Tráfego</span>
                    <span className="text-orange-300">Porcents</span>
                  </div>
                </div>
              </div>

              {/* Botão de toggle separado */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 bg-gray-800/40 border border-gray-600/40 hover:border-gray-500/60 rounded-lg ml-3"
                title="Minimizar menu"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Perfil do gestor - mais discreto */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/20 hover:bg-gray-800/30 transition-colors duration-200">
              <ProfileAvatarUpload
                currentAvatarUrl={profileData?.avatar_url}
                userName={currentManagerName}
                userType="gestor"
                onAvatarChange={handleAvatarChange}
                size="md"
                showEditButton={true}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 truncate">
                  {currentManagerName}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : 'Gestor'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Principal */}
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
