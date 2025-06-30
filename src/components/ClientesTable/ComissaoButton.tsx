
import { ComissaoSimples } from './ComissaoSimples'
import { Cliente } from '@/lib/supabase'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  isAdmin?: boolean
  onComissionUpdate?: () => void
  compact?: boolean
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  isAdmin = false,
  onComissionUpdate,
  compact = false
}: ComissaoButtonProps) {
  return (
    <ComissaoSimples
      cliente={cliente}
      isAdmin={isAdmin}
      onComissionUpdate={onComissionUpdate}
      compact={compact}
    />
  )
}
