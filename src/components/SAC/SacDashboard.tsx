
import { useState } from 'react'
import { SacTable } from './SacTable'
import { SacFilters } from './SacFilters'
import { SacDetailsModal } from './SacDetailsModal'
import { useSacData, type SacSolicitacao } from '@/hooks/useSacData'
import { LoadingFallback } from '@/components/LoadingFallback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Users, Clock, CheckCircle } from 'lucide-react'

export function SacDashboard() {
  const { solicitacoes, loading, error } = useSacData()
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

  // Calcular métricas
  const totalSolicitacoes = solicitacoes.length
  const solicitacoesHoje = solicitacoes.filter(s => {
    const hoje = new Date().toDateString()
    const dataSolicitacao = new Date(s.created_at).toDateString()
    return hoje === dataSolicitacao
  }).length

  const problemasUrgentes = solicitacoes.filter(s => 
    s.tipo_problema.toLowerCase().includes('urgente') || 
    s.tipo_problema.toLowerCase().includes('crítico')
  ).length

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitacoesHoje}</div>
            <CardDescription>Solicitações de hoje</CardDescription>
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
      </div>

      {/* Filtros */}
      <SacFilters 
        solicitacoes={solicitacoes}
        onFilterChange={setFilteredSolicitacoes}
      />

      {/* Tabela */}
      <SacTable 
        solicitacoes={filteredSolicitacoes.length > 0 ? filteredSolicitacoes : solicitacoes}
        onViewDetails={setSelectedSolicitacao}
      />

      {/* Modal de detalhes */}
      {selectedSolicitacao && (
        <SacDetailsModal
          solicitacao={selectedSolicitacao}
          onClose={() => setSelectedSolicitacao(null)}
        />
      )}
    </div>
  )
}
