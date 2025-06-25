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

                {/* Item ULTRA DESTACADO para Termos de Uso */}
                <SidebarMenuItem>
                  <div className="relative p-1">
                    {/* Efeito de glow/brilho no fundo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-xl blur-md opacity-50 animate-ultra-pulse"></div>
                    
                    {/* Seta piscante apontando para o item */}
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-bounce-intense">
                      <span className="text-lg">👉</span>
                    </div>
                    
                    <SidebarMenuButton 
                      onClick={handleAbrirTermos}
                      className="relative w-full justify-start text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 border-2 border-yellow-400 rounded-xl shadow-xl animate-shake-subtle hover:scale-105 transition-all duration-300 p-3"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-5 w-5 text-yellow-300 animate-bounce" />
                          <FileText className="h-5 w-5 text-yellow-300" />
                          <span className="text-lg">⚠️</span>
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-bold text-yellow-100 text-sm">🔥 TERMOS DE USO 🔥</div>
                            <div className="text-xs text-yellow-200 font-medium">AÇÃO NECESSÁRIA - CLIQUE AQUI!</div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Badge className="text-xs bg-yellow-500 text-black border-yellow-400 font-bold animate-pulse px-2 py-1 shadow-lg">
                              URGENTE
                            </Badge>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Efeito de spotlight no hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-full group-hover:animate-spotlight rounded-xl"></div>
                    </SidebarMenuButton>
                    
                    {/* Badge "NOVO" piscante */}
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-white animate-bounce-intense shadow-lg">
                      NOVO
                    </div>
                  </div>
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
