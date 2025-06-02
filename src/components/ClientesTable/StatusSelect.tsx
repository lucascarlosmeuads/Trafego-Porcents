
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
      <SelectTrigger className={`${compact ? 'h-6 text-xs w-fit max-w-[100px]' : 'h-8 w-fit max-w-[140px]'} bg-background text-white border-border`}>
        <SelectValue>
          <div className="flex items-center gap-1">
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            <Badge 
              variant="outline" 
              className={`${getStatusColor(value)} ${compact ? 'text-xs px-1 py-0' : 'text-xs px-2 py-0'} border-0`}
            >
              {displayValue}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border max-h-60 overflow-y-auto">
        {STATUS_CAMPANHA.map((status) => (
          <SelectItem key={status} value={status} className="text-card-foreground">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(status)} text-xs border-0`}
            >
              {status}
            </Badge>
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
          <TooltipContent>
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return selectContent
}
