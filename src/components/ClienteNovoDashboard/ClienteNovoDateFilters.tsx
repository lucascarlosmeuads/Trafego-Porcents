import { Calendar, Filter, Clock, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface ClienteNovoDateFiltersProps {
  dateFilter: string
  setDateFilter: (value: string) => void
  customStartDate: string
  setCustomStartDate: (value: string) => void
  customEndDate: string
  setCustomEndDate: (value: string) => void
  clientsCount: number
  onApplyCustomRange?: () => void
}

export function ClienteNovoDateFilters({
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  clientsCount,
  onApplyCustomRange
}: ClienteNovoDateFiltersProps) {
  const filterOptions = [
    { value: 'all', label: 'Todos os períodos', icon: Calendar },
    { value: 'today', label: 'Hoje', icon: Clock },
    { value: 'yesterday', label: 'Ontem', icon: Calendar },
    { value: 'last7days', label: 'Últimos 7 dias', icon: CalendarDays },
    { value: 'thisMonth', label: 'Este mês', icon: Calendar },
    { value: 'thisYear', label: 'Este ano', icon: Calendar },
    { value: 'custom', label: 'Período personalizado', icon: Filter },
  ]

  const currentFilter = filterOptions.find(option => option.value === dateFilter)

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate && customStartDate <= customEndDate) {
      setDateFilter('custom')
      onApplyCustomRange?.()
    }
  }

  const clearCustomDates = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setDateFilter('all')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filtrar por Data de Cadastro</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {clientsCount} cliente{clientsCount !== 1 ? 's' : ''} encontrado{clientsCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <div className="flex items-center gap-2">
              {currentFilter && <currentFilter.icon className="h-4 w-4" />}
              <SelectValue placeholder="Selecione o período" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      {dateFilter === 'custom' && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data de início</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data de fim</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate || undefined}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomDateSubmit}
                  disabled={!customStartDate || !customEndDate || customStartDate > customEndDate}
                  size="sm"
                >
                  Aplicar Filtro
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCustomDates}
                  size="sm"
                >
                  Limpar
                </Button>
              </div>

              {customStartDate && customEndDate && customStartDate > customEndDate && (
                <p className="text-sm text-red-600">
                  A data de início deve ser anterior à data de fim.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Filter Button */}
      {dateFilter !== 'all' && dateFilter !== 'custom' && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateFilter('all')}
            className="h-8"
          >
            Limpar filtro
          </Button>
          <span className="text-sm text-muted-foreground">
            Mostrando: <strong>{currentFilter?.label}</strong>
          </span>
        </div>
      )}

      {dateFilter === 'custom' && customStartDate && customEndDate && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCustomDates}
            className="h-8"
          >
            Limpar filtro personalizado
          </Button>
          <span className="text-sm text-muted-foreground">
            Período: <strong>{customStartDate}</strong> até <strong>{customEndDate}</strong>
          </span>
        </div>
      )}
    </div>
  )
}