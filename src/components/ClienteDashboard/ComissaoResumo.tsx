
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  CheckCircle,
  Percent,
  Calculator,
  TrendingUp,
  Edit3,
  X,
  Check,
  Loader2
} from 'lucide-react'

interface ComissaoResumoProps {
  porcentagemAtual: number
  totalVendas: number
  comissaoDevida: number
  onComissaoAtualizada?: () => void
}

export function ComissaoResumo({ porcentagemAtual, totalVendas, comissaoDevida, onComissaoAtualizada }: ComissaoResumoProps) {
  const { user } = useAuth()
  const { refreshData } = useClienteData(user?.email || '')
  const { toast } = useToast()
  const [editando, setEditando] = useState(false)
  const [novoValor, setNovoValor] = useState(porcentagemAtual.toString())
  const [salvando, setSalvando] = useState(false)

  const handleIniciarEdicao = () => {
    setNovoValor(porcentagemAtual.toString())
    setEditando(true)
  }

  const handleCancelar = () => {
    setNovoValor(porcentagemAtual.toString())
    setEditando(false)
  }

  const handleSalvar = async () => {
    const valor = parseFloat(novoValor)
    
    if (isNaN(valor) || valor <= 0 || valor > 100) {
      toast({
        title: "Valor inválido",
        description: "Digite uma porcentagem válida entre 1% e 100%",
        variant: "destructive"
      })
      return
    }

    setSalvando(true)
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ valor_comissao: valor })
        .eq('email_cliente', user?.email)

      if (error) throw error

      toast({
        title: "✅ Comissão atualizada",
        description: `Nova porcentagem: ${valor}%`
      })

      setEditando(false)
      await refreshData()
      onComissaoAtualizada?.()

    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao atualizar comissão",
        variant: "destructive"
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSalvar()
    } else if (e.key === 'Escape') {
      handleCancelar()
    }
  }

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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-600" />
                {editando ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-800">Porcentagem:</span>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="100"
                      value={novoValor}
                      onChange={(e) => setNovoValor(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-20 h-8 text-sm"
                      autoFocus
                      disabled={salvando}
                    />
                    <span className="text-green-800">%</span>
                  </div>
                ) : (
                  <span className="font-medium text-green-800">
                    Porcentagem Confirmada: {porcentagemAtual}%
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {editando ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSalvar}
                      disabled={salvando}
                      className="h-8 w-8 p-0"
                    >
                      {salvando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelar}
                      disabled={salvando}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleIniciarEdicao}
                    className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                  >
                    <Edit3 className="h-4 w-4 text-green-600" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-green-700">
              ✅ Você confirmou {porcentagemAtual}% de comissão sobre cada venda.
              {!editando && (
                <span className="text-xs text-green-600 block mt-1">
                  Clique no ícone de edição para alterar a porcentagem
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
