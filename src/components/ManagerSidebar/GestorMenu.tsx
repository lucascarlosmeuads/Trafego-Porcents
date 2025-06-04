
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  Headphones,
  Lightbulb,
  BarChart3,
  HelpCircle,
  User
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'

interface GestorMenuProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function GestorMenu({ activeView, onViewChange }: GestorMenuProps) {
  const { user } = useAuth()
  const { sugestoes } = useSugestoesMelhorias(user?.email || '')
  
  // Contar sugestões pendentes de resposta
  const sugestoesPendentesResposta = sugestoes.filter(s => 
    s.status === 'pendente' || s.status === 'em_analise'
  ).length

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral dos clientes'
    },
    {
      id: 'clientes',
      label: 'Meus Clientes',
      icon: Users,
      description: 'Gerenciar clientes atribuídos'
    },
    {
      id: 'adicionar',
      label: 'Adicionar Cliente',
      icon: PlusCircle,
      description: 'Cadastrar novo cliente'
    },
    {
      id: 'briefings',
      label: 'Briefings',
      icon: FileText,
      description: 'Visualizar briefings dos clientes'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      description: 'Conversar com clientes'
    },
    {
      id: 'sac-gestor',
      label: 'Minhas Solicitações SAC',
      icon: Headphones,
      description: 'SACs atribuídos a mim'
    },
    {
      id: 'sugestoes',
      label: 'Sugestões',
      icon: Lightbulb,
      description: 'Sugerir melhorias no sistema',
      badge: sugestoesPendentesResposta > 0 ? sugestoesPendentesResposta : undefined,
      badgeVariant: 'secondary' as const
    },
    {
      id: 'perfil',
      label: 'Meu Perfil',
      icon: User,
      description: 'Configurações do perfil'
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: HelpCircle,
      description: 'Central de ajuda'
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
          {(index === 2 || index === 5 || index === 6) && (
            <Separator className="my-3" />
          )}
        </div>
      ))}
    </div>
  )
}
