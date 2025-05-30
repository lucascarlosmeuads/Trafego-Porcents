
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Book
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  selectedManager: string | null
  onTabChange: (tab: string) => void
  onManagerSelect: (manager: string | null) => void
  problemasPendentes: number
}

export function AdminMainMenu({ 
  activeTab, 
  selectedManager, 
  onTabChange, 
  onManagerSelect,
  problemasPendentes 
}: AdminMainMenuProps) {

  // Menus ativos no painel Admin
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      onClick: () => onTabChange('dashboard')
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      onClick: () => onTabChange('clientes')
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: Book,
      onClick: () => onTabChange('documentacao')
    }
  ]

  // Menus ocultos (removidos temporariamente):
  // - auditoria (Auditoria)
  // - briefings (Briefings) 
  // - importar-vendas (Importar Vendas)
  // - criar-usuarios-clientes (Criar Usuários)
  // - sites (Sites)

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={item.onClick}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}

      <div className="pt-4 border-t">
        <Button
          variant={selectedManager === '__GESTORES__' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onManagerSelect('__GESTORES__')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Gestores
        </Button>
      </div>
    </nav>
  )
}
