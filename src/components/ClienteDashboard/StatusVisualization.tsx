
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'

interface StatusVisualizationProps {
  cliente: Cliente | null
}

const STATUS_STEPS = [
  'Preenchimento do Formulário',
  'Brief',
  'Criativo',
  'Site',
  'Agendamento',
  'No Ar',
  'Otimização'
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Problema':
      return 'destructive'
    case 'Off':
    case 'Reembolso':
      return 'secondary'
    case 'No Ar':
    case 'Otimização':
      return 'default'
    default:
      return 'outline'
  }
}

const getStatusIcon = (stepStatus: 'completed' | 'current' | 'pending') => {
  switch (stepStatus) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'current':
      return <Clock className="w-5 h-5 text-blue-500" />
    case 'pending':
      return <AlertCircle className="w-5 h-5 text-gray-400" />
  }
}

export function StatusVisualization({ cliente }: StatusVisualizationProps) {
  if (!cliente) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhuma campanha encontrada para seu email. Entre em contato com seu gestor.
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentStatusIndex = STATUS_STEPS.indexOf(cliente.status_campanha || '')
  const progress = currentStatusIndex >= 0 ? ((currentStatusIndex + 1) / STATUS_STEPS.length) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Status da Campanha
            <Badge variant={getStatusColor(cliente.status_campanha || '')}>
              {cliente.status_campanha || 'Não definido'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="space-y-4">
            {STATUS_STEPS.map((step, index) => {
              const stepStatus = 
                index < currentStatusIndex ? 'completed' :
                index === currentStatusIndex ? 'current' :
                'pending'

              return (
                <div 
                  key={step} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    stepStatus === 'current' ? 'bg-blue-50 border-blue-200' :
                    stepStatus === 'completed' ? 'bg-green-50 border-green-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  {getStatusIcon(stepStatus)}
                  <span className={`font-medium ${
                    stepStatus === 'current' ? 'text-blue-700' :
                    stepStatus === 'completed' ? 'text-green-700' :
                    'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <p className="font-medium">{cliente.nome_cliente}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Vendedor:</span>
              <p className="font-medium">{cliente.vendedor || 'Não informado'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Data da Venda:</span>
              <p className="font-medium">{cliente.data_venda || 'Não informado'}</p>
            </div>
            {cliente.data_limite && (
              <div>
                <span className="text-sm text-muted-foreground">Data Limite:</span>
                <p className="font-medium">{cliente.data_limite}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Grupo WhatsApp:</span>
              <Badge variant={cliente.link_grupo ? 'default' : 'secondary'}>
                {cliente.link_grupo ? 'Disponível' : 'Pendente'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Briefing:</span>
              <Badge variant={cliente.link_briefing ? 'default' : 'secondary'}>
                {cliente.link_briefing ? 'Disponível' : 'Pendente'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Criativos:</span>
              <Badge variant={cliente.link_criativo ? 'default' : 'secondary'}>
                {cliente.link_criativo ? 'Disponível' : 'Pendente'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Site:</span>
              <Badge variant={cliente.link_site ? 'default' : 'secondary'}>
                {cliente.link_site ? 'Disponível' : 'Pendente'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
