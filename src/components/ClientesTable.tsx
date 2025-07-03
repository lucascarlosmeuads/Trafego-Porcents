import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminTableLogic } from '@/hooks/useAdminTableLogic'
import { ClientesTableControls } from './ClientesTable/ClientesTableControls'
import { ClientesTableHeader } from './ClientesTable/ClientesTableHeader'
import { ClientesTableContent } from './ClientesTable/ClientesTableContent'
import { ClientesTablePagination } from './ClientesTable/ClientesTablePagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface ClientesTableProps {
  selectedManager?: string | null
  onManagerSelect?: (manager: string | null) => void
  customClientes?: any[]
  showOrigemFilter?: boolean
  onRefresh?: () => void
  title?: string
}

export function ClientesTable({ 
  selectedManager, 
  onManagerSelect, 
  customClientes,
  showOrigemFilter = true,
  onRefresh,
  title = "Tabela de Clientes"
}: ClientesTableProps) {
  const { isAdmin } = useAuth()
  const {
    clientes: defaultClientes,
    loading: defaultLoading,
    totalClientes: defaultTotal,
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    refetchData,
    selectedStatus,
    setSelectedStatus,
    selectedVendedor,
    setSelectedVendedor,
    vendedores,
    setSelectedSearchTerm,
    selectedOrigem,
    setSelectedOrigem
  } = useAdminTableLogic()

  // Use custom data if provided, otherwise use default
  const clientes = customClientes || defaultClientes
  const loading = customClientes ? false : defaultLoading
  const totalClientes = customClientes ? customClientes.length : defaultTotal

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      refetchData()
    }
  }

  // Filter clientes by origem if showOrigemFilter is true
  const filteredClientes = showOrigemFilter 
    ? clientes.filter(cliente => 
        !cliente.origem_cadastro || cliente.origem_cadastro === 'venda'
      )
    : clientes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <ClientesTableControls 
            selectedManager={selectedManager}
            onManagerSelect={onManagerSelect}
            showManagerFilter={isAdmin && !customClientes}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedVendedor={selectedVendedor}
            setSelectedVendedor={setSelectedVendedor}
            vendedores={vendedores}
            setSelectedSearchTerm={setSelectedSearchTerm}
            selectedOrigem={selectedOrigem}
            setSelectedOrigem={setSelectedOrigem}
            showOrigemFilter={showOrigemFilter}
          />

          {/* Header */}
          <ClientesTableHeader 
            totalClientes={showOrigemFilter ? filteredClientes.length : totalClientes}
            selectedManager={selectedManager}
          />

          {/* Content */}
          <ClientesTableContent 
            clientes={showOrigemFilter ? filteredClientes : clientes}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onRefresh={handleRefresh}
          />

          {/* Pagination - only show if not using custom data */}
          {!customClientes && (
            <ClientesTablePagination 
              currentPage={currentPage}
              totalClientes={totalClientes}
              itemsPerPage={itemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientesTable
