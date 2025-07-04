
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  CheckCircle, 
  Info, 
  Calculator,
  AlertCircle 
} from 'lucide-react'

export function ClienteComissaoConfirmacao() {
  const { user } = useAuth()
  const { cliente, briefing } = useClienteData(user?.email || '')
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const valorComissao = cliente?.valor_comissao || 60.00
  const comissaoConfirmada = cliente?.comissao_confirmada || false

  // Calcular valor sugerido baseado no briefing
  const calcularComissaoSugerida = () => {
    if (!briefing?.investimento_diario) return 60.00
    
    const investimentoDiario = Number(briefing.investimento_diario)
    if (investimentoDiario <= 50) return 50.00
    if (investimentoDiario <= 100) return 80.00
    if (investimentoDiario <= 200) return 120.00
    if (investimentoDiario <= 500) return 200.00
    return 300.00
  }

  const valorSugerido = calcularComissaoSugerida()

  const handleConfirmarComissao = async () => {
    if (!user?.email) return
    
    setConfirmando(true)
    setErro('')
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: valorSugerido
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
                  Valor Confirmado: {formatCurrency(valorComissao)}
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
          <Calculator className="w-5 h-5 text-blue-600" />
          Confirme o Valor da Comissão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valor Calculado */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800">
              Valor Calculado Para Seu Negócio:
            </span>
            <span className="text-2xl font-bold text-blue-900">
              {formatCurrency(valorSugerido)}
            </span>
          </div>
          
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Baseado no seu investimento diário: {formatCurrency(briefing?.investimento_diario || 0)}</p>
            <p>• Inclui gestão completa da campanha</p>
            <p>• Relatórios detalhados mensais</p>
            <p>• Suporte técnico especializado</p>
          </div>
        </div>

        {/* Explicação da Comissão */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">O que está incluído na comissão:</p>
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

        {/* Comparação de Valor */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Por que este valor?</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📊 <strong>Gestão profissional:</strong> Economia de 20-30h/mês do seu tempo</p>
            <p>🎯 <strong>Otimização contínua:</strong> Melhores resultados com menor custo</p>
            <p>📈 <strong>Expertise especializada:</strong> Anos de experiência em tráfego pago</p>
            <p>🚀 <strong>Resultados comprovados:</strong> Clientes com ROI de 3x a 10x</p>
          </div>
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
          disabled={confirmando}
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
              Confirmar Comissão de {formatCurrency(valorSugerido)}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Ao confirmar, você aceita pagar {formatCurrency(valorSugerido)} mensalmente pela gestão completa da sua campanha.
        </p>
      </CardContent>
    </Card>
  )
}
