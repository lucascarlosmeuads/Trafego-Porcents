
import { Search, Filter, Globe, Image, Settings, Users, UserCheck, UserX } from 'lucide-react'
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
  creativoFilter?: string
  setCreativoFilter?: (value: string) => void
  bmFilter?: string
  setBmFilter?: (value: string) => void
  getStatusColor: (status: string) => string
}

const SITE_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status de Site' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aguardando_link', label: 'Aguardando Site' },
  { value: 'nao_precisa', label: 'Não Precisa' },
  { value: 'finalizado', label: 'Finalizado' }
]

const CRIATIVO_STATUS_OPTIONS = [
  { value: 'all', label: 'Status Criativo' },
  { value: 'pendente', label: 'Pendente Criativo' },
  { value: 'feito', label: 'Criativo Feito' }
]

const BM_STATUS_OPTIONS = [
  { value: 'all', label: 'Status das BMs' },
  { value: 'com_bm', label: 'Com BM' },
  { value: 'sem_bm', label: 'Sem BM' }
]

export function TableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  siteStatusFilter = 'all',
  setSiteStatusFilter,
  showSiteStatusFilter = false,
  creativoFilter = 'all',
  setCreativoFilter,
  bmFilter = 'all',
  setBmFilter,
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

  const handleCreativoChange = (value: string) => {
    console.log('🎨 [TableFilters] Alterando filtro de criativo para:', value)
    if (setCreativoFilter) {
      setCreativoFilter(value)
    }
  }

  const handleBmChange = (value: string) => {
    console.log('⚙️ [TableFilters] Alterando filtro de BM para:', value)
    if (setBmFilter) {
      setBmFilter(value)
    }
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      {/* Campo de Busca com gradiente azul */}
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-500/10"></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4 drop-shadow-sm" />
          <Input
            placeholder="Pesquisar por nome, email, telefone, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/80 backdrop-blur-sm border-blue-500/30 text-white hover:border-blue-400/50 focus:border-blue-400 transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Status da Campanha com gradiente verde */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20 shadow-lg shadow-green-500/10"></div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="relative w-full sm:w-48 bg-background/80 backdrop-blur-sm border-green-500/30 text-white hover:border-green-400/50 focus:border-green-400 transition-all duration-200">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-400 drop-shadow-sm" />
              <SelectValue placeholder="Status da campanha" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
            <SelectItem value="all" className="text-card-foreground hover:bg-muted/50">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-400" />
                Status Cliente
              </div>
            </SelectItem>
            {STATUS_CAMPANHA.map(status => (
              <SelectItem key={status} value={status} className="text-card-foreground hover:bg-muted/50">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status do Site com gradiente laranja */}
      {showSiteStatusFilter && setSiteStatusFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20 shadow-lg shadow-orange-500/10"></div>
          <Select value={siteStatusFilter} onValueChange={handleSiteStatusChange}>
            <SelectTrigger className="relative w-full sm:w-48 bg-background/80 backdrop-blur-sm border-orange-500/30 text-white hover:border-orange-400/50 focus:border-orange-400 transition-all duration-200">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-orange-400 drop-shadow-sm" />
                <SelectValue placeholder="Status do site" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
              {SITE_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-orange-400" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Criativo com gradiente roxo */}
      {setCreativoFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20 shadow-lg shadow-purple-500/10"></div>
          <Select value={creativoFilter} onValueChange={handleCreativoChange}>
            <SelectTrigger className="relative w-full sm:w-48 bg-background/80 backdrop-blur-sm border-purple-500/30 text-white hover:border-purple-400/50 focus:border-purple-400 transition-all duration-200">
              <div className="flex items-center">
                <Image className="w-4 h-4 mr-2 text-purple-400 drop-shadow-sm" />
                <SelectValue placeholder="Status criativo" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
              {CRIATIVO_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50">
                  <div className="flex items-center">
                    <Image className="w-4 h-4 mr-2 text-purple-400" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status BM com gradiente ciano */}
      {setBmFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 rounded-lg border border-cyan-500/20 shadow-lg shadow-cyan-500/10"></div>
          <Select value={bmFilter} onValueChange={handleBmChange}>
            <SelectTrigger className="relative w-full sm:w-48 bg-background/80 backdrop-blur-sm border-cyan-500/30 text-white hover:border-cyan-400/50 focus:border-cyan-400 transition-all duration-200">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2 text-cyan-400 drop-shadow-sm" />
                <SelectValue placeholder="Status BM" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
              {BM_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-cyan-400" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
