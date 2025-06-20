
import { useState } from 'react'
import { useSolicitacoesSaque } from '@/hooks/useSolicitacoesSaque'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DollarSign, Clock, CheckCircle, XCircle, User, Calendar, AlertCircle } from 'lucide-react'
import type { SolicitacaoSaque } from '@/hooks/useSolicitacoesSaque'

export function SaquesDashboard() {
  const { solicitacoes, loading, updateStatusSaque } = useSolicitacoesSaque()
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoSaque | null>(null)
  const [updating, setUpdating] = useState(false)

  const handleUpdateStatus = async (status: 'aprovado' | 'rejeitado') => {
    if (!selectedSolicitacao) return

    setUpdating(true)
    const success = await updateStatusSaque(selectedSolicitacao.id, status)

    if (success) {
      setSelectedSolicitacao(null)
    }

    setUpdating(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return solicitacoes.filter(s => s.status_saque === status).length
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Solicitações de Saque
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as solicitações de saque dos gestores
          </p>
        </div>
      </div>

      {/* Cards de resumo por status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pendente')}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('aprovado')}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('rejeitado')}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitações */}
      <div className="space-y-4">
        {solicitacoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma solicitação de saque encontrada</p>
              <p className="text-gray-400 text-sm mt-2">
                As solicitações de saque aparecerão aqui quando os gestores solicitarem
              </p>
            </CardContent>
          </Card>
        ) : (
          solicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {solicitacao.nome_gestor}
                      </h3>
                      {getStatusBadge(solicitacao.status_saque)}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Cliente ID: {solicitacao.cliente_id}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{solicitacao.email_gestor}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(solicitacao.valor_comissao)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Solicitado em {new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {solicitacao.processado_em && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Processado em {new Date(solicitacao.processado_em).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {solicitacao.status_saque === 'pendente' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSolicitacao(solicitacao)}
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Processar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Processar Solicitação - {solicitacao.nome_gestor}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p><strong>Gestor:</strong> {solicitacao.nome_gestor}</p>
                              <p><strong>Email:</strong> {solicitacao.email_gestor}</p>
                              <p><strong>Cliente ID:</strong> {solicitacao.cliente_id}</p>
                              <p><strong>Valor:</strong> {formatCurrency(solicitacao.valor_comissao)}</p>
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedSolicitacao(null)}
                                disabled={updating}
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleUpdateStatus('rejeitado')}
                                disabled={updating}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {updating ? 'Processando...' : 'Rejeitar'}
                              </Button>
                              <Button
                                onClick={() => handleUpdateStatus('aprovado')}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {updating ? 'Processando...' : 'Aprovar'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
