
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { useComissaoAvancada, type HistoricoPagamento } from '@/hooks/useComissaoAvancada'
import { Cliente } from '@/lib/supabase'
import { 
  History, 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  Star
} from 'lucide-react'

interface HistoricoPagamentosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente
  onPagamentoRegistrado?: () => void
}

export function HistoricoPagamentosModal({
  open,
  onOpenChange,
  cliente,
  onPagamentoRegistrado
}: HistoricoPagamentosModalProps) {
  const [historico, setHistorico] = useState<HistoricoPagamento[]>([])
  const [novoValor, setNovoValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [adicionandoPagamento, setAdicionandoPagamento] = useState(false)
  
  const { 
    buscarHistoricoPagamentos, 
    registrarPagamento, 
    loading 
  } = useComissaoAvancada()

  useEffect(() => {
    if (open && cliente.id) {
      carregarHistorico()
    }
  }, [open, cliente.id])

  const carregarHistorico = async () => {
    const dados = await buscarHistoricoPagamentos(cliente.id)
    setHistorico(dados)
  }

  const handleRegistrarPagamento = async () => {
    const valor = parseFloat(novoValor.replace(',', '.'))
    
    if (isNaN(valor) || valor <= 0) {
      return
    }

    setAdicionandoPagamento(true)
    const sucesso = await registrarPagamento(cliente.id, valor, observacoes)
    
    if (sucesso) {
      setNovoValor('')
      setObservacoes('')
      await carregarHistorico()
      onPagamentoRegistrado?.()
    }
    
    setAdicionandoPagamento(false)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPago = historico.reduce((sum, pag) => sum + pag.valor_pago, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Pagamentos - {cliente.nome_cliente}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalPago)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamentos</p>
                    <p className="text-2xl font-bold">{historico.length}</p>
                  </div>
                  <History className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status Atual</p>
                    <Badge 
                      variant={cliente.comissao === 'Pago' ? 'default' : 'destructive'}
                      className="mt-1"
                    >
                      {cliente.comissao || 'Pendente'}
                    </Badge>
                  </div>
                  {cliente.eh_ultimo_pago && (
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adicionar novo pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                Registrar Novo Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="60.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre o pagamento..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <Button 
                onClick={handleRegistrarPagamento}
                disabled={!novoValor || adicionandoPagamento}
                className="w-full"
              >
                {adicionandoPagamento ? 'Registrando...' : 'Registrar Pagamento'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de pagamentos */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Histórico Completo
              </CardTitle>
              <CardDescription>
                {historico.length} pagamento(s) registrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] p-4">
                {historico.length > 0 ? (
                  <div className="space-y-4">
                    {historico.map((pagamento, index) => (
                      <div key={pagamento.id}>
                        <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-lg text-green-600">
                                {formatCurrency(pagamento.valor_pago)}
                              </span>
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  Mais recente
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(pagamento.data_pagamento)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {pagamento.pago_por}
                              </div>
                            </div>
                            
                            {pagamento.observacoes && (
                              <div className="flex items-start gap-1 text-sm">
                                <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {pagamento.observacoes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {index < historico.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pagamento registrado ainda</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
