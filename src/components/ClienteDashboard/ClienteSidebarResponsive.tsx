
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  FileText, 
  Upload, 
  TrendingUp, 
  Play, 
  Headphones, 
  LogOut,
  AlertTriangle
} from 'lucide-react'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'
import { TermosContratoModal } from './TermosContratoModal'

interface ClienteSidebarResponsiveProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebarResponsive({ activeTab, onTabChange }: ClienteSidebarResponsiveProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const { profileData, updateProfileData } = useProfileData('cliente')
  const { marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const [termosModalOpen, setTermosModalOpen] = useState(false)

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'briefing', label: 'Briefing', icon: FileText },
    { id: 'arquivos', label: 'Materiais', icon: Upload },
    { id: 'vendas', label: 'Vendas', icon: TrendingUp },
    { id: 'tutoriais', label: 'Tutoriais', icon: Play },
    { id: 'suporte', label: 'Suporte', icon: Headphones },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  const handleAbrirTermos = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    marcarTermosAceitos()
  }

  const handleTermosRejeitados = () => {
    marcarTermosRejeitados()
    navigate('/termos-rejeitados')
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-hero rounded-lg blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-hero text-white rounded-lg font-bold px-3 py-2 text-sm transition-transform duration-300 hover:scale-105">
                <span>Tráfego</span>
                <span className="text-orange-300">Porcents</span>
              </div>
            </div>
          </div>
          
          {/* Perfil do Cliente */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/20 mt-4">
            <ProfileAvatarUpload
              currentAvatarUrl={profileData?.avatar_url}
              userName={profileData?.nome_display || user?.email || 'Cliente'}
              userType="cliente"
              onAvatarChange={handleAvatarChange}
              size="md"
              showEditButton={true}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profileData?.nome_display || 'Cliente'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400">Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Item destacado para Termos de Uso - mesmo nível do botão do menu */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleAbrirTermos}
                    className="sidebar-termos-button w-full justify-start text-white hover:text-white p-3 my-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-200" />
                        <FileText className="h-4 w-4 text-red-200" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-medium text-white">⚠️ Termos de Uso</span>
                        <div className="relative">
                          <Badge variant="outline" className="text-xs bg-red-600/30 text-red-100 border-red-500/50 px-2 py-0.5 font-bold">
                            IMPORTANTE
                          </Badge>
                          <div className="termos-indicator"></div>
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-800 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair do Sistema
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Modal de Termos */}
      <TermosContratoModal
        open={termosModalOpen}
        onOpenChange={setTermosModalOpen}
        onTermosAceitos={handleTermosAceitos}
        onTermosRejeitados={handleTermosRejeitados}
      />
    </>
  )
}
