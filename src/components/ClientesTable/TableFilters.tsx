
import { Search, Filter, Globe, Image, Hash } from 'lucide-react'
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
  creativeFilter?: string
  setCreativeFilter?: (value: string) => void
  bmFilter?: string
  setBmFilter?: (value: string) => void
  showCreativeAndBmFilters?: boolean
  getStatusColor: (status: string) => string
}

const SITE_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status de Site' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aguardando_link', label: 'Aguardando Site' },
  { value: 'nao_precisa', label: 'Não Precisa' },
  { value: 'finalizado', label: 'Finalizado' }
]

const CREATIVE_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Criativos' },
  { value: 'falta_fazer', label: 'Falta fazer criativo' },
  { value: 'criativo_feito', label: 'Criativo feito' }
]

const BM_STATUS_OPTIONS = [
  { value: 'all', label: 'Todas as BMs' },
  { value: 'bm_configurada', label: 'BM configurada' },
  { value: 'bm_nao_configurada', label: 'BM não configurada' }
]

export function TableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  siteStatusFilter = 'all',
  setSiteStatusFilter,
  showSiteStatusFilter = false,
  creativeFilter = 'all',
  setCreativeFilter,
  bmFilter = 'all',
  setBmFilter,
  showCreativeAndBmFilters = false,
  getStatusColor
}: TableFiltersProps) {
  
  const handleSiteStatusChange = (value: string) => {
    console.log('🎯 [TableFilters] Alterando filtro de site_status para:', value)
    if (setSiteStatusFilter) {
      setSiteStatusFilter(value)
    }
  }

  const handleStatusChange = (value: string) => {
    console.log('📊 [TableFilters] Alterando filtro de status_campanha para:', value)
    setStatusFilter(value)
  }

  const handleCreativeFilterChange = (value: string) => {
    console.log('🎨 [TableFilters] Alterando filtro de criativos para:', value)
    if (setCreativeFilter) {
      setCreativeFilter(value)
    }
  }

  const handleBmFilterChange = (value: string) => {
    console.log('🧩 [TableFilters] Alterando filtro de BM para:', value)
    if (setBmFilter) {
      setBmFilter(value)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Primeira linha - Busca e Status principal */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome, email, telefone, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
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
          <Select value={siteStatusFilter} onValueChange={handleSiteStatusChange}>
            <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
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

      {/* Segunda linha - Filtros específicos Admin/Gestor */}
      {showCreativeAndBmFilters && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          {setCreativeFilter && (
            <Select value={creativeFilter} onValueChange={handleCreativeFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
                <Image className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status do criativo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CREATIVE_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {setBmFilter && (
            <Select value={bmFilter} onValueChange={handleBmFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
                <Hash className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status da BM" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {BM_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  )
}
