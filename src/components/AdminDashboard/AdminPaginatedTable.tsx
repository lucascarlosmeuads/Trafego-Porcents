import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminData } from '@/hooks/useAdminData'
import { useSitePagoUpdate } from '@/hooks/useSitePagoUpdate'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, ChevronLeft, ChevronRight, Search, Users, UserCheck, UserX, AlertCircle } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { AdminTableDesktop } from '../AdminTable/AdminTableDesktop'
import { AdminTableCards } from '../AdminTable/AdminTableCards'
import { formatDate, getStatusColor } from '../AdminTable/adminTableUtils'
import { toast } from '@/hooks/use-toast'

interface AdminPaginatedTableProps {
  selectedManager: string | null
}

export function AdminPaginatedTable({ selectedManager }: AdminPaginatedTableProps) {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [gestores] = useState([
    { email: 'andreza@trafegoporcents.com', nome: 'Andreza' },
    { email: 'carol@trafegoporcents.com', nome: 'Carol' },
    { email: 'junior@trafegoporcents.com', nome: 'Junior' },
    { email: 'danielmoreira@trafegoporcents.com', nome: 'Daniel Moreira' },
    { email: 'danielribeiro@trafegoporcents.com', nome: 'Daniel Ribeiro' },
    { email: 'kimberlly@trafegoporcents.com', nome: 'Kimberlly' },
    { email: 'jose@trafegoporcents.com', nome: 'Jose' },
    { email: 'emily@trafegoporcents.com', nome: 'Emily' },
    { email: 'falcao@trafegoporcents.com', nome: 'Falcao' },
    { email: 'felipealmeida@trafegoporcents.com', nome: 'Felipe Almeida' },
    { email: 'franciellen@trafegoporcents.com', nome: 'Franciellen' },
    { email: 'guilherme@trafegoporcents.com', nome: 'Guilherme' },
    { email: 'leandrodrumzique@trafegoporcents.com', nome: 'Leandro Drumzique' },
    { email: 'matheuspaviani@trafegoporcents.com', nome: 'Matheus Paviani' },
    { email: 'rullian@trafegoporcents.com', nome: 'Rullian' }
  ])

  const {
    clientes,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    setPage,
    refetch,
    metrics
  } = useAdminData({
    pageSize: 50,
    selectedManager,
    searchTerm,
    statusFilter,
    siteStatusFilter
  })

  const { handleSitePagoChange } = useSitePagoUpdate(clientes, () => refetch())

  const handleTransferirCliente = async (clienteId: string, novoEmailGestor: string) => {
    try {
      console.log('🔄 [AdminPaginatedTable] Transferindo cliente:', clienteId, 'para:', novoEmailGestor)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ email_gestor: novoEmailGestor })
        .eq('id', clienteId)

      if (error) {
        console.error('❌ [AdminPaginatedTable] Erro ao transferir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao transferir cliente: ${error.message}`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Cliente transferido com sucesso"
        })
        refetch()
      }
    } catch (error) {
      console.error('❌ [AdminPaginatedTable] Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao transferir cliente",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ status_campanha: newStatus })
        .eq('id', id)

      if (error) {
        console.error('❌ [AdminPaginatedTable] Erro ao atualizar status:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso"
        })
        refetch()
      }
    } catch (error) {
      console.error('❌ [AdminPaginatedTable] Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    }
  }

  // Memoizar renderização dos botões de paginação
  const paginationButtons = useMemo(() => {
    const buttons = []
    const maxButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    return buttons
  }, [currentPage, totalPages, setPage])

  if (error) {
    return (
      <Card className="w-full bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <span className="text-destructive">{error}</span>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
            <UserX className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{metrics.inactiveClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemas</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.problemClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status da Campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {STATUS_CAMPANHA.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={siteStatusFilter} onValueChange={setSiteStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status do Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Sites</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aguardando_link">Aguardando Link</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="nao_precisa">Não Precisa</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="w-full bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              Clientes ({totalCount} total, página {currentPage} de {totalPages})
            </CardTitle>
            <Button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              variant="outline"
              size="sm"
              className="lg:hidden"
            >
              {viewMode === 'table' ? 'Cartões' : 'Tabela'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-foreground">Carregando clientes...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Visualização em cartões para mobile */}
              {viewMode === 'cards' && (
                <AdminTableCards
                  clientes={clientes}
                  gestores={gestores}
                  transferindoCliente={null}
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
                  transferindoCliente={null}
                  onTransferirCliente={handleTransferirCliente}
                  onStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              </div>
              
              {clientes.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum cliente encontrado com os filtros aplicados
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {clientes.length} de {totalCount} clientes
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={prevPage}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {paginationButtons}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={nextPage}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
