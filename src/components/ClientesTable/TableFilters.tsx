
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA } from '@/lib/supabase'

interface TableFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  comissaoFilter: string
  setComissaoFilter: (value: string) => void
  getStatusColor: (status: string) => string
}

export function TableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  comissaoFilter,
  setComissaoFilter,
  getStatusColor
}: TableFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Pesquisar por nome, telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background border-border text-white"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-48 bg-background border-border text-white">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Status da campanha" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_CAMPANHA.map(status => (
            <SelectItem key={status} value={status}>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={comissaoFilter} onValueChange={setComissaoFilter}>
        <SelectTrigger className="w-full sm:w-48 bg-background border-border text-white">
          <SelectValue placeholder="Status comissão" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="pendentes">Pendentes</SelectItem>
          <SelectItem value="pagas">Pagas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
