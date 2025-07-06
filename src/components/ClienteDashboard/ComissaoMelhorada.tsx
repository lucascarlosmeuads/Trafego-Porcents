
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
  Trash2
} from 'lucide-react'
import { CommissionCalculator } from '@/components/CommissionCalculator'

interface Venda {
  id: string
  valor_venda: number
  data_venda: string
  produto_vendido: string
  observacoes?: string
}

export function ComissaoMelhorada() {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')
  const [porcentagemComissao, setPorcentagemComissao] = useState('')
  const [valorFixoComissao, setValorFixoComissao] = useState('')
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
      setValorFixoComissao(cliente.valor_comissao.toString())
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

  const calcularComissaoEmDinheiro = () => {
    const porcentagem = parseFloat(porcentagemComissao)
    const vendaMedia = vendas.length > 0 
      ? vendas.reduce((acc, venda) => acc + venda.valor_venda, 0) / vendas.length 
      : 500 // valor padrão para exemplo

    if (porcentagem && vendaMedia) {
      return (vendaMedia * porcentagem) / 100
    }
    return 0
  }

  const handleConfirmarComissao = async () => {
    if (!user?.email) return
    
    const porcentagem = parseFloat(porcentagemComissao)
    const valorFixo = parseFloat(valorFixoComissao)
    
    if (!porcentagem || porcentagem <= 0 || porcentagem > 50) {
      setErro('Por favor, insira uma porcentagem válida entre 1% e 50%')
      return
    }
    
    if (!valorFixo || valorFixo <= 0) {
      setErro('Por favor, insira um valor fixo válido para a comissão')
      return
    }
    
    setConfirmando(true)
    setErro('')
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: valorFixo
        })
        .eq('email_cliente', user.email)

      if (error) throw error

      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
      
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
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Comissão Confirmada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Valor Confirmado: {formatCurrency(cliente?.valor_comissao || 0)}
                </span>
              </div>
              <p className="text-sm text-green-700">
                ✅ Você confirmou o valor da sua comissão. Este valor será cobrado mensalmente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Vendas */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Registrar Suas Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valorVenda">Valor da Venda (R$)</Label>
                <Input
                  id="valorVenda"
                  type="number"
                  step="0.01"
                  value={novaVenda.valor}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="Ex: 500.00"
                />
              </div>
              <div>
                <Label htmlFor="produtoVenda">Produto/Serviço</Label>
                <Input
                  id="produtoVenda"
                  value={novaVenda.produto}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, produto: e.target.value }))}
                  placeholder="Ex: Landing Page"
                />
              </div>
              <div>
                <Label htmlFor="observacoesVenda">Observações (opcional)</Label>
                <Input
                  id="observacoesVenda"
                  value={novaVenda.observacoes}
                  onChange={(e) => setNovaVenda(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Ex: Cliente Premium"
                />
              </div>
            </div>

            <Button
              onClick={handleAdicionarVenda}
              disabled={adicionandoVenda || !novaVenda.valor || !novaVenda.produto}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {adicionandoVenda ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Venda
                </>
              )}
            </Button>

            {/* Lista de Vendas */}
            {vendas.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Suas Vendas Registradas</h4>
                <div className="space-y-2">
                  {vendas.map((venda) => (
                    <div key={venda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{formatCurrency(venda.valor_venda)} - {venda.produto_vendido}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                          {venda.observacoes && ` • ${venda.observacoes}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletarVenda(venda.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
              ✅ Operação realizada com sucesso!
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
            Defina Sua Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Explicação Clara */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Você precisa definir:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Porcentagem (%)</strong> que você quer pagar sobre cada venda</li>
                  <li>• <strong>Valor fixo (R$)</strong> que isso representa em dinheiro</li>
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
                Porcentagem da Comissão (%)
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
              />
              <p className="text-xs text-gray-500">
                Porcentagem que você pagará sobre cada venda
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorFixo" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Fixo Mensal (R$)
              </Label>
              <Input
                id="valorFixo"
                type="number"
                step="0.01"
                min="10"
                value={valorFixoComissao}
                onChange={(e) => setValorFixoComissao(e.target.value)}
                placeholder="Ex: 150.00"
              />
              <p className="text-xs text-gray-500">
                Valor fixo que você pagará mensalmente
              </p>
            </div>
          </div>

          {/* Calculadora Visual */}
          {porcentagemComissao && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Exemplo de Cálculo:</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>Se você vender R$ 500,00 com {porcentagemComissao}% de comissão:</p>
                <p className="font-semibold">
                  R$ 500,00 × {porcentagemComissao}% = {formatCurrency(500 * (parseFloat(porcentagemComissao) || 0) / 100)}
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
                ✅ Comissão confirmada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleConfirmarComissao}
            disabled={confirmando || !porcentagemComissao || !valorFixoComissao}
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
                Salvar Comissão ({porcentagemComissao}% = {formatCurrency(parseFloat(valorFixoComissao) || 0)})
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao salvar, você confirma que pagará {porcentagemComissao}% sobre cada venda ou {formatCurrency(parseFloat(valorFixoComissao) || 0)} mensalmente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
