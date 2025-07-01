
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Smartphone, Monitor, Database } from 'lucide-react'
import { AdminTableCards } from './AdminTable/AdminTableCards'
import { AdminTableDesktop } from './AdminTable/AdminTableDesktop'
import { useAdminTableLogic } from './AdminTable/useAdminTableLogic'
import { formatDate, getStatusColor } from './AdminTable/adminTableUtils'

export function AdminTable() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  const {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    handleTransferirCliente,
    handleStatusChange
  } = useAdminTableLogic()

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Carregando todos os clientes...</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4" />
              <span>Buscando registros completos no banco de dados</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              Todos os Clientes ({clientes.length})
            </CardTitle>
            {clientes.length >= 1000 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Database className="w-4 h-4" />
                <span>✅ Carregamento completo - {clientes.length} registros</span>
              </div>
            )}
          </div>
          <Button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            variant="outline"
            size="sm"
            className="lg:hidden"
          >
            {viewMode === 'table' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
            {viewMode === 'table' ? 'Cartões' : 'Tabela'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Visualização em cartões para mobile */}
        {viewMode === 'cards' && (
          <AdminTableCards
            clientes={clientes}
            gestores={gestores}
            transferindoCliente={transferindoCliente}
            onTransferirCliente={handleTransferirCliente}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Tabela para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
          <AdminTableDesktop
            clientes={clientes}
            gestores={gestores}
            transferindoCliente={transferindoCliente}
            onTransferirCliente={handleTransferirCliente}
            onStatusChange={handleStatusChange}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        </div>
        
        {clientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
