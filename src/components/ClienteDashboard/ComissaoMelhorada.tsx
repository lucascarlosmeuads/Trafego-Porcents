import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  CheckCircle, 
  Info, 
  AlertCircle,
  Percent,
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

export function ComissaoMelhorada() {
  const { user } = useAuth()
  const { cliente, refreshData } = useClienteData(user?.email || '')
  const [porcentagemComissao, setPorcentagemComissao] = useState('')
  const [valorReferencia, setValorReferencia] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [novaVenda, setNovaVenda] = useState({
    valor: '',
    produto: '',
    observacoes: ''
  })
  const [adicionandoVenda, setAdicionandoVenda] = useState(false)

  const comissaoConfirmada = cliente?.comissao_confirmada || false

  useEffect(() => {
    if (cliente?.valor_comissao && !comissaoConfirmada) {
      // Se houver um valor anterior, tentar deduzir a porcentagem (assumindo valor médio de venda de R$ 500)
      const porcentagemEstimada = (cliente.valor_comissao / 500) * 100
      setPorcentagemComissao(porcentagemEstimada.toString())
    }
    carregarVendas()
  }, [cliente, comissaoConfirmada])

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

  const calcularTotalVendas = () => {
    return vendas.reduce((total, venda) => total + venda.valor_venda, 0)
  }

  const calcularComissaoDevida = () => {
    const totalVendas = calcularTotalVendas()
    const porcentagem = parseFloat(cliente?.valor_comissao?.toString() || '0')
    return (totalVendas * porcentagem) / 100
  }

  const handleConfirmarComissao = async () => {
    if (!user?.email) return
    
    const porcentagem = parseFloat(porcentagemComissao)
    
    if (!porcentagem || porcentagem <= 0 || porcentagem > 50) {
      setErro('Por favor, insira uma porcentagem válida entre 1% e 50%')
      return
    }
    
    setConfirmando(true)
    setErro('')
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: porcentagem // Salvamos apenas a porcentagem configurada
        })
        .eq('email_cliente', user.email)

      if (error) throw error

      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
      
      // CORREÇÃO: Recarregar dados após salvar para mostrar seção de vendas
      await refreshData()
      
    } catch (error) {
      console.error('Erro ao confirmar comissão:', error)
      setErro('Erro ao confirmar comissão. Tente novamente.')
    } finally {
      setConfirmando(false)
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

  if (comissaoConfirmada) {
    const porcentagemAtual = cliente?.valor_comissao || 0
    const totalVendas = calcularTotalVendas()
    const comissaoDevida = calcularComissaoDevida()

    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Comissão Configurada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Porcentagem Confirmada: {porcentagemAtual}%
                </span>
              </div>
              <p className="text-sm text-green-700">
                ✅ Você confirmou {porcentagemAtual}% de comissão sobre cada venda.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo da Comissão */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-5 h-5" />
              Resumo da Comissão Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalVendas)}</div>
                <div className="text-sm text-blue-600">Total de Vendas</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{porcentagemAtual}%</div>
                <div className="text-sm text-green-600">Porcentagem</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-700">{formatCurrency(comissaoDevida)}</div>
                <div className="text-sm text-orange-600">Comissão Devida</div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-600 text-center">
                <Calculator className="w-4 h-4 inline mr-1" />
                Cálculo: {formatCurrency(totalVendas)} × {porcentagemAtual}% = {formatCurrency(comissaoDevida)}
              </div>
            </div>
          </CardContent>
        </Card>

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

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            Configure Sua Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Explicação Clara */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Defina a porcentagem que você pagará sobre cada venda:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Porcentagem (%)</strong> que você quer pagar sobre cada venda</li>
                  <li>• <strong>Valor de referência (opcional)</strong> - quanto você acha que isso vale em dinheiro</li>
                  <li>• Depois clique em <strong>"Salvar"</strong> para confirmar</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Inputs de Comissão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="porcentagem" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Porcentagem da Comissão (%) *
              </Label>
              <Input
                id="porcentagem"
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={porcentagemComissao}
                onChange={(e) => setPorcentagemComissao(e.target.value)}
                placeholder="Ex: 10 (para 10%)"
                className="border-blue-200 focus:border-blue-400"
              />
              <p className="text-xs text-gray-500">
                Porcentagem que você pagará sobre cada venda
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorReferencia" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor de Referência (R$) - Opcional
              </Label>
              <Input
                id="valorReferencia"
                type="number"
                step="0.01"
                min="0"
                value={valorReferencia}
                onChange={(e) => setValorReferencia(e.target.value)}
                placeholder="Ex: 50.00"
                className="border-gray-200"
              />
              <p className="text-xs text-gray-500">
                Apenas para referência - quanto você acha que {porcentagemComissao}% vale
              </p>
            </div>
          </div>

          {/* Exemplo de Cálculo */}
          {porcentagemComissao && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Exemplo de Cálculo:</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>Se você vender R$ 1.000,00 com {porcentagemComissao}% de comissão:</p>
                <p className="font-semibold">
                  R$ 1.000,00 × {porcentagemComissao}% = {formatCurrency(1000 * (parseFloat(porcentagemComissao) || 0) / 100)}
                </p>
              </div>
            </div>
          )}

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
                ✅ Comissão configurada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleConfirmarComissao}
            disabled={confirmando || !porcentagemComissao}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            {confirmando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 w-4 mr-2" />
                Salvar Comissão ({porcentagemComissao}%)
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao salvar, você confirma que pagará {porcentagemComissao}% sobre cada venda registrada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
