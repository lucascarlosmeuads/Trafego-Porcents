
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  MessageSquare, 
  Headphones,
  Lightbulb,
  FileText,
  Settings,
  HelpCircle,
  Globe
} from 'lucide-react'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'

interface AdminMainMenuProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AdminMainMenu({ activeView, onViewChange }: AdminMainMenuProps) {
  const { sugestoes } = useSugestoesMelhorias()
  
  // Contar sugestões que precisam de atenção (pendentes + em análise)
  const sugestoesPendentes = sugestoes.filter(s => 
    s.status === 'pendente' || s.status === 'em_analise'
  ).length

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral do sistema'
    },
    {
      id: 'clientes',
      label: 'Todos os Clientes',
      icon: Users,
      description: 'Gerenciar todos os clientes'
    },
    {
      id: 'gestores',
      label: 'Gestores',
      icon: UserCheck,
      description: 'Administrar gestores'
    },
    {
      id: 'chat-admin',
      label: 'Chat Administrativo',
      icon: MessageSquare,
      description: 'Monitorar conversas'
    },
    {
      id: 'sac',
      label: 'SAC - Suporte',
      icon: Headphones,
      description: 'Central de atendimento'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Melhorias sugeridas pelos gestores',
      badge: sugestoesPendentes > 0 ? sugestoesPendentes : undefined,
      badgeVariant: 'destructive' as const
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileText,
      description: 'Relatórios e métricas'
    },
    {
      id: 'sites',
      label: 'Gestão de Sites',
      icon: Globe,
      description: 'Administrar criação de sites'
    },
    {
      id: 'documentacao',
      label: 'Documentação',
      icon: HelpCircle,
      description: 'Guias e manuais'
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ]

  return (
    <div className="space-y-2">
      {menuItems.map((item, index) => (
        <div key={item.id}>
          <Button
            variant={activeView === item.id ? 'default' : 'ghost'}
            className={`w-full justify-start h-auto p-3 ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            onClick={() => onViewChange(item.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || 'default'} className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className={`text-xs mt-1 ${
                  activeView === item.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
            </div>
          </Button>
          
          {/* Separadores em pontos específicos */}
          {(index === 2 || index === 5 || index === 7) && (
            <Separator className="my-3" />
          )}
        </div>
      ))}
    </div>
  )
}
