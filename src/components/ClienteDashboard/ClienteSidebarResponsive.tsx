
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
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
import { 
  Home, 
  FileText, 
  Upload, 
  TrendingUp, 
  Play, 
  Headphones, 
  LogOut,
  BarChart3
} from 'lucide-react'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'

interface ClienteSidebarResponsiveProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebarResponsive({ activeTab, onTabChange }: ClienteSidebarResponsiveProps) {
  const { signOut, user } = useAuth()
  const { profileData, updateProfileData } = useProfileData('cliente')

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'briefing', label: 'Briefing', icon: FileText },
    { id: 'arquivos', label: 'Materiais', icon: Upload },
    { id: 'meta-ads', label: 'Meta Ads', icon: BarChart3 },
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

  return (
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
  )
}
