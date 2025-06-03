import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, FileText, Camera, TrendingUp, Calendar, Target } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import type { BriefingCliente, VendaCliente, ArquivoCliente } from '@/hooks/useClienteData'
import { formatCurrency } from '@/lib/utils'

interface ClienteDashboardMetricsProps {
  cliente: Cliente | null
  briefing: BriefingCliente | null
  vendas: VendaCliente[]
  arquivos: ArquivoCliente[]
}

export function ClienteDashboardMetrics({ cliente, briefing, vendas, arquivos }: ClienteDashboardMetricsProps) {
  const totalVendas = vendas.reduce((sum, venda) => sum + venda.valor_venda, 0)
  const vendasCount = vendas.length
  const arquivosCount = arquivos.length

  const investimentoDiario = briefing?.investimento_diario || 0
  const diasCampanha = cliente?.data_venda ? 
    Math.max(1, Math.floor((new Date().getTime() - new Date(cliente.data_venda).getTime()) / (1000 * 60 * 60 * 24))) : 0
  const totalInvestido = investimentoDiario * diasCampanha

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVendas)}</div>
            <p className="text-xs text-muted-foreground">
              {vendasCount} {vendasCount === 1 ? 'venda registrada' : 'vendas registradas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Enviados</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{arquivosCount}</div>
            <p className="text-xs text-muted-foreground">
              Arquivos disponíveis para criação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvestido)}</div>
            <p className="text-xs text-muted-foreground">
              {diasCampanha} {diasCampanha === 1 ? 'dia' : 'dias'} × {formatCurrency(investimentoDiario)}/dia
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Status do Briefing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={briefing.liberar_edicao ? "secondary" : "default"}>
                    {briefing.liberar_edicao ? "Em edição" : "Aprovado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Produto:</span>
                  <span className="text-sm font-medium">{briefing.nome_produto}</span>
                </div>
                {briefing.investimento_diario && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Investimento diário:</span>
                    <span className="text-sm font-medium">{formatCurrency(briefing.investimento_diario)}</span>
                  </div>
                )}
                {briefing.comissao_aceita && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comissão aceita:</span>
                    <span className="text-sm font-medium">{briefing.comissao_aceita}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Briefing ainda não preenchido. Acesse a aba "Briefing" para começar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detalhes da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status atual:</span>
                  <Badge>{cliente.status_campanha || 'Não definido'}</Badge>
                </div>
                {cliente.data_venda && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data da venda:</span>
                    <span className="text-sm font-medium">
                      {new Date(cliente.data_venda).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {cliente.data_limite && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data limite:</span>
                    <span className="text-sm font-medium">{cliente.data_limite}</span>
                  </div>
                )}
                {cliente.vendedor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vendedor:</span>
                    <span className="text-sm font-medium">{cliente.vendedor}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Site status:</span>
                  <Badge variant="outline">{cliente.site_status || 'Pendente'}</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha encontrada para seu email.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Área reservada para MetaEdits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            MetaEdits - Integração Futura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-600">Em Breve</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Aqui você poderá acompanhar as métricas em tempo real das suas campanhas do Meta Ads, 
              incluindo impressões, cliques, conversões e ROI.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
