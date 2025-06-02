
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SiteStatusSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  isUpdating?: boolean
  compact?: boolean
}

const SITE_STATUS_OPTIONS = [
  { 
    value: 'pendente', 
    label: 'Pendente', 
    compact: 'Pend.', 
    style: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30 shadow-lg shadow-gray-500/20'
  },
  { 
    value: 'aguardando_link', 
    label: 'Aguardando Link', 
    compact: 'Aguard.', 
    style: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/20'
  },
  { 
    value: 'nao_precisa', 
    label: 'Não Precisa', 
    compact: 'N/Prec.', 
    style: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20'
  },
  { 
    value: 'finalizado', 
    label: 'Finalizado', 
    compact: 'Final.', 
    style: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20'
  }
]

export function SiteStatusSelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  isUpdating = false,
  compact = false
}: SiteStatusSelectProps) {
  const currentStatus = SITE_STATUS_OPTIONS.find(option => option.value === value) || SITE_STATUS_OPTIONS[0]
  const displayValue = compact ? currentStatus.compact : currentStatus.label
  const shouldShowTooltip = compact && displayValue !== currentStatus.label

  const selectContent = (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isUpdating}>
      <SelectTrigger className={`${compact ? 'h-6 text-xs w-[140px] min-w-[140px]' : 'h-8 w-[160px] min-w-[160px]'} bg-background/50 backdrop-blur-sm text-white border-border/50 hover:border-border transition-all duration-200`}>
        <SelectValue>
          <div className="flex items-center gap-1">
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            <div 
              className={`${currentStatus.style} ${compact ? 'text-xs px-2 py-0.5 rounded-lg' : 'text-xs px-3 py-1 rounded-lg'} font-medium transition-all duration-200 hover:scale-105 truncate`}
            >
              {displayValue}
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        {SITE_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-card-foreground hover:bg-muted/50 transition-colors duration-200">
            <div 
              className={`${option.style} text-xs px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105`}
            >
              {option.label}
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
            <p>{currentStatus.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return selectContent
}
