
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

interface VendaCliente {
  id: string
  valor: number
  data: string
  produto: string
}

interface VendasManagerProps {
  emailCliente: string
  vendas: VendaCliente[]
  onVendasUpdated: () => void
  onBack?: () => void
}

export function VendasManager({ emailCliente, vendas, onVendasUpdated, onBack }: VendasManagerProps) {
  const [novasVendas, setNovasVendas] = useState<VendaCliente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setNovasVendas(vendas)
  }, [vendas])

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedVendas = [...novasVendas]
    updatedVendas[index][field as keyof VendaCliente] = value as any
    setNovasVendas(updatedVendas)
  }

  const handleAddVenda = () => {
    setNovasVendas([
      ...novasVendas,
      {
        id: String(Date.now()),
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        produto: ''
      }
    ])
  }

  const handleRemoveVenda = (id: string) => {
    setNovasVendas(novasVendas.filter(venda => venda.id !== id))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('vendas_clientes')
        .upsert(
          novasVendas.map(venda => ({
            ...venda,
            email_cliente: emailCliente
          })),
          { onConflict: 'id' }
        )

      if (error) {
        console.error('Erro ao atualizar vendas:', error)
        alert('Erro ao atualizar vendas. Consulte o console para mais detalhes.')
      } else {
        alert('Vendas atualizadas com sucesso!')
        onVendasUpdated()
      }
    } catch (error) {
      console.error('Erro ao atualizar vendas:', error)
      alert('Erro ao atualizar vendas. Consulte o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Gerenciar Vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Registre e acompanhe suas vendas para uma gestão eficaz da sua campanha.
          </p>

          {novasVendas.map((venda, index) => (
            <div key={venda.id} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={venda.data}
                onChange={e => handleInputChange(index, 'data', e.target.value)}
              />
              <input
                type="text"
                placeholder="Produto"
                className="border rounded px-3 py-2"
                value={venda.produto}
                onChange={e => handleInputChange(index, 'produto', e.target.value)}
              />
              <input
                type="number"
                placeholder="Valor"
                className="border rounded px-3 py-2"
                value={String(venda.valor)}
                onChange={e => handleInputChange(index, 'valor', e.target.value)}
              />
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRemoveVenda(venda.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleAddVenda}>
              Adicionar Venda
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Vendas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
