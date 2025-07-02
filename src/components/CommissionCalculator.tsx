
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, DollarSign, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateCommission, isValidSaleValue, getCommissionRuleDescription, getCommissionRules } from '@/utils/commissionCalculator'

interface CommissionCalculatorProps {
  saleValue: number | null
  commissionValue: number | null
  onSaleValueChange: (value: number | null) => void
  onCommissionChange: (value: number | null) => void
  disabled?: boolean
  showRules?: boolean
}

export function CommissionCalculator({
  saleValue,
  commissionValue,
  onSaleValueChange,
  onCommissionChange,
  disabled = false,
  showRules = true
}: CommissionCalculatorProps) {
  const [calculatedCommission, setCalculatedCommission] = useState<number | null>(null)
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)

  // Recalcular comissão quando valor da venda muda
  useEffect(() => {
    if (isValidSaleValue(saleValue)) {
      const calculated = calculateCommission(saleValue!)
      setCalculatedCommission(calculated)
      
      // Se comissão não foi editada manualmente, usar a calculada
      if (!isManuallyEdited) {
        onCommissionChange(calculated)
      }
    } else {
      setCalculatedCommission(null)
      if (!isManuallyEdited) {
        onCommissionChange(60) // Valor padrão
      }
    }
  }, [saleValue, isManuallyEdited, onCommissionChange])

  const handleSaleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      onSaleValueChange(null)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        onSaleValueChange(numValue)
      }
    }
  }

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIsManuallyEdited(true)
    
    if (value === '') {
      onCommissionChange(null)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        onCommissionChange(numValue)
      }
    }
  }

  const resetToCalculated = () => {
    if (calculatedCommission !== null) {
      onCommissionChange(calculatedCommission)
      setIsManuallyEdited(false)
    }
  }

  const rules = getCommissionRules()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-4 h-4" />
          Cálculo de Comissão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valor da Venda */}
        <div className="space-y-2">
          <Label htmlFor="saleValue" className="flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            Valor da Venda (R$)
          </Label>
          <Input
            id="saleValue"
            type="number"
            step="0.01"
            min="0"
            value={saleValue || ''}
            onChange={handleSaleValueChange}
            placeholder="Ex: 500.00"
            disabled={disabled}
          />
        </div>

        {/* Comissão Calculada */}
        {calculatedCommission !== null && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Comissão Calculada:
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                R$ {calculatedCommission.toFixed(2)}
              </Badge>
            </div>
            {saleValue && (
              <p className="text-xs text-blue-700 mt-1">
                {getCommissionRuleDescription(saleValue)}
              </p>
            )}
          </div>
        )}

        {/* Valor da Comissão */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="commissionValue" className="flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Comissão Final (R$)
            </Label>
            {isManuallyEdited && calculatedCommission !== null && (
              <button
                type="button"
                onClick={resetToCalculated}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={disabled}
              >
                Usar calculada
              </button>
            )}
          </div>
          <Input
            id="commissionValue"
            type="number"
            step="0.01"
            min="0"
            value={commissionValue || ''}
            onChange={handleCommissionChange}
            placeholder="Ex: 100.00"
            disabled={disabled}
          />
          {isManuallyEdited && (
            <p className="text-xs text-amber-600">
              ⚠️ Valor editado manualmente
            </p>
          )}
        </div>

        {/* Regras de Comissão */}
        {showRules && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Regras de Comissão
              </span>
            </div>
            <div className="grid gap-1">
              {rules.map((rule, index) => (
                <div key={index} className="flex justify-between text-xs text-gray-600">
                  <span>R$ {rule.saleValue}</span>
                  <span>→ R$ {rule.commission}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Valores intermediários são calculados por interpolação linear
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
