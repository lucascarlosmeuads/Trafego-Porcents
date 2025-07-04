
import { Home, FileText, Upload, MessageCircle, TrendingUp, Settings, Users, DollarSign, LayoutDashboard } from 'lucide-react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'

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
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onTabChange(item.id)}
                isActive={activeTab === item.id}
                className="w-full justify-start text-white hover:bg-gray-800"
              >
                <item.icon className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="https://wa.me/5511940747924" target="_blank" rel="noopener noreferrer" className="w-full justify-start text-white hover:bg-gray-800">
                <MessageCircle className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Precisa de ajuda?</span>
                  <span className="text-xs text-gray-400">Fale conosco no WhatsApp</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
