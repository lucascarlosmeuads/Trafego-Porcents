
import { ComissaoSimples } from './ComissaoSimples'
import { Cliente } from '@/lib/supabase'

interface ComissaoButtonProps {
  cliente: Cliente
  isGestorDashboard?: boolean
  isAdmin?: boolean
  onComissionUpdate?: () => void
  compact?: boolean
  isVendedor?: boolean
}

export function ComissaoButton({
  cliente,
  isGestorDashboard = false,
  isAdmin = false,
  onComissionUpdate,
  compact = false,
  isVendedor = false
}: ComissaoButtonProps) {
  // Determinar o tipo de usuário para calcular a comissão correta
  const userType = isVendedor ? 'seller' : 'manager'
  
  return (
    <ComissaoSimples
      cliente={cliente}
      isAdmin={isAdmin}
      onComissionUpdate={onComissionUpdate}
      compact={compact}
      userType={userType}
    />
  )
}
