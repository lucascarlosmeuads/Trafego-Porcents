
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Plus, User, AlertCircle } from 'lucide-react'
import { supabase, type ComissaoHistorico } from '@/lib/supabase'
import { formatCurrency } from '@/utils/currencyUtils'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { AddPagamentoModal } from './AddPagamentoModal'

interface HistoricoPagamentosModalProps {
  clienteId: string
  nomeCliente: string
  totalPago?: number
  valorComissao?: number
  onPagamentoAdicionado?: () => void
}

export function HistoricoPagamentosModal({
  clienteId,
  nomeCliente,
  totalPago = 0,
  valorComissao = 60,
  onPagamentoAdicionado
}: HistoricoPagamentosModalProps) {
  const [open, setOpen] = useState(false)
  const [historico, setHistorico] = useState<ComissaoHistorico[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { isAdmin } = useAuth()

  const fetchHistorico = async () => {
    if (!open) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('historico_pagamentos_comissao')
        .select('*')
        .eq('cliente_id', parseInt(clienteId))
        .order('data_pagamento', { ascending: false })

      if (error) {
        console.error('Erro ao buscar histórico:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar histórico de pagamentos",
          variant: "destructive"
        })
        return
      }

      setHistorico(data || [])
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistorico()
  }, [open])

  const handlePagamentoAdicionado = () => {
    fetchHistorico()
    onPagamentoAdicionado?.()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }

  const valorRestante = Math.max(0, valorComissao - totalPago)
  const statusPagamento = totalPago >= valorComissao ? 'completo' : totalPago > 0 ? 'parcial' : 'pendente'

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Histórico
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Histórico de Pagamentos - {nomeCliente}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Valor Total</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(valorComissao)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Total Pago</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPago)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className={`border rounded-lg p-4 ${
                statusPagamento === 'completo' 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      statusPagamento === 'completo' ? 'text-gray-800' : 'text-orange-800'
                    }`}>
                      {statusPagamento === 'completo' ? 'Pago Integralmente' : 'Valor Restante'}
                    </p>
                    <p className={`text-2xl font-bold ${
                      statusPagamento === 'completo' ? 'text-gray-900' : 'text-orange-900'
                    }`}>
                      {formatCurrency(valorRestante)}
                    </p>
                  </div>
                  {statusPagamento === 'completo' ? (
                    <User className="h-8 w-8 text-gray-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge className={
                statusPagamento === 'completo' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : statusPagamento === 'parcial'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
              }>
                {statusPagamento === 'completo' && '✅ Pagamento Completo'}
                {statusPagamento === 'parcial' && '⚠️ Pagamento Parcial'}
                {statusPagamento === 'pendente' && '❌ Pagamento Pendente'}
              </Badge>
              
              {isAdmin && statusPagamento !== 'completo' && (
                <Button 
                  onClick={() => setShowAddModal(true)} 
                  size="sm" 
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Pagamento
                </Button>
              )}
            </div>

            {/* Tabela de Histórico */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data do Pagamento</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Pago Por</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Carregando histórico...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : historico.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p>Nenhum pagamento registrado ainda</p>
                          <p className="text-sm">Os pagamentos aparecerão aqui quando forem adicionados</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historico.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(pagamento.data_pagamento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            {formatCurrency(pagamento.valor_pago)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {pagamento.pago_por}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {pagamento.observacoes || 'Sem observações'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar pagamento */}
      <AddPagamentoModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        clienteId={clienteId}
        nomeCliente={nomeCliente}
        valorRestante={valorRestante}
        onPagamentoAdicionado={handlePagamentoAdicionado}
      />
    </>
  )
}
