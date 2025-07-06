
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  CheckCircle, 
  Info, 
  AlertCircle,
  Percent,
  Calculator
} from 'lucide-react'

interface ComissaoConfigProps {
  onConfirmarComissao: (porcentagem: number) => Promise<void>
  valorComissaoAnterior?: number
}

export function ComissaoConfig({ onConfirmarComissao, valorComissaoAnterior }: ComissaoConfigProps) {
  const [porcentagemComissao, setPorcentagemComissao] = useState('')
  const [valorReferencia, setValorReferencia] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  React.useEffect(() => {
    if (valorComissaoAnterior && !porcentagemComissao) {
      setPorcentagemComissao(valorComissaoAnterior.toString())
    }
  }, [valorComissaoAnterior, porcentagemComissao])

  const handleConfirmarComissao = async () => {
    console.log('🔄 [ComissaoConfig] Iniciando confirmação de comissão')
    
    const porcentagem = parseFloat(porcentagemComissao)
    
    if (!porcentagem || porcentagem <= 0 || porcentagem > 50) {
      console.error('❌ [ComissaoConfig] Porcentagem inválida:', porcentagem)
      setErro('Por favor, insira uma porcentagem válida entre 1% e 50%')
      return
    }
    
    console.log('✅ [ComissaoConfig] Porcentagem válida:', porcentagem)
    setConfirmando(true)
    setErro('')
    setSucesso(false)
    
    try {
      console.log('📤 [ComissaoConfig] Chamando onConfirmarComissao...')
      await onConfirmarComissao(porcentagem)
      
      console.log('✅ [ComissaoConfig] Comissão confirmada com sucesso!')
      setSucesso(true)
      
      // Limpar sucesso após 3 segundos
      setTimeout(() => {
        console.log('🔄 [ComissaoConfig] Limpando estado de sucesso')
        setSucesso(false)
      }, 3000)
      
    } catch (error) {
      console.error('💥 [ComissaoConfig] Erro ao confirmar comissão:', error)
      const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido'
      setErro(`Erro ao confirmar comissão: ${mensagemErro}`)
    } finally {
      setConfirmando(false)
    }
  }

  return (
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
              disabled={confirmando}
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
              disabled={confirmando}
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
              ✅ Comissão configurada com sucesso! Agora você pode registrar suas vendas.
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
              Salvando Comissão...
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
  )
}
