import { Home, FileText, Upload, MessageCircle, TrendingUp, Settings, Users, DollarSign, LayoutDashboard } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem, SidebarTrigger } from '@/components/ui/sidebar'

interface ClienteSidebarDynamicProps {
  activeTab: string
  onTabChange: (tab: string) => void
  clienteInfo: any
}

export function ClienteSidebarDynamic({ activeTab, onTabChange, clienteInfo }: ClienteSidebarDynamicProps) {
  const menuItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      description: 'Dashboard principal e progresso'
    },
    {
      id: 'briefing',
      label: 'Briefing',
      icon: FileText,
      description: 'Informações do projeto'
    },
    {
      id: 'arquivos',
      label: 'Materiais',
      icon: Upload,
      description: 'Upload de arquivos'
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: MessageCircle,
      description: 'Tire suas dúvidas'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: TrendingUp,
      description: 'Métricas da campanha'
    },
    {
      id: 'comissao',
      label: 'Comissão',
      icon: DollarSign,
      description: 'Detalhes da comissão'
    },
    {
      id: 'site',
      label: 'Site',
      icon: LayoutDashboard,
      description: 'Informações do site'
    },
    {
      id: 'steps',
      label: 'Tutoriais',
      icon: Users,
      description: 'Vídeos e guias'
    }
  ]

  return (
    <Sidebar className="bg-gray-950 border-r border-gray-800">
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TP</span>
          </div>
          <h4 className="font-semibold text-sm text-white">
            {clienteInfo?.nome_cliente || 'Cliente'}
          </h4>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            description={item.description}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <a href="https://wa.me/5511940747924" target="_blank" rel="noopener noreferrer">
          <SidebarItem
            label="Precisa de ajuda?"
            icon={MessageCircle}
            description="Fale conosco no WhatsApp"
          />
        </a>
      </SidebarFooter>
    </Sidebar>
  )
}
