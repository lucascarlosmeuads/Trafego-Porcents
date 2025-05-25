
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, DollarSign, FileText, Calendar } from 'lucide-react'
import type { Cliente, BriefingCliente, VendaCliente, ArquivoCliente } from '@/hooks/useClienteData'

interface ClienteDashboardOverviewProps {
  cliente: Cliente | null
  briefing: BriefingCliente | null
  vendas: VendaCliente[]
  arquivos: ArquivoCliente[]
}

export function ClienteDashboardOverview({ 
  cliente, 
  briefing, 
  vendas, 
  arquivos 
}: ClienteDashboardOverviewProps) {
  
  const totalVendas = vendas.reduce((sum, venda) => sum + Number(venda.valor_venda || 0), 0)
  const totalComissoes = vendas.length * 60 // Assumindo R$ 60 por venda
  
  const getStatusProgress = () => {
    if (!cliente) return 0
    
    const status = cliente.status_campanha?.toLowerCase()
    const statusMap: { [key: string]: number } = {
      'briefing_pendente': 20,
      'briefing_enviado': 40,
      'criativo_pronto': 60,
      'campanha_no_ar': 80,
      'finalizada': 100
    }
    
    return statusMap[status || ''] || 0
  }

  const getStatusLabel = () => {
    if (!cliente) return 'Status não disponível'
    
    const status = cliente.status_campanha?.toLowerCase()
    const statusMap: { [key: string]: string } = {
      'briefing_pendente': 'Aguardando Briefing',
      'briefing_enviado': 'Briefing Enviado',
      'criativo_pronto': 'Criativo Pronto',
      'campanha_no_ar': 'Campanha no Ar',
      'finalizada': 'Campanha Finalizada'
    }
    
    return statusMap[status || ''] || 'Status Indefinido'
  }

  const getStatusColor = () => {
    const progress = getStatusProgress()
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua campanha de tráfego</p>
      </div>

      {/* Status da Campanha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Status da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{getStatusLabel()}</span>
            <Badge variant="outline" className={`${getStatusColor()} text-white`}>
              {getStatusProgress()}%
            </Badge>
          </div>
          <Progress value={getStatusProgress()} className="w-full" />
          
          {cliente && (
            <div className="text-sm text-muted-foreground space-y-1">
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

      {/* Ações Rápidas */}
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
