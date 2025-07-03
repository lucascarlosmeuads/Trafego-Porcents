
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useComissaoAvancada, type HistoricoPagamento } from '@/hooks/useComissaoAvancada'
import { Cliente } from '@/lib/supabase'
import { PagamentoResumoCards } from './HistoricoPagamentosModal/PagamentoResumoCards'
import { NovoPagamentoForm } from './HistoricoPagamentosModal/NovoPagamentoForm'
import { HistoricoPagamentosList } from './HistoricoPagamentosModal/HistoricoPagamentosList'
import { History } from 'lucide-react'

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
    const dados = await buscarHistoricoPagamentos(String(cliente.id))
    setHistorico(dados)
  }

  const handleRegistrarPagamento = async (valor: number, observacoes: string) => {
    setAdicionandoPagamento(true)
    const sucesso = await registrarPagamento(String(cliente.id), valor, observacoes)
    
    if (sucesso) {
      await carregarHistorico()
      onPagamentoRegistrado?.()
    }
    
    setAdicionandoPagamento(false)
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
          <PagamentoResumoCards
            totalPago={totalPago}
            totalPagamentos={historico.length}
            cliente={cliente}
          />

          <NovoPagamentoForm
            onRegistrarPagamento={handleRegistrarPagamento}
            adicionandoPagamento={adicionandoPagamento}
          />

          <HistoricoPagamentosList historico={historico} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
