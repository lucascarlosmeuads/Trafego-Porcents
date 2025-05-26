
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RealtimeStatus } from './RealtimeStatus'
import { useState } from 'react'

interface TableActionsProps {
  selectedManager: string
  filteredClientesCount: number
  realtimeConnected: boolean
  onRefresh: () => void
  onExport: () => void
}

export function TableActions({
  selectedManager,
  filteredClientesCount,
  realtimeConnected,
  onRefresh,
  onExport
}: TableActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

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
