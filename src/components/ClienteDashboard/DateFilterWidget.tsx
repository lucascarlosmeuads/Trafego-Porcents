
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Filter, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DateFilterWidgetProps {
  currentPeriod: string
  onPeriodChange: (period: string, startDate?: string, endDate?: string) => void
  loading?: boolean
}

export function DateFilterWidget({ currentPeriod, onPeriodChange, loading }: DateFilterWidgetProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const periodOptions = [
    { value: 'today', label: 'Hoje', icon: '📅' },
    { value: 'yesterday', label: 'Ontem', icon: '📆' },
    { value: 'day_before_yesterday', label: 'Anteontem', icon: '📋' },
    { value: 'last_7_days', label: 'Últimos 7 dias', icon: '📊' },
    { value: 'last_15_days', label: 'Últimos 15 dias', icon: '📈' },
    { value: 'last_30_days', label: 'Últimos 30 dias', icon: '📉' },
    { value: 'custom', label: 'Personalizado', icon: '🎯' }
  ]

  const handlePeriodSelect = (period: string) => {
    if (period === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      onPeriodChange(period)
    }
  }

  const handleCustomSubmit = () => {
    if (customStartDate && customEndDate) {
      onPeriodChange('custom', customStartDate, customEndDate)
      setShowCustom(false)
    }
  }

  const getCurrentPeriodLabel = () => {
    const option = periodOptions.find(opt => opt.value === currentPeriod)
    return option ? `${option.icon} ${option.label}` : '📅 Período selecionado'
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Header com status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Período dos Dados</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Monitorado 24/7
              </Badge>
            </div>
            <div className="text-sm text-blue-700 font-medium">
              {getCurrentPeriodLabel()}
            </div>
          </div>

          {/* Botões de período */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={currentPeriod === option.value ? 'default' : 'outline'}
                onClick={() => handlePeriodSelect(option.value)}
                disabled={loading}
                className={`text-xs font-medium transition-all ${
                  currentPeriod === option.value 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>

          {/* Filtro personalizado */}
          {showCustom && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Selecionar Período Personalizado</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-blue-700 font-medium mb-1 block">Data início:</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium mb-1 block">Data fim:</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={!customStartDate || !customEndDate || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem tranquilizadora */}
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-lg">🛡️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Estamos cuidando de tudo para você!</p>
                <p>Nossa equipe monitora estes dados diariamente e faz ajustes constantes para otimizar seus resultados. Estes números são para você acompanhar nosso trabalho em tempo real.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
