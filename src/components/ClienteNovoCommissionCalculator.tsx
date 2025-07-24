import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator, Info } from 'lucide-react'
import { 
  calculateClienteNovoCommission, 
  isValidClienteNovoSaleValue,
  getClienteNovoCommissionDescription,
  getValidSaleValues
} from '@/utils/clienteNovoCommissionCalculator'

interface ClienteNovoCommissionCalculatorProps {
  saleValue: number | null
  commissionValue: number | null
  onSaleValueChange: (value: number | null) => void
  onCommissionChange: (value: number | null) => void
  disabled?: boolean
}

export function ClienteNovoCommissionCalculator({
  saleValue,
  commissionValue,
  onSaleValueChange,
  onCommissionChange,
  disabled = false
}: ClienteNovoCommissionCalculatorProps) {
  const [calculatedCommission, setCalculatedCommission] = useState<number>(0)
  
  const validSaleValues = getValidSaleValues()
  
  useEffect(() => {
    if (saleValue && isValidClienteNovoSaleValue(saleValue)) {
      const calculated = calculateClienteNovoCommission(saleValue)
      setCalculatedCommission(calculated)
      onCommissionChange(calculated)
    } else {
      setCalculatedCommission(0)
      onCommissionChange(null)
    }
  }, [saleValue, onCommissionChange])

  const handleSaleValueChange = (value: string) => {
    const numValue = value ? parseInt(value) : null
    onSaleValueChange(numValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-4 h-4" />
          Valor da Venda e Comissão (Valores Fixos)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="sale-value-select">Valor da Venda</Label>
          <Select 
            value={saleValue?.toString() || ''} 
            onValueChange={handleSaleValueChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o valor da venda" />
            </SelectTrigger>
            <SelectContent>
              {validSaleValues.map(value => (
                <SelectItem key={value} value={value.toString()}>
                  R$ {value},00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {saleValue && isValidClienteNovoSaleValue(saleValue) && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Calculator className="w-4 h-4" />
                Comissão Calculada
              </div>
              <div className="mt-1 text-lg font-bold text-green-800">
                R$ {calculatedCommission},00
              </div>
              <div className="mt-1 text-sm text-green-600">
                {getClienteNovoCommissionDescription(saleValue)}
              </div>
            </div>
          </div>
        )}

        {saleValue && !isValidClienteNovoSaleValue(saleValue) && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Valor de venda não possui comissão definida. Selecione R$ 350 ou R$ 500.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Comissões Fixas Cliente Novo:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Venda de R$ 500 → Comissão de R$ 40</li>
              <li>• Venda de R$ 350 → Comissão de R$ 30</li>
            </ul>
            Os valores são fixos e não podem ser alterados.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}