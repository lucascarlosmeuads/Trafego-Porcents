
import { useState } from 'react'
import { SacTable } from './SacTable'
import { SacFilters } from './SacFilters'
import { SacDetailsModal } from './SacDetailsModal'
import { useGestorSacData } from '@/hooks/useGestorSacData'
import { LoadingFallback } from '@/components/LoadingFallback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Users, Clock, Headphones, User } from 'lucide-react'
import type { SacSolicitacao } from '@/hooks/useSacData'

export function GestorSacDashboard() {
  const { 
    solicitacoes, 
    loading, 
    error, 
    gestorEmail,
    totalSolicitacoes,
    solicitacoesHoje,
    problemasUrgentes,
    updateGestor,
    updateSolicitacaoLocal 
  } = useGestorSacData()
  
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<SacSolicitacao[]>([])
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SacSolicitacao | null>(null)

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
    console.log('🔄 [GestorSacDashboard] Solicitação atualizada:', updatedSolicitacao.id)
    updateSolicitacaoLocal(updatedSolicitacao.id, {
      email_gestor: updatedSolicitacao.email_gestor,
      nome_gestor: updatedSolicitacao.nome_gestor
    })

    // Atualizar a solicitação selecionada se for a mesma
    if (selectedSolicitacao && selectedSolicitacao.id === updatedSolicitacao.id) {
      setSelectedSolicitacao(updatedSolicitacao)
    }
  }

  // Função para abrir detalhes de uma solicitação
  const handleViewDetails = (solicitacao: SacSolicitacao) => {
    console.log('🔍 [GestorSacDashboard] Abrindo detalhes da solicitação:', solicitacao.id)
    
    // Buscar a versão mais atualizada da solicitação na lista
    const updatedSolicitacao = solicitacoes.find(s => s.id === solicitacao.id) || solicitacao
    setSelectedSolicitacao(updatedSolicitacao)
  }

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Headphones className="h-8 w-8 text-orange-500" />
          Minhas Solicitações SAC
        </h1>
        <p className="text-gray-400 mt-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Solicitações atribuídas a: {gestorEmail}
        </p>
      </div>

      {/* Métricas do Gestor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Minhas Solicitações</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSolicitacoes}</div>
            <CardDescription className="text-gray-500">Total atribuídas a você</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{solicitacoesHoje}</div>
            <CardDescription className="text-gray-500">Solicitações de hoje</CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{problemasUrgentes}</div>
            <CardDescription className="text-gray-500">Requerem atenção imediata</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Status quando não há solicitações */}
      {totalSolicitacoes === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Headphones className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nenhuma solicitação SAC atribuída
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Você ainda não possui solicitações SAC atribuídas. 
              Quando clientes enviarem solicitações e forem direcionadas para você, 
              elas aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <SacFilters 
            solicitacoes={solicitacoes}
            onFilterChange={setFilteredSolicitacoes}
          />

          {/* Tabela */}
          <SacTable 
            solicitacoes={filteredSolicitacoes.length > 0 ? filteredSolicitacoes : solicitacoes}
            onViewDetails={handleViewDetails}
          />
        </>
      )}

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
