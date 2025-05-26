
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_CAMPANHA, Cliente } from '@/lib/supabase'

interface AdminStatusSelectProps {
  cliente: Cliente
  onStatusChange: (id: string, newStatus: string) => void
}

export function AdminStatusSelect({ cliente, onStatusChange }: AdminStatusSelectProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
      case 'No Ar':
        return 'bg-green-500/20 text-green-700 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
      case 'Off':
        return 'bg-slate-500/20 text-slate-700 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-700 border border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  return (
    <Select 
      value={cliente.status_campanha || ''}
      onValueChange={(value) => onStatusChange(cliente.id, value)}
    >
      <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
        <SelectValue>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
            {cliente.status_campanha || 'Sem status'}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {STATUS_CAMPANHA.map(status => (
          <SelectItem key={status} value={status}>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
