import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, RefreshCw, TrendingUp } from 'lucide-react'

export interface DateRange {
  startDate: Date
  endDate: Date
  preset: string
  label: string
}

interface MetricsDateFilterProps {
  onDateRangeChange: (dateRange: DateRange) => void
  currentRange?: DateRange
}

export function MetricsDateFilter({
  onDateRangeChange,
  currentRange
}: MetricsDateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(currentRange?.preset || 'last_30_days')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const presetOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last_7_days', label: 'Últimos 7 dias' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'this_month', label: 'Este mês' },
    { value: 'custom', label: 'Período customizado' }
  ]

  const calculateDateRange = (preset: string): DateRange => {
    const hoje = new Date()
    const option = presetOptions.find(opt => opt.value === preset)
    
    switch (preset) {
      case 'today': {
        const start = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
        const end = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
        return { startDate: start, endDate: end, preset, label: option?.label || 'Hoje' }
      }
      case 'yesterday': {
        const ontem = new Date(hoje.getTime() - (24 * 60 * 60 * 1000))
        const start = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate())
        const end = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59)
        return { startDate: start, endDate: end, preset, label: option?.label || 'Ontem' }
      }
      case 'last_7_days': {
        const start = new Date(hoje.getTime() - (7 * 24 * 60 * 60 * 1000))
        return { startDate: start, endDate: hoje, preset, label: option?.label || 'Últimos 7 dias' }
      }
      case 'last_30_days': {
        const start = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
        return { startDate: start, endDate: hoje, preset, label: option?.label || 'Últimos 30 dias' }
      }
      case 'this_month': {
        const start = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        return { startDate: start, endDate: hoje, preset, label: option?.label || 'Este mês' }
      }
      default: {
        // Fallback para últimos 30 dias
        const start = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
        return { startDate: start, endDate: hoje, preset: 'last_30_days', label: 'Últimos 30 dias' }
      }
    }
  }

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset !== 'custom') {
      const dateRange = calculateDateRange(preset)
      onDateRangeChange(dateRange)
    }
  }

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate + 'T23:59:59')
      
      if (startDate <= endDate) {
        onDateRangeChange({
          startDate,
          endDate,
          preset: 'custom',
          label: `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
        })
      }
    }
  }

  const handleQuickApply = () => {
    if (selectedPreset === 'custom') {
      handleCustomDateSubmit()
    } else {
      const dateRange = calculateDateRange(selectedPreset)
      onDateRangeChange(dateRange)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Filtrar Período das Métricas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Período:</label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 z-50">
                {presetOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPreset === 'custom' && (
            <>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Data início:</label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Data fim:</label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-start">
          <Button
            onClick={handleQuickApply}
            disabled={selectedPreset === 'custom' && (!customStartDate || !customEndDate)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aplicar Filtro
          </Button>
        </div>

        {currentRange && (
          <Alert className="border-blue-800 bg-blue-900/20">
            <Calendar className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Período ativo: {currentRange.label}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}