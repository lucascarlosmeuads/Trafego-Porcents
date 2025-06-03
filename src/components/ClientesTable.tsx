
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { AddClientRow } from './ClientesTable/AddClientRow'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableHeader } from './ClientesTable/TableHeader'
import { MobileTableIndicator } from './ClientesTable/MobileTableIndicator'
import { ResponsiveTableWrapper } from './ClientesTable/ResponsiveTableWrapper'
import { RealtimeStatus } from './ClientesTable/RealtimeStatus'
import { Table, TableBody } from '@/components/ui/table'
import { useGestorPermissions } from '@/hooks/useGestorPermissions'
import { getStatusColor } from '@/utils/statusColors'
import { useClientFilters } from '@/hooks/useClientFilters'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingFallback } from './LoadingFallback'

interface ClientesTableProps {
  selectedManager?: string | null
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const { user, isAdmin, isGestor } = useAuth()
  const { canAddClients } = useGestorPermissions()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  console.log('🔍 [ClientesTable] === INICIALIZAÇÃO ===')
  console.log('🔍 [ClientesTable] User:', user?.email)
  console.log('🔍 [ClientesTable] IsAdmin:', isAdmin)
  console.log('🔍 [ClientesTable] Selected Manager:', selectedManager)
  console.log('🔍 [ClientesTable] Can Add Clients:', canAddClients)

  // Hook para buscar dados do gestor
  const { clientes, loading: clientesLoading, error, refetch } = useManagerData(
    user?.email || '',
    isAdmin,
    selectedManager
  )

  // Hook para operações de cliente
  const { addCliente, loading: addLoading } = useClienteOperations(
    user?.email || '',
    isAdmin,
    () => {
      console.log('🔄 [ClientesTable] Callback de sucesso - fazendo refresh')
      setRefreshTrigger(prev => prev + 1)
      refetch()
    }
  )

  // Hook para filtros
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    comissaoFilter,
    setComissaoFilter,
    filteredClientes
  } = useClientFilters(clientes)

  // Trigger refresh when needed
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch()
    }
  }, [refreshTrigger, refetch])

  console.log('📊 [ClientesTable] Dados:', {
    totalClientes: clientes.length,
    filteredCount: filteredClientes.length,
    loading: clientesLoading,
    error: error
  })

  if (clientesLoading) {
    return <LoadingFallback />
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Erro ao carregar clientes</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determinar se pode adicionar clientes
  const showAddRow = isAdmin || (isGestor && canAddClients)

  return (
    <div className="space-y-4 w-full">
      <RealtimeStatus isConnected={true} />
      
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            <TableFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              comissaoFilter={comissaoFilter}
              setComissaoFilter={setComissaoFilter}
              getStatusColor={getStatusColor}
            />
          </div>
          
          <MobileTableIndicator />
          
          <ResponsiveTableWrapper>
            <Table>
              <TableHeader />
              <TableBody>
                {showAddRow && (
                  <AddClientRow
                    onAddClient={addCliente}
                    isLoading={addLoading}
                    getStatusColor={getStatusColor}
                    selectedManager={selectedManager}
                  />
                )}
                
                {filteredClientes.map((cliente, index) => (
                  <ClienteRow
                    key={cliente.id}
                    cliente={cliente}
                    selectedManager={selectedManager || ''}
                    index={index}
                    isAdmin={isAdmin}
                    showEmailGestor={isAdmin}
                    showSitePagoCheckbox={true}
                    updatingStatus={null}
                    editingLink={null}
                    linkValue=""
                    setLinkValue={() => {}}
                    editingBM={null}
                    bmValue=""
                    setBmValue={() => {}}
                    getStatusColor={getStatusColor}
                    onStatusChange={() => {}}
                    onSiteStatusChange={() => {}}
                    onLinkEdit={() => {}}
                    onLinkSave={async () => false}
                    onLinkCancel={() => {}}
                    onBMEdit={() => {}}
                    onBMSave={() => {}}
                    onBMCancel={() => {}}
                    onComissionUpdate={() => {
                      console.log('🔄 [ClientesTable] Comissão atualizada - fazendo refresh')
                      setRefreshTrigger(prev => prev + 1)
                      refetch()
                    }}
                    onSitePagoChange={() => {}}
                  />
                ))}
                
                {filteredClientes.length === 0 && (
                  <tr>
                    <td colSpan={15} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter || comissaoFilter
                        ? 'Nenhum cliente encontrado com os filtros aplicados'
                        : 'Nenhum cliente encontrado'
                      }
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </ResponsiveTableWrapper>
        </CardContent>
      </Card>
    </div>
  )
}
