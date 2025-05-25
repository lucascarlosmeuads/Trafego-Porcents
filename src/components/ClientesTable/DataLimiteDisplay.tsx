
import type { Cliente } from '@/lib/supabase'

interface DataLimiteDisplayProps {
  cliente: Cliente
  isGestorDashboard?: boolean
}

export function DataLimiteDisplay({ cliente, isGestorDashboard = false }: DataLimiteDisplayProps) {
  // Se for painel do gestor e status for "No Ar", mostrar "✅ Cumprido"
  if (isGestorDashboard && cliente.status_campanha === 'No Ar') {
    return (
      <span className="text-green-600 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-300">
        ✅ Cumprido
      </span>
    )
  }

  // Comportamento padrão
  return (
    <span className="text-xs text-contrast-secondary">
      {cliente.data_limite || 'Não definida'}
    </span>
  )
}
