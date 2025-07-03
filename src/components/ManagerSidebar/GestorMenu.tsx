
import { BarChart3, Users, Activity, Plus, Globe, MessageSquare, Lightbulb } from 'lucide-react'

interface GestorMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function GestorMenu({ activeTab, onTabChange }: GestorMenuProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral e métricas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      id: 'meta-ads',
      label: 'Meta Ads',
      icon: Activity,
      description: 'Relatórios Meta Ads'
    },
    {
      id: 'cadastro-campanha',
      label: 'Campanhas',
      icon: Plus,
      description: 'Cadastrar campanhas'
    },
    {
      id: 'solicitacoes-site',
      label: 'Sites',
      icon: Globe,
      description: 'Solicitações de site'
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: MessageSquare,
      description: 'Suporte ao cliente'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Melhorias do sistema'
    }
  ]

  return (
    <div className="flex flex-col space-y-1">
      {menuItems.map(item => (
        <button
          key={item.id}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800 focus:outline-none focus:bg-gray-700 ${activeTab === item.id ? 'bg-gray-700 text-white' : 'text-gray-400'
            }`}
          onClick={() => onTabChange(item.id)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
