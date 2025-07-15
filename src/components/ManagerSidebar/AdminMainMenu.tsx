
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Headphones, 
  BarChart3,
  DollarSign,
  Wand2
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  onTabSelect: (tab: string) => void
  isCollapsed?: boolean
}

export function AdminMainMenu({ activeTab, onTabSelect, isCollapsed = false }: AdminMainMenuProps) {
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
      id: 'sac',
      label: 'SAC',
      icon: Headphones,
      description: 'Central de atendimento'
    },
    {
      id: 'gerador-criativos',
      label: 'Gerador de Criativos',
      icon: Wand2,
      description: 'Upload PDF + IA para criativos'
    },
    {
      id: 'openai-custos',
      label: 'Custos OpenAI',
      icon: DollarSign,
      description: 'Monitorar saldo e gastos'
    }
  ]

  if (isCollapsed) {
    return (
      <div className="flex flex-col space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`
              w-10 h-10 rounded-lg border transition-all duration-200 group flex items-center justify-center
              ${activeTab === item.id 
                ? 'bg-gray-700/60 border-gray-600 shadow-lg' 
                : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:transform hover:scale-105 hover:shadow-md'
              }
            `}
            onClick={() => onTabSelect(item.id)}
            title={item.label}
          >
            <item.icon className={`h-4 w-4 ${
              activeTab === item.id 
                ? 'text-white' 
                : 'text-gray-400 group-hover:text-white'
            }`} />
          </button>
        ))}
      </div>
    )
  }

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
