import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, DollarSign, FileText, Calendar, CheckCircle, Circle, Clock } from 'lucide-react'
import type { Cliente, BriefingCliente, VendaCliente, ArquivoCliente } from '@/hooks/useClienteData'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ClienteDashboardOverviewProps {
  cliente: Cliente | null
  briefing: BriefingCliente | null
  vendas: VendaCliente[]
  arquivos: ArquivoCliente[]
}

const STATUS_STAGES = [
  'Formulário',
  'Brief',
  'Criativo',
  'Agendamento',
  'Otimização'
]

const STATUS_MAPPING = {
  'Formulário': 1,
  'Brief': 2,
  'Criativo': 3,
  'Agendamento': 4,
  'Otimização': 5
}

export function ClienteDashboardOverview({ 
  cliente, 
  briefing, 
  vendas, 
  arquivos 
}: ClienteDashboardOverviewProps) {
  
  const totalVendas = vendas.reduce((sum, venda) => sum + Number(venda.valor_venda || 0), 0)
  const totalComissoes = vendas.length * 60 // Assumindo R$ 60 por venda
  
  const getCurrentStage = () => {
    if (!cliente?.status_campanha) return 1
    return STATUS_MAPPING[cliente.status_campanha as keyof typeof STATUS_MAPPING] || 1
  }

  const getProgressPercentage = () => {
    const currentStage = getCurrentStage()
    return Math.round((currentStage / STATUS_STAGES.length) * 100)
  }

  const getStageIcon = (stageIndex: number) => {
    const currentStage = getCurrentStage()
    
    if (stageIndex < currentStage) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (stageIndex === currentStage) {
      return <Clock className="w-5 h-5 text-blue-500" />
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStageStyle = (stageIndex: number) => {
    const currentStage = getCurrentStage()
    
    if (stageIndex < currentStage) {
      return 'bg-green-50 border-green-200 text-green-700'
    } else if (stageIndex === currentStage) {
      return 'bg-blue-50 border-blue-200 text-blue-700'
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-500'
    }
  }

  // Set up real-time subscription for status updates
  useEffect(() => {
    if (!cliente?.email_cliente) return

    console.log('🔄 [ClienteDashboard] Configurando realtime para:', cliente.email_cliente)

    const channel = supabase
      .channel('cliente-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'todos_clientes',
          filter: `email_cliente=eq.${cliente.email_cliente}`
        },
        (payload) => {
          console.log('📡 [ClienteDashboard] Status atualizado:', payload)
          // Force a re-render by updating the window
          window.location.reload()
        }
      )
      .subscribe()

    return () => {
      console.log('🔄 [ClienteDashboard] Removendo realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [cliente?.email_cliente])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua campanha de tráfego</p>
      </div>

      {/* Status da Campanha com Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Status da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {cliente?.status_campanha || 'Formulário'}
            </span>
            <Badge variant="outline" className="bg-blue-500 text-white">
              {getProgressPercentage()}% concluído
            </Badge>
          </div>
          
          <Progress value={getProgressPercentage()} className="w-full h-3" />
          
          {/* Detailed Progress Steps */}
          <div className="space-y-3">
            {STATUS_STAGES.map((stage, index) => (
              <div 
                key={stage} 
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getStageStyle(index)}`}
              >
                {getStageIcon(index)}
                <span className="font-medium text-sm">
                  {index + 1}. {stage}
                </span>
              </div>
            ))}
          </div>
          
          {cliente && (
            <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
              <p><strong>Cliente:</strong> {cliente.nome_cliente}</p>
              {cliente.data_venda && (
                <p><strong>Data da Venda:</strong> {new Date(cliente.data_venda).toLocaleDateString('pt-BR')}</p>
              )}
              {cliente.data_subida_campanha && (
                <p><strong>Campanha no Ar:</strong> {new Date(cliente.data_subida_campanha).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendas.length}</div>
            <p className="text-xs text-muted-foreground">
              vendas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              em vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Geradas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              para a equipe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resumo de Materiais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{arquivos.length}</div>
              <p className="text-sm text-muted-foreground">Arquivos Enviados</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {arquivos.filter(a => a.tipo_arquivo.startsWith('image/')).length}
              </div>
              <p className="text-sm text-muted-foreground">Imagens</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {arquivos.filter(a => a.tipo_arquivo.startsWith('video/')).length}
              </div>
              <p className="text-sm text-muted-foreground">Vídeos</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {briefing ? '1' : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Briefing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!briefing && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Preencher Briefing</p>
                  <p className="text-sm text-muted-foreground">
                    Complete as informações sobre seu negócio
                  </p>
                </div>
                <Badge variant="secondary">Pendente</Badge>
              </div>
            )}
            
            {arquivos.length === 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Enviar Materiais</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione fotos e vídeos do seu produto
                  </p>
                </div>
                <Badge variant="secondary">Pendente</Badge>
              </div>
            )}
            
            {vendas.length === 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Registrar Primeira Venda</p>
                  <p className="text-sm text-muted-foreground">
                    Comece a acompanhar suas vendas
                  </p>
                </div>
                <Badge variant="secondary">Pendente</Badge>
              </div>
            )}
            
            {briefing && arquivos.length > 0 && vendas.length > 0 && (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">
                  ✅ Tudo configurado! Sua campanha está em andamento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
