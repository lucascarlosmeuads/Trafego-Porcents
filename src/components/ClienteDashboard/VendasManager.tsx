
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Plus, DollarSign, Calendar, Package, Trash2 } from 'lucide-react'
import type { VendaCliente } from '@/hooks/useClienteData'

interface VendasManagerProps {
  emailCliente: string
  vendas: VendaCliente[]
  onVendasUpdated: () => void
}

export function VendasManager({ emailCliente, vendas, onVendasUpdated }: VendasManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [comissaoPorVenda, setComissaoPorVenda] = useState(60)
  const [novaVenda, setNovaVenda] = useState({
    produto_vendido: '',
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0],
    observacoes: ''
  })
  const { toast } = useToast()

  const totalVendas = vendas.reduce((sum, venda) => sum + Number(venda.valor_venda || 0), 0)
  const totalComissoes = vendas.length * comissaoPorVenda

  const handleAddVenda = async () => {
    if (!novaVenda.valor_venda) {
      toast({
        title: "Erro",
        description: "O valor da venda é obrigatório.",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .insert({
          email_cliente: emailCliente,
          produto_vendido: novaVenda.produto_vendido || 'Produto não especificado',
          valor_venda: parseFloat(novaVenda.valor_venda),
          data_venda: novaVenda.data_venda,
          observacoes: novaVenda.observacoes
        })

      if (error) throw error

      toast({
        title: "Venda registrada!",
        description: "Sua venda foi adicionada com sucesso.",
      })

      setNovaVenda({
        produto_vendido: '',
        valor_venda: '',
        data_venda: new Date().toISOString().split('T')[0],
        observacoes: ''
      })
      setIsAdding(false)
      onVendasUpdated()

    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      toast({
        title: "Erro ao registrar venda",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Vendas</h1>
        <p className="text-muted-foreground">Registre e acompanhe suas vendas</p>
      </div>

      {/* Configuração de Comissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Configuração de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comissao">Quanto você pagará de comissão por venda para a equipe?</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">R$</span>
                <Input
                  id="comissao"
                  type="number"
                  value={comissaoPorVenda}
                  onChange={(e) => setComissaoPorVenda(Number(e.target.value))}
                  className="w-32"
                  min="0"
                  step="0.01"
                />
                <span className="text-sm text-muted-foreground">por venda</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendas.length}</div>
            <p className="text-xs text-muted-foreground">vendas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">para a equipe</p>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar Nova Venda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registrar Nova Venda</CardTitle>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            )}
          </div>
        </CardHeader>
        {isAdding && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="produto">Nome do Produto (opcional)</Label>
                <Input
                  id="produto"
                  value={novaVenda.produto_vendido}
                  onChange={(e) => setNovaVenda({ ...novaVenda, produto_vendido: e.target.value })}
                  placeholder="Ex: Curso de Marketing Digital"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor da Venda *</Label>
                <Input
                  id="valor"
                  type="number"
                  value={novaVenda.valor_venda}
                  onChange={(e) => setNovaVenda({ ...novaVenda, valor_venda: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data da Venda</Label>
                <Input
                  id="data"
                  type="date"
                  value={novaVenda.data_venda}
                  onChange={(e) => setNovaVenda({ ...novaVenda, data_venda: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={novaVenda.observacoes}
                onChange={(e) => setNovaVenda({ ...novaVenda, observacoes: e.target.value })}
                placeholder="Adicione detalhes sobre a venda..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddVenda}>
                Registrar Venda
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda registrada ainda.</p>
              <p className="text-sm">Clique em "Nova Venda" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vendas.map((venda) => (
                <div key={venda.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="font-medium">
                        {venda.produto_vendido || 'Produto não especificado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {Number(venda.valor_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {venda.observacoes && (
                      <p className="text-sm text-muted-foreground mt-1">{venda.observacoes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        R$ {comissaoPorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-muted-foreground">comissão</div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
