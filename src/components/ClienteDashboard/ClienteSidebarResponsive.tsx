
import React, { useState } from 'react'
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
  BarChart,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileDropdown } from '../ProfileDropdown'
import { Badge } from '@/components/ui/badge'
import { TermosContratoModal } from './TermosContratoModal'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

interface ClienteSidebarResponsiveProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ClienteSidebarResponsive({ activeTab, onTabChange }: ClienteSidebarResponsiveProps) {
  const { user } = useAuth()
  const { marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const [termosModalOpen, setTermosModalOpen] = useState(false)

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

  const handleAbrirTermos = () => {
    setTermosModalOpen(true)
  }

  const handleTermosAceitos = () => {
    marcarTermosAceitos()
    setTermosModalOpen(false)
  }

  const handleTermosRejeitados = () => {
    marcarTermosRejeitados()
    setTermosModalOpen(false)
  }

  return (
    <>
      <Sidebar className="w-80 min-w-80 max-w-80 border-r border-border/40 bg-card">
        <SidebarHeader className="p-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-base">TP</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-lg leading-tight">Painel do Cliente</h2>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email?.split('@')[0]}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-4 space-y-2">
          <SidebarMenu className="space-y-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full h-auto p-4 rounded-xl transition-all duration-200 group",
                    "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-start gap-4 w-full">
                    <item.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                      <span className="text-sm font-semibold leading-tight">{item.label}</span>
                      <span className="text-xs opacity-80 leading-tight mt-1 line-clamp-2">{item.description}</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* Item destacado para Termos de Uso */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleAbrirTermos}
                className="w-full h-auto p-4 my-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-red-500/15 to-orange-500/15 border-2 border-red-500/30 hover:from-red-500/25 hover:to-orange-500/25 hover:border-red-500/50 hover:shadow-lg sidebar-termos-button"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex items-center justify-between w-full min-w-0">
                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                      <span className="text-sm font-bold text-red-300">⚠️ Termos de Uso</span>
                      <span className="text-xs text-red-200/90 leading-tight mt-1">Revisar condições importantes</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-red-600/40 text-red-100 border-red-500/60 font-bold ml-2 px-2 py-1 flex-shrink-0"
                    >
                      IMPORTANTE
                    </Badge>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/20">
          <ProfileDropdown />
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
