
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { STATUS_CAMPANHA, type StatusCampanha } from '@/lib/supabase'

interface StatusSelectProps {
  value: StatusCampanha
  onValueChange: (value: StatusCampanha) => void
  disabled?: boolean
  isUpdating?: boolean
  getStatusColor: (status: string) => string
  compact?: boolean
}

export function StatusSelect({ 
  value, 
  onValueChange, 
  disabled = false, 
  isUpdating = false, 
  getStatusColor,
  compact = false
}: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isUpdating}>
      <SelectTrigger className={`${compact ? 'h-6 text-xs' : 'h-8'} bg-background text-white border-border`}>
        <SelectValue>
          <div className="flex items-center gap-1">
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            <Badge 
              variant="outline" 
              className={`${getStatusColor(value)} ${compact ? 'text-xs px-1 py-0' : 'text-xs'} border-0`}
            >
              {compact ? value.substring(0, 8) + (value.length > 8 ? '...' : '') : value}
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
}
