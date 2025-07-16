import { Search, Filter, Globe, Image, Settings, Users, UserCheck, UserX, Palette } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import type { ColorMarcacao } from './ColorSelect'

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
  colorFilter?: string
  setColorFilter?: (value: string) => void
  getStatusColor: (status: string) => string
  isSearching?: boolean // ETAPA 3: Indicador de busca ativa
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

const ORIGEM_OPTIONS = [
  { value: 'all', label: 'Todas as Origens' },
  { value: 'appmax', label: '🤖 AppMax (Automático)' },
  { value: 'manual', label: '👤 Manual' }
]

const COLOR_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as Cores', color: null },
  { value: 'laranja', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'azul', label: 'Azul', color: 'bg-blue-500' },
  { value: 'roxo', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'verde', label: 'Verde', color: 'bg-green-500' },
  { value: 'rosa', label: 'Rosa', color: 'bg-pink-500' },
  { value: 'sem-cor', label: 'Sem Cor', color: null }
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
  colorFilter = 'all',
  setColorFilter,
  origemFilter = 'all',
  setOrigemFilter,
  getStatusColor,
  isSearching = false
}: TableFiltersProps & {
  colorFilter?: string
  setColorFilter?: (value: string) => void
  origemFilter?: string
  setOrigemFilter?: (value: string) => void
}) {
  
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

  const handleOrigemChange = (value: string) => {
    console.log('🤖 [TableFilters] Alterando filtro de origem para:', value)
    if (setOrigemFilter) {
      setOrigemFilter(value)
    }
  }

  const handleColorChange = (value: string) => {
    console.log('🎨 [TableFilters] Alterando filtro de cor para:', value)
    if (setColorFilter) {
      setColorFilter(value)
    }
  }

  return (
    <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-6">
      {/* Campo de Busca - keep existing code the same */}
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-xl border border-blue-400/30 shadow-xl shadow-blue-500/15 backdrop-blur-sm"></div>
        <div className="relative">
          {isSearching ? (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 drop-shadow-lg" />
          )}
          <Input
            placeholder="Pesquisar por nome, email, telefone, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-background/90 backdrop-blur-sm border-blue-400/40 text-white placeholder:text-blue-200/70 hover:border-blue-300/60 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-sm font-medium rounded-xl"
          />
        </div>
      </div>

      {/* Status Origem com gradiente rosa vibrante */}
      {setOrigemFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-xl border border-pink-400/30 shadow-xl shadow-pink-500/15 backdrop-blur-sm"></div>
          <Select value={origemFilter} onValueChange={handleOrigemChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-pink-400/40 text-white hover:border-pink-300/60 focus:border-pink-300 focus:ring-2 focus:ring-pink-400/30 transition-all duration-300 rounded-xl">
              <SelectValue placeholder="Origem" className="font-medium" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              {ORIGEM_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filtro de Cores com gradiente multicolorido */}
      {setColorFilter && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-blue-500/10 via-green-500/10 to-purple-500/10 rounded-xl border border-gray-400/30 shadow-xl shadow-gray-500/15 backdrop-blur-sm"></div>
          <Select value={colorFilter} onValueChange={handleColorChange}>
            <SelectTrigger className="relative w-full sm:w-56 h-12 bg-background/90 backdrop-blur-sm border-gray-400/40 text-white hover:border-gray-300/60 focus:border-gray-300 focus:ring-2 focus:ring-gray-400/30 transition-all duration-300 rounded-xl">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-300" />
                <SelectValue placeholder="Filtrar por cor" className="font-medium" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/50 shadow-2xl rounded-xl">
              {COLOR_FILTER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    {option.color ? (
                      <div className={`w-4 h-4 rounded-full ${option.color}`} />
                    ) : option.value === 'sem-cor' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground" />
                    ) : (
                      <Palette className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status da Campanha - keep existing code the same */}
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

      {/* Status do Site - keep existing code the same */}
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

      {/* Status Criativo - keep existing code the same */}
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

      {/* Status BM - keep existing code the same */}
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
