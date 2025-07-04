
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  CheckCircle, 
  Info, 
  AlertCircle 
} from 'lucide-react'

export function ComissaoInputManual() {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')
  const [valorComissao, setValorComissao] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const comissaoConfirmada = cliente?.comissao_confirmada || false

  useEffect(() => {
    if (cliente?.valor_comissao && !comissaoConfirmada) {
      setValorComissao(cliente.valor_comissao.toString())
    }
  }, [cliente, comissaoConfirmada])

  const handleConfirmarComissao = async () => {
    if (!user?.email) return
    
    const valor = parseFloat(valorComissao)
    if (!valor || valor <= 0) {
      setErro('Por favor, insira um valor válido para a comissão')
      return
    }
    
    setConfirmando(true)
    setErro('')
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: valor
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

  if (comissaoConfirmada) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Comissão Confirmada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Valor Confirmado: {formatCurrency(cliente?.valor_comissao || 0)}
                </span>
              </div>
              <p className="text-sm text-green-700">
                ✅ Você confirmou o valor da sua comissão mensal. Este valor será cobrado mensalmente enquanto sua campanha estiver ativa.
              </p>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Como funciona:</strong> A comissão é cobrada mensalmente e cobre toda a gestão da sua campanha, otimizações, relatórios e suporte técnico especializado.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Quanto Você Está Disposto a Pagar de Comissão?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explicação */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">O que está incluído na comissão mensal:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Gestão e otimização das campanhas no Meta Ads</li>
                <li>• Criação e testes de novos criativos</li>
                <li>• Relatórios detalhados de performance</li>
                <li>• Suporte técnico via WhatsApp</li>
                <li>• Ajustes estratégicos baseados em resultados</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Input de Valor */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Valor da Comissão Mensal (R$):
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={valorComissao}
            onChange={(e) => setValorComissao(e.target.value)}
            placeholder="Ex: 150.00"
            className="text-lg font-medium"
          />
          <p className="text-xs text-gray-500">
            Insira o valor que você está disposto a pagar mensalmente pela gestão da sua campanha.
          </p>
        </div>

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
          disabled={confirmando || !valorComissao || parseFloat(valorComissao) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          size="lg"
        >
          {confirmando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 w-4 mr-2" />
              Confirmar Comissão de {valorComissao ? formatCurrency(parseFloat(valorComissao)) : 'R$ 0,00'}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Ao confirmar, você aceita pagar {valorComissao ? formatCurrency(parseFloat(valorComissao)) : 'o valor informado'} mensalmente pela gestão completa da sua campanha.
        </p>
      </CardContent>
    </Card>
  )
}
