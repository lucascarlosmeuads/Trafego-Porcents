
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { 
  CheckCircle,
  Percent,
  Calculator,
  TrendingUp
} from 'lucide-react'

interface ComissaoResumoProps {
  porcentagemAtual: number
  totalVendas: number
  comissaoDevida: number
}

export function ComissaoResumo({ porcentagemAtual, totalVendas, comissaoDevida }: ComissaoResumoProps) {
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
