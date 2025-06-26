import React from 'react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { 
  Home, 
  FileText, 
  Upload, 
  DollarSign, 
  PlayCircle, 
  HelpCircle,
  BarChart
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileDropdown } from '../ProfileDropdown'

interface ClienteSidebarResponsiveProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebarResponsive({ activeTab, onTabChange }: ClienteSidebarResponsiveProps) {
  const { user } = useAuth()

  const menuItems = [
    {
      id: 'overview',
      label: 'Início',
      icon: Home,
      description: 'Visão geral do seu projeto'
    },
    {
      id: 'briefing',
      label: 'Briefing',
      icon: FileText,
      description: 'Preencha as informações do seu projeto'
    },
    {
      id: 'arquivos',
      label: 'Materiais',
      icon: Upload,
      description: 'Envie fotos e materiais para criação'
    },
    {
      id: 'campanhas',
      label: 'Campanhas',
      icon: BarChart,
      description: 'Acompanhe suas métricas do Meta Ads'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: DollarSign,
      description: 'Registre suas vendas e resultados'
    },
    {
      id: 'tutoriais',
      label: 'Tutoriais',
      icon: PlayCircle,
      description: 'Aprenda a usar a plataforma'
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: HelpCircle,
      description: 'Precisa de ajuda? Entre em contato'
    }
  ]

  return (
    <Sidebar className="border-r border-border/40 bg-card">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TP</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Painel do Cliente</h2>
            <p className="text-xs text-muted-foreground">
              {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full justify-start gap-3 py-3 px-3 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs opacity-75 text-left">{item.description}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}
