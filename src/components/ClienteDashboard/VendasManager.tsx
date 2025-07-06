
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { 
  CheckCircle,
  AlertCircle,
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  ShoppingCart
} from 'lucide-react'

interface Venda {
  id: string
  valor_venda: number
  data_venda: string
  produto_vendido: string
  observacoes?: string
}

interface VendasManagerProps {
  porcentagemAtual: number
}

export function VendasManager({ porcentagemAtual }: VendasManagerProps) {
  const { user } = useAuth()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [novaVenda, setNovaVenda] = useState({
    valor: '',
    produto: '',
    observacoes: ''
  })
  const [adicionandoVenda, setAdicionandoVenda] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    carregarVendas()
  }, [])

  const carregarVendas = async () => {
    if (!user?.email) return
    
    try {
      const { data, error } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', user.email)
        .order('data_venda', { ascending: false })

      if (error) throw error
      setVendas(data || [])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    }
  }

  const handleAdicionarVenda = async () => {
    if (!user?.email || !novaVenda.valor || !novaVenda.produto) {
      setErro('Preencha pelo menos o valor e o produto da venda')
      return
    }

    setAdicionandoVenda(true)
    setErro('')

    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .insert({
          email_cliente: user.email,
          valor_venda: parseFloat(novaVenda.valor),
          produto_vendido: novaVenda.produto,
          observacoes: novaVenda.observacoes || null,
          data_venda: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      setNovaVenda({ valor: '', produto: '', observacoes: '' })
      await carregarVendas()
      setSucesso(true)
      setTimeout(() => setSucesso(false), 2000)

    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      setErro('Erro ao registrar venda. Tente novamente.')
    } finally {
      setAdicionandoVenda(false)
    }
  }

  const handleDeletarVenda = async (vendaId: string) => {
    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .delete()
        .eq('id', vendaId)

      if (error) throw error
      await carregarVendas()
    } catch (error) {
      console.error('Erro ao deletar venda:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Seção PRINCIPAL: Registrar Vendas */}
      <Card className="w-full border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ShoppingCart className="w-6 h-6" />
            Registrar Suas Vendas do Dia a Dia
          </CardTitle>
          <p className="text-sm text-blue-600 mt-2">
            Registre cada venda que você fizer e veja sua comissão aumentar automaticamente
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Formulário de Nova Venda */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Adicionar Nova Venda
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="valorVenda" className="text-sm font-medium">Valor da Venda (R$) *</Label>
                <Input
                  id="valorVenda"
                  type="number"
                  step="0.01"
                  value={novaVenda.valor}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="Ex: 500.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="produtoVenda" className="text-sm font-medium">Produto/Serviço *</Label>
                <Input
                  id="produtoVenda"
                  value={novaVenda.produto}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, produto: e.target.value }))}
                  placeholder="Ex: Landing Page"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="observacoesVenda" className="text-sm font-medium">Observações</Label>
                <Input
                  id="observacoesVenda"
                  value={novaVenda.observacoes}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Ex: Cliente Premium"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preview do Cálculo */}
            {novaVenda.valor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <Calculator className="w-4 h-4" />
                  <span>
                    Comissão desta venda: {formatCurrency(parseFloat(novaVenda.valor || '0') * porcentagemAtual / 100)}
                    <span className="text-blue-500 ml-2">
                      ({formatCurrency(parseFloat(novaVenda.valor || '0'))} × {porcentagemAtual}%)
                    </span>
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAdicionarVenda}
              disabled={adicionandoVenda || !novaVenda.valor || !novaVenda.produto}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              {adicionandoVenda ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Registrando Venda...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Venda
                </>
              )}
            </Button>
          </div>

          {/* Lista de Vendas Registradas */}
          {vendas.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Suas Vendas Registradas ({vendas.length})
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {vendas.map((venda) => (
                  <div key={venda.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {formatCurrency(venda.valor_venda)} - {venda.produto_vendido}
                      </div>
                      <div className="text-sm text-gray-600">
                        📅 {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                        {venda.observacoes && (
                          <span className="ml-2">• {venda.observacoes}</span>
                        )}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Comissão: {formatCurrency(venda.valor_venda * porcentagemAtual / 100)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletarVenda(venda.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vendas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma venda registrada ainda</p>
              <p className="text-sm">Registre sua primeira venda acima!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensagens de Erro e Sucesso */}
      {erro && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {erro}
          </AlertDescription>
        </Alert>
      )}

      {sucesso && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Venda registrada com sucesso!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
