
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Upload, 
  Globe,
  UserPlus,
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
      id: 'auditoria',
      label: 'Auditoria',
      icon: FileText,
      onClick: () => onTabChange('auditoria')
    },
    {
      id: 'briefings',
      label: 'Briefings',
      icon: FileText,
      onClick: () => onTabChange('briefings')
    },
    {
      id: 'importar-vendas',
      label: 'Importar Vendas',
      icon: Upload,
      onClick: () => onTabChange('importar-vendas')
    },
    {
      id: 'criar-usuarios-clientes',
      label: 'Criar Usuários',
      icon: UserPlus,
      onClick: () => onTabChange('criar-usuarios-clientes')
    },
    {
      id: 'sites',
      label: 'Sites',
      icon: Globe,
      onClick: () => onTabChange('sites')
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: Book,
      onClick: () => onTabChange('documentacao')
    }
  ]

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
