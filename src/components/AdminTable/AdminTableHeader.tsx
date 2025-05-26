
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor } from 'lucide-react'
import { AdicionarClienteAdminModal } from './AdicionarClienteAdminModal'

interface AdminTableHeaderProps {
  clientesCount: number
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  onClienteAdicionado: () => void
}

export function AdminTableHeader({ 
  clientesCount, 
  viewMode, 
  onViewModeChange, 
  onClienteAdicionado 
}: AdminTableHeaderProps) {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle className="text-lg sm:text-xl text-card-foreground">
          Todos os Clientes ({clientesCount})
        </CardTitle>
        <div className="flex items-center gap-2">
          <AdicionarClienteAdminModal onClienteAdicionado={onClienteAdicionado} />
          <Button
            onClick={() => onViewModeChange(viewMode === 'table' ? 'cards' : 'table')}
            variant="outline"
            size="sm"
            className="lg:hidden"
          >
            {viewMode === 'table' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
            {viewMode === 'table' ? 'Cartões' : 'Tabela'}
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
