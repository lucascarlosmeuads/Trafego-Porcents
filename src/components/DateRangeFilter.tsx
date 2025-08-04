import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalDateFilter, type DateFilterOption } from '@/hooks/useGlobalDateFilter'

interface DateRangeFilterProps {
  onFilterChange?: (startDate?: string, endDate?: string, option?: DateFilterOption) => void
  className?: string
}

export function DateRangeFilter({ onFilterChange, className }: DateRangeFilterProps) {
  const { currentFilter, applyFilter, isFilterActive } = useGlobalDateFilter()
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomInputs, setShowCustomInputs] = useState(false)

  const handleQuickFilter = (option: DateFilterOption) => {
    const filter = applyFilter(option)
    onFilterChange?.(filter.startDate, filter.endDate, option)
    
    if (option !== 'personalizado') {
      setShowCustomInputs(false)
    } else {
      setShowCustomInputs(true)
    }
  }

  const handleCustomFilter = () => {
    if (customStartDate && customEndDate) {
      const filter = applyFilter('personalizado', customStartDate, customEndDate)
      onFilterChange?.(filter.startDate, filter.endDate, 'personalizado')
    }
  }

  const clearCustomFilter = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setShowCustomInputs(false)
    handleQuickFilter('hoje')
  }

  return (
    <Card className={cn("bg-background border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros de Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de filtro rápido */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={isFilterActive('hoje') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('hoje')}
          >
            Hoje
          </Button>
          <Button
            variant={isFilterActive('ontem') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('ontem')}
          >
            Ontem
          </Button>
          <Button
            variant={isFilterActive('anteontem') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('anteontem')}
          >
            Anteontem
          </Button>
          <Button
            variant={isFilterActive('personalizado') ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('personalizado')}
          >
            Personalizado
          </Button>
        </div>
        
        {/* Inputs de data personalizada */}
        {showCustomInputs && (
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
            
            <div className="flex gap-2">
              <Button
                onClick={handleCustomFilter}
                className="flex-1"
                disabled={!customStartDate || !customEndDate}
              >
                Aplicar Período
              </Button>
              <Button
                onClick={clearCustomFilter}
                variant="outline"
              >
                Limpar
              </Button>
            </div>
          </>
        )}
        
        {/* Mostrar filtro ativo */}
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Filtro ativo: </span>
            {currentFilter.label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}