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
import { 
  calculateDualCommission,
  type CommissionType
} from '@/utils/dualCommissionCalculator'

interface ClienteNovoCommissionCalculatorProps {
  saleValue: number | null
  commissionValue: number | null
  onSaleValueChange: (value: number | null) => void
  onCommissionChange: (value: number | null) => void
  disabled?: boolean
  userType?: 'gestor' | 'vendedor' | 'admin' | 'other'
}

export function ClienteNovoCommissionCalculator({
  saleValue,
  commissionValue,
  onSaleValueChange,
  onCommissionChange,
  disabled = false,
  userType = 'other'
}: ClienteNovoCommissionCalculatorProps) {
  const [calculatedCommission, setCalculatedCommission] = useState<number>(0)
  
  const validSaleValues = getValidSaleValues()
  
  useEffect(() => {
    if (saleValue && isValidClienteNovoSaleValue(saleValue)) {
      let calculated = 0
      
      // Calcular comissão baseada no tipo de usuário
      if (userType === 'gestor' || userType === 'admin') {
        calculated = calculateDualCommission(saleValue, 'manager')
      } else if (userType === 'vendedor') {
        calculated = calculateDualCommission(saleValue, 'seller')
      } else {
        // Para outros usuários, mostrar comissão do vendedor por padrão
        calculated = calculateDualCommission(saleValue, 'seller')
      }
      
      setCalculatedCommission(calculated)
      onCommissionChange(calculated)
    } else {
      setCalculatedCommission(0)
      onCommissionChange(null)
    }
  }, [saleValue, onCommissionChange, userType])

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
                {userType === 'gestor' || userType === 'admin' ? 
                  `Comissão do Gestor: R$ ${calculatedCommission}` :
                  userType === 'vendedor' ?
                  `Comissão do Vendedor: R$ ${calculatedCommission}` :
                  getClienteNovoCommissionDescription(saleValue)
                }
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
              {userType === 'gestor' || userType === 'admin' ? (
                <>
                  <li>• Venda de R$ 500 → Comissão Gestor: R$ 100</li>
                  <li>• Venda de R$ 350 → Comissão Gestor: R$ 80</li>
                </>
              ) : userType === 'vendedor' ? (
                <>
                  <li>• Venda de R$ 500 → Comissão Vendedor: R$ 40</li>
                  <li>• Venda de R$ 350 → Comissão Vendedor: R$ 30</li>
                </>
              ) : (
                <>
                  <li>• Venda de R$ 500 → Vendedor: R$ 40 | Gestor: R$ 100</li>
                  <li>• Venda de R$ 350 → Vendedor: R$ 30 | Gestor: R$ 80</li>
                </>
              )}
            </ul>
            Os valores são fixos e não podem ser alterados.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}