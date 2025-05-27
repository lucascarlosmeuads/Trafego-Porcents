
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STATUS_CAMPANHA, getStatusDisplayLabel, type StatusCampanha } from '@/lib/supabase'

interface StatusSelectProps {
  value: StatusCampanha
  onValueChange: (value: string) => void
  disabled?: boolean
  isUpdating?: boolean
  getStatusColor: (status: string) => string
}

export function StatusSelect({
  value,
  onValueChange,
  disabled = false,
  isUpdating = false,
  getStatusColor
}: StatusSelectProps) {
  return (
    <Select 
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
        <SelectValue>
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Atualizando...</span>
            </div>
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(value)}`}>
              {getStatusDisplayLabel(value)}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {STATUS_CAMPANHA.map(status => (
          <SelectItem key={status} value={status}>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
              {getStatusDisplayLabel(status)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
