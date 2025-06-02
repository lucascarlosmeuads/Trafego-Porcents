
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { STATUS_CAMPANHA, type StatusCampanha } from '@/lib/supabase'
import { getModernStatusStyle } from '@/utils/statusColors'

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
      <SelectTrigger className={`${compact ? 'h-6 text-xs w-[140px] min-w-[140px]' : 'h-8 w-[160px] min-w-[160px]'} bg-background/50 backdrop-blur-sm text-white border-border/50 hover:border-border transition-all duration-200`}>
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
