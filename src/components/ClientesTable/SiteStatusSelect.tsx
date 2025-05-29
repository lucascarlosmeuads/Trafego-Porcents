
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const SITE_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'aguardando_link', label: 'Aguardando Site', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'nao_precisa', label: 'Não Precisa', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'finalizado', label: 'Finalizado', color: 'bg-green-100 text-green-800 border-green-200' }
]

interface SiteStatusSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  isUpdating?: boolean
}

export function SiteStatusSelect({
  value,
  onValueChange,
  disabled = false,
  isUpdating = false
}: SiteStatusSelectProps) {
  const getStatusConfig = (status: string) => {
    return SITE_STATUS_OPTIONS.find(option => option.value === status) || SITE_STATUS_OPTIONS[0]
  }

  const currentStatus = getStatusConfig(value)

  console.log('🌐 [SiteStatusSelect] === RENDERIZAÇÃO ===')
  console.log('🌐 [SiteStatusSelect] Valor atual:', value)
  console.log('🌐 [SiteStatusSelect] Status config:', currentStatus)
  console.log('🌐 [SiteStatusSelect] Disabled:', disabled)
  console.log('🌐 [SiteStatusSelect] IsUpdating:', isUpdating)

  return (
    <Select 
      value={value}
      onValueChange={(newValue) => {
        console.log('🌐 [SiteStatusSelect] === MUDANÇA DE STATUS ===')
        console.log('🌐 [SiteStatusSelect] Status anterior:', value)
        console.log('🌐 [SiteStatusSelect] Novo status solicitado:', newValue)
        console.log('🌐 [SiteStatusSelect] Chamando onValueChange...')
        onValueChange(newValue)
      }}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger className="h-8 w-40 bg-background border-border text-foreground">
        <SelectValue>
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Atualizando...</span>
            </div>
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        {SITE_STATUS_OPTIONS.map(option => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            onSelect={() => {
              console.log('🌐 [SiteStatusSelect] Item clicado:', option.value)
              console.log('🌐 [SiteStatusSelect] Label:', option.label)
            }}
          >
            <span className={`px-2 py-1 rounded text-xs font-medium ${option.color}`}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
