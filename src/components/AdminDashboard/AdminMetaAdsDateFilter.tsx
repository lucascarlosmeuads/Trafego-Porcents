
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, RefreshCw } from 'lucide-react'

interface DateFilterProps {
  onDateRangeChange: (startDate: string, endDate: string, preset?: string) => void
  loading?: boolean
  lastFetchInfo?: string
}

export function AdminMetaAdsDateFilter({ onDateRangeChange, loading, lastFetchInfo }: DateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('today')
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const presetLabels = {
    today: 'Hoje (automático)',
    yesterday: 'Ontem',
    last_7_days: 'Últimos 7 dias',
    last_30_days: 'Últimos 30 dias',
    custom: 'Período personalizado'
  }

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset === 'custom') {
      // Não fazer nada, aguardar o usuário configurar as datas
      return
    }
    
    // Para outros presets, buscar dados automaticamente
    onDateRangeChange('', '', preset)
  }

  const handleCustomRange = () => {
    if (selectedPreset === 'custom') {
      onDateRangeChange(customStartDate, customEndDate, 'custom')
    }
  }

  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    setCustomStartDate(startStr)
    setCustomEndDate(endStr)
    setSelectedPreset('custom')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Período dos Dados
        </CardTitle>
        {lastFetchInfo && (
          <p className="text-sm text-blue-600 flex items-center gap-1">
            📊 {lastFetchInfo}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de Preset */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(presetLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Datas personalizadas */}
        {selectedPreset === 'custom' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Botões de seleção rápida */}
            <div className="space-y-2">
              <Label>Seleção Rápida</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(1)}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(7)}
                >
                  7 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(30)}
                >
                  30 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(90)}
                >
                  90 dias
                </Button>
              </div>
            </div>

            {/* Botão para aplicar período personalizado */}
            <Button
              onClick={handleCustomRange}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Buscar Dados do Período
            </Button>
          </>
        )}

        {/* Info sobre período automático */}
        {selectedPreset === 'today' && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <strong>Modo Automático:</strong> Se não houver dados para hoje, 
            o sistema buscará automaticamente dados de ontem ou dos últimos 7 dias.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
