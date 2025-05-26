
import { Calendar, Filter, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface DateFiltersProps {
  dateFilter: string
  setDateFilter: (value: string) => void
  clientsCount: number
}

export function DateFilters({ dateFilter, setDateFilter, clientsCount }: DateFiltersProps) {
  const filterOptions = [
    { value: 'all', label: 'Todos os períodos', icon: Calendar },
    { value: 'today', label: 'Hoje', icon: Clock },
    { value: 'yesterday', label: 'Ontem', icon: Calendar },
    { value: 'last7days', label: 'Últimos 7 dias', icon: Calendar },
    { value: 'thisMonth', label: 'Este mês', icon: Calendar },
    { value: 'thisYear', label: 'Este ano', icon: Calendar },
  ]

  const currentFilter = filterOptions.find(option => option.value === dateFilter)

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

      {dateFilter !== 'all' && (
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
    </div>
  )
}
