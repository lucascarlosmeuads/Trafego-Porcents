
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings, 
  HelpCircle,
  Plug,
  Globe,
  UserCog,
  TrendingUp,
  Clock
} from 'lucide-react'

interface AdminMainMenuProps {
  activeTab: string
  onTabChange: (tab: string) => void
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
}

export function AdminMainMenu({ activeTab, onTabChange, selectedManager, onManagerSelect }: AdminMainMenuProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Métricas e visão geral'
    },
    {
      id: 'clientes',
      label: 'Clientes Ativos',
      icon: Users,
      description: 'Gerenciar clientes ativos'
    },
    {
      id: 'clientes-antigos',
      label: 'Clientes Antigos', 
      icon: Clock,
      description: 'Gerenciar clientes antigos'
    },
    {
      id: 'max-integration',
      label: 'Integração Max',
      icon: Plug,
      description: 'Gerenciar integração com Max'
    },
    {
      id: 'solicitacoes-site',
      label: 'Solicitações de Site',
      icon: Globe,
      description: 'Gerenciar solicitações de site'
    },
    {
      id: 'sac',
      label: 'SAC',
      icon: MessageSquare,
      description: 'Atendimento ao cliente'
    },
    {
      id: 'sac-relatorio',
      label: 'Relatório SAC',
      icon: TrendingUp,
      description: 'Relatório de atendimentos'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: FileText,
      description: 'Documentação do sistema'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: HelpCircle,
      description: 'Sugestões de melhorias'
    }
  ]

  const handleGestoresClick = () => {
    onManagerSelect('__GESTORES__')
    onTabChange('clientes')
  }

  return (
    <div className="space-y-2">
      {/* Botão especial para gestores */}
      <Button
        variant={selectedManager === '__GESTORES__' ? 'default' : 'ghost'}
        onClick={handleGestoresClick}
        className="w-full justify-start gap-3 h-12"
      >
        <UserCog className="w-5 h-5" />
        <div className="flex-1 text-left">
          <div className="font-medium">Gestores</div>
          <div className="text-xs text-muted-foreground">Gerenciar gestores</div>
        </div>
      </Button>

      {/* Menu principal */}
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onTabChange(item.id)}
            className="w-full justify-start gap-3 h-12"
          >
            <Icon className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
