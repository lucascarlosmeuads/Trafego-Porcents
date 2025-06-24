import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSiteSolicitations } from '@/hooks/useSiteSolicitations'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Headphones, 
  BarChart3, 
  FileText,
  Globe,
  MessageSquare
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  onTabSelect: (tab: string) => void
}

export function AdminMainMenu({ activeTab, onTabSelect }: AdminMainMenuProps) {
  const { solicitations } = useSiteSolicitations()
  
  // Contar solicitações pendentes
  const pendingSiteRequests = solicitations.filter(s => s.status === 'pendente').length

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e métricas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      id: 'solicitacoes-site',
      label: 'Solicitações de Site',
      icon: Globe,
      description: 'Gerenciar pedidos de criação de site',
      badge: pendingSiteRequests > 0 ? pendingSiteRequests : undefined
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: Headphones,
      description: 'Central de atendimento'
    },
    {
      id: 'sac-relatorio',
      label: 'Relatório SAC',
      icon: BarChart3,
      description: 'Relatórios de atendimento'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: FileText,
      description: 'Feedback e melhorias'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: BookOpen,
      description: 'Guias e manuais'
    }
  ]

  return (
    <nav className="space-y-2">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Menu Principal
      </div>
      
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "secondary" : "ghost"}
          className={`
            w-full justify-start h-auto p-3 text-left
            ${activeTab === item.id 
              ? 'bg-blue-100 text-blue-900 border border-blue-200' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }
          `}
          onClick={() => onTabSelect(item.id)}
        >
          <div className="flex items-center space-x-3 w-full">
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-red-500 text-white border-red-600 hover:bg-red-600"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {item.description}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </nav>
  )
}
