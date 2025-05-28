
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  AlertTriangle,
  Wallet,
  Shield,
  Upload,
  UserPlus
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  selectedManager: string | null
  problemasPendentes: number
  saquesPendentes: number
  onTabChange: (tab: string) => void
  onManagerSelect: (manager: string | null) => void
}

export function AdminMainMenu({ 
  activeTab, 
  selectedManager, 
  problemasPendentes, 
  saquesPendentes,
  onTabChange, 
  onManagerSelect 
}: AdminMainMenuProps) {
  const handleTabChange = (tab: string) => {
    onManagerSelect(null)
    onTabChange(tab)
  }

  const handleGestoresManagement = () => {
    onManagerSelect('__GESTORES__')
    onTabChange('clientes')
  }

  return (
    <div className="space-y-2 mb-6">
      <button
        onClick={() => handleTabChange('dashboard')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          activeTab === 'dashboard'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </button>
      
      <button
        onClick={() => handleTabChange('clientes')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          activeTab === 'clientes' && selectedManager !== '__GESTORES__'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <Users size={16} />
        <span>Todos os Clientes</span>
      </button>

      <button
        onClick={() => handleTabChange('importar-vendas')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          activeTab === 'importar-vendas'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <Upload size={16} />
        <span>Importar Vendas Manuais</span>
      </button>

      <button
        onClick={() => handleTabChange('criar-usuarios-clientes')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          activeTab === 'criar-usuarios-clientes'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <UserPlus size={16} />
        <span>Criar Usuários Clientes</span>
      </button>
      
      <button
        onClick={handleGestoresManagement}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          selectedManager === '__GESTORES__'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <Settings size={16} />
        <span>Gestores</span>
      </button>

      <button
        onClick={() => handleTabChange('auditoria')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
          activeTab === 'auditoria'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <Shield size={16} />
        <span>Auditoria de Clientes</span>
      </button>

      <button
        onClick={() => handleTabChange('saques-pendentes')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
          activeTab === 'saques-pendentes'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          <Wallet size={16} />
          <span>Saques Pendentes</span>
        </div>
        {saquesPendentes > 0 && (
          <Badge variant="destructive" className="text-xs">
            {saquesPendentes}
          </Badge>
        )}
      </button>

      <button
        onClick={() => handleTabChange('problemas')}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
          activeTab === 'problemas'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>Problemas</span>
        </div>
        {problemasPendentes > 0 && (
          <Badge variant="destructive" className="text-xs">
            {problemasPendentes}
          </Badge>
        )}
      </button>
    </div>
  )
}
