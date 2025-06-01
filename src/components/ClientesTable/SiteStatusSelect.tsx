
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface SiteStatusSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  isUpdating?: boolean
  compact?: boolean
}

const SITE_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-500/20 text-gray-300' },
  { value: 'aguardando_link', label: 'Aguardando Link', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'nao_precisa', label: 'Não Precisa', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'finalizado', label: 'Finalizado', color: 'bg-green-500/20 text-green-300' }
]

export function SiteStatusSelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  isUpdating = false,
  compact = false
}: SiteStatusSelectProps) {
  const currentStatus = SITE_STATUS_OPTIONS.find(option => option.value === value) || SITE_STATUS_OPTIONS[0]

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isUpdating}>
      <SelectTrigger className={`${compact ? 'h-6 text-xs' : 'h-8'} bg-background text-white border-border`}>
        <SelectValue>
          <div className="flex items-center gap-1">
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            <Badge 
              variant="outline" 
              className={`${currentStatus.color} ${compact ? 'text-xs px-1 py-0' : 'text-xs'} border-0`}
            >
              {compact ? currentStatus.label.substring(0, 6) + (currentStatus.label.length > 6 ? '...' : '') : currentStatus.label}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {SITE_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-card-foreground">
            <Badge 
              variant="outline" 
              className={`${option.color} text-xs border-0`}
            >
              {option.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
