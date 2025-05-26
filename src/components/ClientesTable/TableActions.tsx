
import { Download, RefreshCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RealtimeStatus } from './RealtimeStatus'
import { AddClientModal } from './AddClientModal'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface TableActionsProps {
  selectedManager: string
  filteredClientesCount: number
  realtimeConnected: boolean
  onRefresh: () => void
  onExport: () => void
  onClienteAdicionado?: () => void
  hideAddButton?: boolean
}

export function TableActions({
  selectedManager,
  filteredClientesCount,
  realtimeConnected,
  onRefresh,
  onExport,
  onClienteAdicionado,
  hideAddButton = false
}: TableActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAdmin } = useAuth()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl lg:text-2xl font-semibold text-white">Clientes - {selectedManager}</h2>
          <RealtimeStatus isConnected={realtimeConnected} />
        </div>
        <p className="text-sm text-gray-300">{filteredClientesCount} clientes encontrados</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Mostrar botão de adicionar cliente apenas para admin ou quando não for explicitamente escondido */}
        {!hideAddButton && isAdmin && onClienteAdicionado && (
          <AddClientModal
            selectedManager={selectedManager}
            onClienteAdicionado={onClienteAdicionado}
            gestorMode={false}
          />
        )}
        
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="flex-1 sm:flex-none"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
        <Button onClick={onExport} variant="outline" size="sm" className="flex-1 sm:flex-none">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
