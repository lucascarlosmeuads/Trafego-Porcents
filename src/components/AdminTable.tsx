
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Smartphone, Monitor } from 'lucide-react'
import { AdminTableCards } from './AdminTable/AdminTableCards'
import { AdminTableDesktop } from './AdminTable/AdminTableDesktop'
import { AdminTablePagination } from './AdminTable/AdminTablePagination'
import { useAdminTableLogic } from './AdminTable/useAdminTableLogic'
import { formatDate, getStatusColor } from './AdminTable/adminTableUtils'

interface AdminTableProps {
  selectedManager?: string | null
  filterType?: 'sites-pendentes' | 'saques-pendentes' | string
}

export function AdminTable({ selectedManager, filterType }: AdminTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  const {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    pagination,
    handleTransferirCliente,
    handleStatusChange,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage
  } = useAdminTableLogic({ selectedManager, filterType })

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

  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
  const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)

  // Determinar título baseado no filtro
  const getTitle = () => {
    if (filterType === 'sites-pendentes') {
      return `Sites Pendentes (${pagination.totalItems})`
    }
    if (filterType === 'saques-pendentes') {
      return `Saques Pendentes (${pagination.totalItems})`
    }
    if (selectedManager && selectedManager !== 'Todos os Clientes' && selectedManager !== 'Todos os Gestores') {
      return `Clientes - ${selectedManager} (${pagination.totalItems})`
    }
    return `Todos os Clientes (${pagination.totalItems})`
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              {getTitle()}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Mostrando {startItem} a {endItem} de {pagination.totalItems} clientes
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Seletor de itens por página */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens:</span>
              <Select 
                value={pagination.itemsPerPage.toString()} 
                onValueChange={(value) => changeItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Botão de mudança de visualização */}
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
        
        {clientes.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
        
        {/* Controles de paginação */}
        {pagination.totalPages > 1 && (
          <AdminTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
            onPrevious={prevPage}
            onNext={nextPage}
            className="mt-6"
          />
        )}
      </CardContent>
    </Card>
  )
}
