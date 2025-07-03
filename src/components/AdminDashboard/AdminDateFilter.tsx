
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface DateFilterState {
  type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom'
  startDate?: string
  endDate?: string
  label: string
}

interface AdminDateFilterProps {
  onDateFilterChange: (filter: DateFilterState) => void
  loading?: boolean
}

export function AdminDateFilter({ onDateFilterChange, loading = false }: AdminDateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<DateFilterState>({
    type: 'today',
    label: 'Hoje'
  })
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const presetButtons = [
    {
      type: 'today' as const,
      label: 'Hoje',
      onClick: () => {
        const filter = { type: 'today' as const, label: 'Hoje' }
        setActiveFilter(filter)
        onDateFilterChange(filter)
      }
    },
    {
      type: 'yesterday' as const,
      label: 'Ontem',
      onClick: () => {
        const filter = { type: 'yesterday' as const, label: 'Ontem' }
        setActiveFilter(filter)
        onDateFilterChange(filter)
      }
    },
    {
      type: 'last7days' as const,
      label: 'Últimos 7 dias',
      onClick: () => {
        const filter = { type: 'last7days' as const, label: 'Últimos 7 dias' }
        setActiveFilter(filter)
        onDateFilterChange(filter)
      }
    },
    {
      type: 'last30days' as const,
      label: 'Últimos 30 dias',
      onClick: () => {
        const filter = { type: 'last30days' as const, label: 'Últimos 30 dias' }
        setActiveFilter(filter)
        onDateFilterChange(filter)
      }
    }
  ]

  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      const filter: DateFilterState = {
        type: 'custom',
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${customStartDate} até ${customEndDate}`
      }
      setActiveFilter(filter)
      onDateFilterChange(filter)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-contrast">
          <Calendar className="w-5 h-5" />
          Filtro de Período
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de período pré-definido */}
        <div className="flex flex-wrap gap-2">
          {presetButtons.map((button) => (
            <Button
              key={button.type}
              variant={activeFilter.type === button.type ? "default" : "outline"}
              size="sm"
              onClick={button.onClick}
              disabled={loading}
              className="text-sm"
            >
              {loading && activeFilter.type === button.type && (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              )}
              {button.label}
            </Button>
          ))}
        </div>

        {/* Período personalizado */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2 text-contrast">Período Personalizado:</div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Data Início</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Data Fim</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleCustomDateFilter}
              disabled={!customStartDate || !customEndDate || loading}
              size="sm"
            >
              Aplicar
            </Button>
          </div>
        </div>

        {/* Status do filtro atual */}
        <div className="text-xs text-muted-foreground">
          Período ativo: <span className="font-medium text-contrast">{activeFilter.label}</span>
        </div>
      </CardContent>
    </Card>
  )
}
