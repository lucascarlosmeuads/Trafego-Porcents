
import { BarChart3, Users, AlertTriangle, Settings, DollarSign, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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
  const mainMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral do sistema'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar todos os clientes'
    },
    {
      id: 'briefings',
      label: 'Briefings',
      icon: FileText,
      description: 'Ver briefings preenchidos'
    },
    {
      id: 'problemas',
      label: 'Problemas',
      icon: AlertTriangle,
      badge: problemasPendentes > 0 ? problemasPendentes : undefined,
      description: 'Problemas pendentes'
    },
    {
      id: 'saques-pendentes',
      label: 'Saques Pendentes',
      icon: DollarSign,
      badge: saquesPendentes > 0 ? saquesPendentes : undefined,
      description: 'Solicitações de saque'
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icon: Search,
      description: 'Logs e auditoria'
    }
  ]

  const handleGestoresClick = () => {
    onManagerSelect('__GESTORES__')
    onTabChange('clientes')
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {/* Menu Principal */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Menu Principal
          </h3>
          {mainMenuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-auto p-3"
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </Button>
          ))}
        </div>

        <Separator />

        {/* Gestão */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Gestão
          </h3>
          <Button
            variant={selectedManager === '__GESTORES__' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3"
            onClick={handleGestoresClick}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">Gestores</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gerenciar gestores do sistema
              </p>
            </div>
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
