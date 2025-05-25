
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import type { VendaCliente } from '@/hooks/useClienteData'

interface VendasManagerProps {
  emailCliente: string
  vendas: VendaCliente[]
  onVendasUpdated: () => void
}

export function VendasManager({ emailCliente, vendas, onVendasUpdated }: VendasManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    produto_vendido: '',
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .insert({
          email_cliente: emailCliente,
          produto_vendido: formData.produto_vendido,
          valor_venda: Number(formData.valor_venda),
          data_venda: formData.data_venda,
          observacoes: formData.observacoes || null
        })

      if (error) throw error

      toast({
        title: "Venda registrada!",
        description: "A venda foi adicionada com sucesso.",
      })

      setFormData({
        produto_vendido: '',
        valor_venda: '',
        data_venda: new Date().toISOString().split('T')[0],
        observacoes: ''
      })
      setIsAdding(false)
      onVendasUpdated()

    } catch (error) {
      console.error('Erro ao registrar venda:', error)
      toast({
        title: "Erro ao registrar venda",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVenda = async (vendaId: string) => {
    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .delete()
        .eq('id', vendaId)

      if (error) throw error

      toast({
        title: "Venda removida",
        description: "A venda foi removida com sucesso.",
      })

      onVendasUpdated()

    } catch (error) {
      console.error('Erro ao remover venda:', error)
      toast({
        title: "Erro ao remover venda",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    }
  }

  const totalVendas = vendas.reduce((sum, venda) => sum + venda.valor_venda, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Registro de Vendas
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo das vendas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              <span className="text-lg font-bold">R$ {totalVendas.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">Total em Vendas</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{vendas.length}</div>
            <p className="text-sm text-gray-600">Vendas Registradas</p>
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Registrar Nova Venda</h4>
            
            <div>
              <Label htmlFor="produto_vendido">Produto Vendido *</Label>
              <Input
                id="produto_vendido"
                value={formData.produto_vendido}
                onChange={(e) => setFormData(prev => ({ ...prev, produto_vendido: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="valor_venda">Valor da Venda (R$) *</Label>
              <Input
                id="valor_venda"
                type="number"
                step="0.01"
                value={formData.valor_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_venda: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="data_venda">Data da Venda *</Label>
              <Input
                id="data_venda"
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre a venda..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Venda'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de vendas */}
        {vendas.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Vendas Registradas</h4>
            {vendas.map((venda) => (
              <div key={venda.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{venda.produto_vendido}</p>
                  <p className="text-sm text-gray-600">
                    R$ {venda.valor_venda.toFixed(2)} • {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                  </p>
                  {venda.observacoes && (
                    <p className="text-xs text-gray-500 mt-1">{venda.observacoes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVenda(venda.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Nenhuma venda registrada ainda. Clique em "Nova Venda" para começar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
