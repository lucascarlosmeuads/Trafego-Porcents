
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Smartphone, Monitor, Database, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminTableCards } from './AdminTable/AdminTableCards'
import { AdminTableDesktop } from './AdminTable/AdminTableDesktop'
import { useAdminTableLogic } from './AdminTable/useAdminTableLogic'
import { AddOldClientModal } from './AdminTable/AddOldClientModal'
import { formatDate, getStatusColor } from './AdminTable/adminTableUtils'

export function AdminTable() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showAddOldClientModal, setShowAddOldClientModal] = useState(false)
  
  const {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    handleTransferirCliente,
    handleStatusChange,
    handleComissionUpdate,
    refetchClientes
  } = useAdminTableLogic()

  // Separar clientes ativos e antigos
  const clientesAtivos = clientes.filter(cliente => 
    cliente.status_campanha !== 'Cliente Antigo'
  )
  
  const clientesAntigos = clientes.filter(cliente => 
    cliente.status_campanha === 'Cliente Antigo'
  )

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

  const renderClientTable = (clientesList: typeof clientes, isOldClients = false) => (
    <>
      {/* Visualização em cartões para mobile */}
      {viewMode === 'cards' && (
        <AdminTableCards
          clientes={clientesList}
          gestores={gestores}
          transferindoCliente={transferindoCliente}
          onTransferirCliente={handleTransferirCliente}
          onComissionUpdate={handleComissionUpdate}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Tabela para desktop */}
      <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
        <AdminTableDesktop
          clientes={clientesList}
          gestores={gestores}
          transferindoCliente={transferindoCliente}
          onTransferirCliente={handleTransferirCliente}
          onStatusChange={handleStatusChange}
          onComissionUpdate={handleComissionUpdate}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      </div>
      
      {clientesList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {isOldClients ? 'Nenhum cliente antigo encontrado' : 'Nenhum cliente ativo encontrado'}
        </div>
      )}
    </>
  )

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
        <Tabs defaultValue="ativos" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="ativos" className="text-sm">
                Clientes Ativos ({clientesAtivos.length})
              </TabsTrigger>
              <TabsTrigger value="antigos" className="text-sm">
                Clientes Antigos ({clientesAntigos.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ativos" className="mt-0">
            {renderClientTable(clientesAtivos, false)}
          </TabsContent>

          <TabsContent value="antigos" className="mt-0">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowAddOldClientModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente Antigo
              </Button>
            </div>
            {renderClientTable(clientesAntigos, true)}
          </TabsContent>
        </Tabs>
      </CardContent>

      <AddOldClientModal
        isOpen={showAddOldClientModal}
        onClose={() => setShowAddOldClientModal(false)}
        onClientAdded={() => {
          refetchClientes()
          setShowAddOldClientModal(false)
        }}
      />
    </Card>
  )
}
