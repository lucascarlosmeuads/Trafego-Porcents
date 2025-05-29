
import { Search, Filter, Globe } from 'lucide-react'
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
  siteStatusFilter?: string
  setSiteStatusFilter?: (value: string) => void
  showSiteStatusFilter?: boolean
  getStatusColor: (status: string) => string
}

const SITE_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status de Site' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aguardando_link', label: 'Aguardando Site' },
  { value: 'nao_precisa', label: 'Não Precisa' },
  { value: 'finalizado', label: 'Finalizado' }
]

export function TableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  siteStatusFilter = 'all',
  setSiteStatusFilter,
  showSiteStatusFilter = false,
  getStatusColor
}: TableFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Pesquisar por nome, email, telefone, vendedor..."
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
          <SelectItem value="all">Todos os Status</SelectItem>
          {STATUS_CAMPANHA.map(status => (
            <SelectItem key={status} value={status}>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showSiteStatusFilter && setSiteStatusFilter && (
        <Select value={siteStatusFilter} onValueChange={setSiteStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background border-border text-white">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status do site" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {SITE_STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
