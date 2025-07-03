
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface NovoPagamentoFormProps {
  onRegistrarPagamento: (valor: number, observacoes: string) => Promise<void>
  adicionandoPagamento: boolean
}

export function NovoPagamentoForm({
  onRegistrarPagamento,
  adicionandoPagamento
}: NovoPagamentoFormProps) {
  const [novoValor, setNovoValor] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const handleSubmit = async () => {
    const valor = parseFloat(novoValor.replace(',', '.'))
    
    if (isNaN(valor) || valor <= 0) {
      return
    }

    await onRegistrarPagamento(valor, observacoes)
    setNovoValor('')
    setObservacoes('')
  }

  return (
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
          onClick={handleSubmit}
          disabled={!novoValor || adicionandoPagamento}
          className="w-full"
        >
          {adicionandoPagamento ? 'Registrando...' : 'Registrar Pagamento'}
        </Button>
      </CardContent>
    </Card>
  )
}
