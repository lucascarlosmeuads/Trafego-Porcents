
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Smartphone, Monitor } from 'lucide-react'
import { AdminTableCards } from './AdminTableCards'
import { AdminTableVirtualized } from './AdminTableVirtualized'
import { AdminTableFilters } from './AdminTableFilters'
import { useAdminTableLogic } from './useAdminTableLogic'
import { formatDate, getStatusColor } from './adminTableUtils'
import { useDebounce } from '@/hooks/utils/useDebounce'

export function AdminTableOptimized() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [gestorFilter, setGestorFilter] = useState('')
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    handleTransferirCliente,
    handleStatusChange
  } = useAdminTableLogic()

  // Memoize filtered clients to avoid recalculation
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = !debouncedSearchTerm || 
        cliente.nome_cliente?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cliente.telefone?.includes(debouncedSearchTerm) ||
        cliente.email_cliente?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || cliente.status_campanha === statusFilter
      const matchesGestor = !gestorFilter || cliente.email_gestor === gestorFilter
      
      return matchesSearch && matchesStatus && matchesGestor
    })
  }, [clientes, debouncedSearchTerm, statusFilter, gestorFilter])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl text-card-foreground">
            Todos os Clientes ({filteredClientes.length} de {clientes.length})
          </CardTitle>
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
        
        <AdminTableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          gestorFilter={gestorFilter}
          onGestorFilterChange={setGestorFilter}
          gestores={gestores}
        />
      </CardHeader>
      
      <CardContent className="p-0 sm:p-6">
        {/* Visualização em cartões para mobile */}
        {viewMode === 'cards' && (
          <AdminTableCards
            clientes={filteredClientes}
            gestores={gestores}
            transferindoCliente={transferindoCliente}
            onTransferirCliente={handleTransferirCliente}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Tabela virtualizada para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
          {filteredClientes.length > 100 ? (
            <AdminTableVirtualized
              clientes={filteredClientes}
              gestores={gestores}
              transferindoCliente={transferindoCliente}
              onTransferirCliente={handleTransferirCliente}
              onStatusChange={handleStatusChange}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          ) : (
            <AdminTableVirtualized
              clientes={filteredClientes}
              gestores={gestores}
              transferindoCliente={transferindoCliente}
              onTransferirCliente={handleTransferirCliente}
              onStatusChange={handleStatusChange}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          )}
        </div>
        
        {filteredClientes.length === 0 && clientes.length > 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado com os filtros aplicados
          </div>
        )}
        
        {clientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
