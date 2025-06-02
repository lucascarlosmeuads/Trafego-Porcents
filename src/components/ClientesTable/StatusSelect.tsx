
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { STATUS_CAMPANHA, type StatusCampanha } from '@/lib/supabase'

interface StatusSelectProps {
  value: StatusCampanha
  onValueChange: (value: StatusCampanha) => void
  disabled?: boolean
  isUpdating?: boolean
  getStatusColor: (status: string) => string
  compact?: boolean
}

const getCompactLabel = (status: string): string => {
  const compactMap: Record<string, string> = {
    'Cliente Novo': 'Novo',
    'Formulário': 'Form.',
    'Brief': 'Brief',
    'Criativo': 'Criat.',
    'Site': 'Site',
    'Agendamento': 'Agend.',
    'Configurando BM': 'Config.',
    'Subindo Campanha': 'Subindo',
    'Otimização': 'Otimiz.',
    'Problema': 'Probl.',
    'Cliente Sumiu': 'Sumiu',
    'Reembolso': 'Reemb.',
    'Saque Pendente': 'No Ar',
    'Campanha Anual': 'Anual',
    'Urgente': 'Urgent.',
    'Cliente Antigo': 'Antigo'
  }
  return compactMap[status] || status.substring(0, 6)
}

const getModernStatusStyle = (status: string): string => {
  const modernStyles: Record<string, string> = {
    'Cliente Novo': 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-300 border border-slate-500/30 shadow-lg shadow-slate-500/20',
    'Formulário': 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30 shadow-lg shadow-gray-500/20',
    'Brief': 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20',
    'Criativo': 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20',
    'Site': 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/20',
    'Agendamento': 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/20',
    'Configurando BM': 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20',
    'Subindo Campanha': 'bg-gradient-to-r from-lime-500/20 to-lime-600/20 text-lime-300 border border-lime-500/30 shadow-lg shadow-lime-500/20',
    'Otimização': 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/20',
    'Problema': 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/20',
    'Cliente Sumiu': 'bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-400 border border-slate-600/30 shadow-lg shadow-slate-600/20',
    'Reembolso': 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/20',
    'Saque Pendente': 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20',
    'Campanha Anual': 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/20',
    'Urgente': 'bg-gradient-to-r from-red-600/30 to-red-700/30 text-red-200 border border-red-600/40 shadow-lg shadow-red-600/30',
    'Cliente Antigo': 'bg-gradient-to-r from-violet-500/20 to-violet-600/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/20'
  }
  return modernStyles[status] || 'bg-gradient-to-r from-muted/50 to-muted/70 text-muted-foreground border border-border shadow-lg'
}

export function StatusSelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  isUpdating = false, 
  getStatusColor,
  compact = false
}: StatusSelectProps) {
  const displayValue = compact ? getCompactLabel(value) : value
  const shouldShowTooltip = compact && displayValue !== value

  const selectContent = (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isUpdating}>
      <SelectTrigger className={`${compact ? 'h-6 text-xs w-[120px] min-w-[120px]' : 'h-8 w-[140px] min-w-[140px]'} bg-background/50 backdrop-blur-sm text-white border-border/50 hover:border-border transition-all duration-200`}>
        <SelectValue>
          <div className="flex items-center gap-1">
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            <div 
              className={`${getModernStatusStyle(value)} ${compact ? 'text-xs px-2 py-0.5 rounded-lg' : 'text-xs px-3 py-1 rounded-lg'} font-medium transition-all duration-200 hover:scale-105 truncate`}
            >
              {displayValue}
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        {STATUS_CAMPANHA.map((status) => (
          <SelectItem key={status} value={status} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
            <div 
              className={`${getModernStatusStyle(status)} text-xs px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105`}
            >
              {status}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (shouldShowTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {selectContent}
          </TooltipTrigger>
          <TooltipContent className="bg-card/95 backdrop-blur-sm border-border/50">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return selectContent
}
