
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, RefreshCw, Info } from 'lucide-react'

interface GestorMetaAdsDateFilterProps {
  onDateRangeChange: (startDate: string, endDate: string, preset?: string) => void
  loading?: boolean
  lastFetchInfo?: string
}

export function GestorMetaAdsDateFilter({
  onDateRangeChange,
  loading = false,
  lastFetchInfo
}: GestorMetaAdsDateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('today')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const presetOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last_7_days', label: 'Últimos 7 dias' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'custom', label: 'Período customizado' }
  ]

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    
    if (preset !== 'custom') {
      // Para presets, usar datas vazias e deixar o hook calcular
      onDateRangeChange('', '', preset)
    }
  }

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate, 'custom')
    }
  }

  const handleQuickFetch = () => {
    if (selectedPreset === 'custom') {
      handleCustomDateSubmit()
    } else {
      onDateRangeChange('', '', selectedPreset)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Filtros de Data - Meta Ads
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
              <SelectContent className="bg-gray-800 border-gray-700">
                {presetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
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
            onClick={handleQuickFetch}
            disabled={loading || (selectedPreset === 'custom' && (!customStartDate || !customEndDate))}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Buscar Dados
              </>
            )}
          </Button>
        </div>

        {lastFetchInfo && (
          <Alert className="border-blue-800 bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              {lastFetchInfo}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
