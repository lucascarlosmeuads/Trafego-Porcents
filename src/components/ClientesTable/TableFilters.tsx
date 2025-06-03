
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
  comissaoFilter?: string
  setComissaoFilter?: (value: string) => void
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
  comissaoFilter = 'all',
  setComissaoFilter,
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

  const handleComissaoChange = (value: string) => {
    console.log('💰 [TableFilters] Alterando filtro de comissão para:', value)
    if (setComissaoFilter) {
      setComissaoFilter(value)
    }
  }

  return (
    <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-6">
      {/* Campo de Busca com gradiente azul vibrante */}
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-xl border border-blue-400/30 shadow-xl shadow-blue-500/15 backdrop-blur-sm"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 drop-shadow-lg" />
          <Input
            placeholder="Pesquisar por nome, email, telefone, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-background/90 backdrop-blur-sm border-blue-400/40 text-white placeholder:text-blue-200/70 hover:border-blue-300/60 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-sm font-medium rounded-xl"
          />
        </div>
      </div>
      
      {/* Status da Campanha com gradiente verde vibrante */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-xl border border-green-400/30 shadow-xl shadow-green-500/15 backdrop-blur-sm"></div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-green-400/40 text-white hover:border-green-300/60 focus:border-green-300 focus:ring-2 focus:ring-green-400/30 transition-all duration-300 rounded-xl">
            <SelectValue placeholder="Status da campanha" className="font-medium" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
            <SelectItem value="all" className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
              <span className="font-medium">Status Cliente</span>
            </SelectItem>
            {STATUS_CAMPANHA.map(status => (
              <SelectItem key={status} value={status} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Comissão */}
      {setComissaoFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-xl border border-emerald-400/30 shadow-xl shadow-emerald-500/15 backdrop-blur-sm"></div>
          <Select value={comissaoFilter} onValueChange={handleComissaoChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-emerald-400/40 text-white hover:border-emerald-300/60 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30 transition-all duration-300 rounded-xl">
              <SelectValue placeholder="Status da comissão" className="font-medium" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              <SelectItem value="all" className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                <span className="font-medium">Todas as Comissões</span>
              </SelectItem>
              <SelectItem value="pago" className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                <span className="font-medium">Comissão Paga</span>
              </SelectItem>
              <SelectItem value="pendente" className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                <span className="font-medium">Comissão Pendente</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status do Site com gradiente laranja vibrante */}
      {showSiteStatusFilter && setSiteStatusFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-amber-500/15 rounded-xl border border-orange-400/30 shadow-xl shadow-orange-500/15 backdrop-blur-sm"></div>
          <Select value={siteStatusFilter} onValueChange={handleSiteStatusChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-orange-400/40 text-white hover:border-orange-300/60 focus:border-orange-300 focus:ring-2 focus:ring-orange-400/30 transition-all duration-300 rounded-xl">
              <SelectValue placeholder="Status do site" className="font-medium" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              {SITE_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Criativo com gradiente roxo vibrante */}
      {setCreativoFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-xl border border-purple-400/30 shadow-xl shadow-purple-500/15 backdrop-blur-sm"></div>
          <Select value={creativoFilter} onValueChange={handleCreativoChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-purple-400/40 text-white hover:border-purple-300/60 focus:border-purple-300 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 rounded-xl">
              <SelectValue placeholder="Status criativo" className="font-medium" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              {CRIATIVO_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status BM com gradiente ciano vibrante */}
      {setBmFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 rounded-xl border border-cyan-400/30 shadow-xl shadow-cyan-500/15 backdrop-blur-sm"></div>
          <Select value={bmFilter} onValueChange={handleBmChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-cyan-400/40 text-white hover:border-cyan-300/60 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 rounded-xl">
              <SelectValue placeholder="Status BM" className="font-medium" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              {BM_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
