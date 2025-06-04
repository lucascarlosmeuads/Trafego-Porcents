
import { useState } from 'react'
import { SacTable } from './SacTable'
import { SacFilters } from './SacFilters'
import { SacDetailsModal } from './SacDetailsModal'
import { useSacData, type SacSolicitacao } from '@/hooks/useSacData'
import { LoadingFallback } from '@/components/LoadingFallback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Users, Clock, CheckCircle } from 'lucide-react'

export function SacDashboard() {
  const { solicitacoes, loading, error, updateSolicitacaoLocal } = useSacData()
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<SacSolicitacao[]>([])
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SacSolicitacao | null>(null)
  const [activeTab, setActiveTab] = useState<string>('ativos')

  if (loading) {
    return <LoadingFallback />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Função para lidar com atualizações de solicitação no modal
  const handleSolicitacaoUpdated = (updatedSolicitacao: SacSolicitacao) => {
    console.log('🔄 [SacDashboard] === RECEBENDO ATUALIZAÇÃO ===')
    console.log('🔄 [SacDashboard] Solicitação atualizada:', {
      id: updatedSolicitacao.id,
      email_gestor: updatedSolicitacao.email_gestor,
      nome_gestor: updatedSolicitacao.nome_gestor,
      status: updatedSolicitacao.status
    })

    // Atualizar no hook global
    updateSolicitacaoLocal(updatedSolicitacao.id, {
      email_gestor: updatedSolicitacao.email_gestor,
      nome_gestor: updatedSolicitacao.nome_gestor,
      status: updatedSolicitacao.status,
      concluido_em: updatedSolicitacao.concluido_em,
      concluido_por: updatedSolicitacao.concluido_por
    })

    // Atualizar a solicitação selecionada se for a mesma
    if (selectedSolicitacao && selectedSolicitacao.id === updatedSolicitacao.id) {
      console.log('🔄 [SacDashboard] Atualizando solicitação selecionada')
      setSelectedSolicitacao(updatedSolicitacao)
    }

    // Se foi marcado como concluído e estamos na aba "ativos", forçar atualização da lista
    if (updatedSolicitacao.status === 'concluido' && activeTab === 'ativos') {
      console.log('🔄 [SacDashboard] SAC concluído - atualizando lista de ativos')
      // A lista será automaticamente filtrada pelos filtros
    }
  }

  // Função para abrir detalhes de uma solicitação
  const handleViewDetails = (solicitacao: SacSolicitacao) => {
    console.log('🔍 [SacDashboard] Abrindo detalhes da solicitação:', solicitacao.id)
    
    // Buscar a versão mais atualizada da solicitação na lista
    const updatedSolicitacao = solicitacoes.find(s => s.id === solicitacao.id) || solicitacao
    console.log('🔍 [SacDashboard] Versão atualizada encontrada:', {
      id: updatedSolicitacao.id,
      email_gestor: updatedSolicitacao.email_gestor,
      nome_gestor: updatedSolicitacao.nome_gestor,
      status: updatedSolicitacao.status
    })
    
    setSelectedSolicitacao(updatedSolicitacao)
  }

  // Calcular métricas
  const totalSolicitacoes = solicitacoes.length
  const solicitacoesAtivas = solicitacoes.filter(s => s.status === 'aberto' || s.status === 'em_andamento').length
  const solicitacoesHoje = solicitacoes.filter(s => {
    const hoje = new Date().toDateString()
    const dataSolicitacao = new Date(s.created_at).toDateString()
    return hoje === dataSolicitacao
  }).length

  const problemasUrgentes = solicitacoes.filter(s => 
    (s.status === 'aberto' || s.status === 'em_andamento') &&
    (s.tipo_problema.toLowerCase().includes('urgente') || 
     s.tipo_problema.toLowerCase().includes('crítico'))
  ).length

  const solicitacoesConcluidas = solicitacoes.filter(s => s.status === 'concluido').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SAC - Suporte ao Cliente</h1>
        <p className="text-gray-600 mt-2">
          Gerencie todas as solicitações de suporte dos clientes
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolicitacoes}</div>
            <CardDescription>Todas as solicitações registradas</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SACs Ativos</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{solicitacoesAtivas}</div>
            <CardDescription>Abertos e em andamento</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{problemasUrgentes}</div>
            <CardDescription>Requerem atenção imediata</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{solicitacoesConcluidas}</div>
            <CardDescription>SACs finalizados com sucesso</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Abas para separar ativos e concluídos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativos">
            SACs Ativos ({solicitacoesAtivas})
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            SACs Concluídos ({solicitacoesConcluidas})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-4">
          {/* Filtros para SACs ativos */}
          <SacFilters 
            solicitacoes={solicitacoes}
            onFilterChange={setFilteredSolicitacoes}
            defaultStatusFilter="ativos"
          />

          {/* Tabela de SACs ativos */}
          <SacTable 
            solicitacoes={filteredSolicitacoes.length > 0 ? filteredSolicitacoes : solicitacoes.filter(s => s.status === 'aberto' || s.status === 'em_andamento')}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4">
          {/* Filtros para SACs concluídos */}
          <SacFilters 
            solicitacoes={solicitacoes}
            onFilterChange={setFilteredSolicitacoes}
            defaultStatusFilter="concluidos"
          />

          {/* Tabela de SACs concluídos */}
          <SacTable 
            solicitacoes={filteredSolicitacoes.length > 0 ? filteredSolicitacoes : solicitacoes.filter(s => s.status === 'concluido')}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes */}
      {selectedSolicitacao && (
        <SacDetailsModal
          solicitacao={selectedSolicitacao}
          onClose={() => setSelectedSolicitacao(null)}
          onSolicitacaoUpdated={handleSolicitacaoUpdated}
        />
      )}
    </div>
  )
}
