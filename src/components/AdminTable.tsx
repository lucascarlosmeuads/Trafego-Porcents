
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Smartphone, Monitor } from 'lucide-react'
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
      <div className="bg-admin-bg min-h-screen p-6">
        <Card className="bg-admin-card border-admin-border rounded-xl">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-admin-purple" />
              <span className="text-admin-text-primary">Carregando dados...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-admin-bg min-h-screen p-6">
      <Card className="w-full bg-admin-card border-admin-border rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-bold text-admin-text-primary">
              Todos os Clientes ({clientes.length})
            </CardTitle>
            <Button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              variant="outline"
              size="sm"
              className="lg:hidden bg-admin-card border-admin-border text-admin-text-info hover:bg-admin-border/20 hover:text-admin-text-primary transition-colors"
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
            <div className="text-center py-16 text-admin-text-secondary">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
