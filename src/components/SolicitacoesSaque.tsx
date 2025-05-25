
import { useState, useEffect } from 'react'
import { supabase, type SolicitacaoSaque } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SolicitacoesSaque() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSaque[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSolicitacoes()
  }, [])

  const fetchSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_saque')
        .select(`
          *,
          todos_clientes (
            nome_cliente
          )
        `)
        .order('data_solicitacao', { ascending: false })

      if (error) {
        console.error('Erro ao buscar solicitações:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar solicitações de saque",
          variant: "destructive",
        })
      } else {
        setSolicitacoes(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatusSaque = async (id: string, novoStatus: string) => {
    setUpdatingStatus(id)
    
    try {
      const { error } = await supabase
        .from('solicitacoes_saque')
        .update({ 
          status_saque: novoStatus,
          processado_em: novoStatus === 'pago' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar status:', error)
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da solicitação",
          variant: "destructive",
        })
      } else {
        await fetchSolicitacoes()
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso",
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            🔄 Pendente
          </Badge>
        )
      case 'pago':
        return (
          <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            ✅ Pago
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  const totalPendente = solicitacoes
    .filter(s => s.status_saque === 'pendente')
    .reduce((sum, s) => sum + s.valor_comissao, 0)

  const totalPago = solicitacoes
    .filter(s => s.status_saque === 'pago')
    .reduce((sum, s) => sum + s.valor_comissao, 0)

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Carregando solicitações...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-contrast">Solicitações de Saque</h1>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">Total de Solicitações</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-contrast">{solicitacoes.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">🔄 Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {solicitacoes.filter(s => s.status_saque === 'pendente').length}
            </div>
            <p className="text-xs text-contrast-secondary">
              R$ {totalPendente.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-contrast">✅ Pagos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {solicitacoes.filter(s => s.status_saque === 'pago').length}
            </div>
            <p className="text-xs text-contrast-secondary">
              R$ {totalPago.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">
            Lista de Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/20">
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Gestor</TableHead>
                  <TableHead className="text-muted-foreground">Valor</TableHead>
                  <TableHead className="text-muted-foreground">Data Solicitação</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((solicitacao) => (
                  <TableRow 
                    key={solicitacao.id}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {(solicitacao as any).todos_clientes?.nome_cliente || 'Cliente não encontrado'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {solicitacao.nome_gestor}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <span className="font-mono text-green-600">
                        R$ {solicitacao.valor_comissao.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(solicitacao.data_solicitacao)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(solicitacao.status_saque)}
                    </TableCell>
                    <TableCell>
                      {solicitacao.status_saque === 'pendente' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                          onClick={() => updateStatusSaque(solicitacao.id, 'pago')}
                          disabled={updatingStatus === solicitacao.id}
                        >
                          {updatingStatus === solicitacao.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Marcar como Pago
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Processado em: {solicitacao.processado_em ? formatDate(solicitacao.processado_em) : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {solicitacoes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma solicitação de saque encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
