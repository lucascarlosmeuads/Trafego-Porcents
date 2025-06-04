import { BarChart, Users, MessageSquare, FileText, BookOpen, MessageCircle } from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  onTabSelect: (tab: string) => void
}

export function AdminMainMenu({ activeTab, onTabSelect }: AdminMainMenuProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart,
      description: 'Visão geral e métricas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar todos os clientes'
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: MessageSquare,
      description: 'Suporte ao Cliente'
    },
    {
      id: 'sac-relatorio',
      label: 'Relatório SAC',
      icon: FileText,
      description: 'Análise de SACs por gestor'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Sistema de mensagens'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: BookOpen,
      description: 'Guias e manuais'
    }
  ]

  return (
    <div className="flex flex-col space-y-1">
      {menuItems.map(item => (
        <button
          key={item.id}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
            ${activeTab === item.id
              ? 'bg-secondary text-secondary-foreground'
              : 'hover:bg-muted/50 text-muted-foreground'
            }`}
          onClick={() => onTabSelect(item.id)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
