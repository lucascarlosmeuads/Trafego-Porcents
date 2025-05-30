import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody } from '@/components/ui/table'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableHeader } from './ClientesTable/TableHeader'
import { AddClientRow } from './ClientesTable/AddClientRow'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { TableActions } from './ClientesTable/TableActions'
import { RealtimeStatus } from './ClientesTable/RealtimeStatus'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, AlertTriangle, FileText, Plus, Download, Upload, RefreshCw, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { differenceInDays, parseISO } from 'date-fns'

interface Cliente {
  id: string
  created_at: string
  nome_cliente: string
  email_cliente: string
  telefone: string
  status_campanha: string
  email_gestor: string
  data_venda: string | null
  site_pago: {
    status: boolean | null
    link: string | null
  } | null
  site_status: string | null
}

interface Gestor {
  email: string
  nome: string
}

interface Props {
  isSitesContext?: boolean
  userEmail?: string
}

export function ClientesTable({ isSitesContext = false, userEmail }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedManager, setSelectedManager] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'sites-pendentes' | 'sites-finalizados' | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user?.email === 'admin@admin.com') {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user])

  const {
    clientes,
    loading,
    error,
    refetch,
    updateCliente,
    addCliente,
    setClientes
  } = useManagerData(
    userEmail || '',
    isAdmin,
    selectedManager || undefined,
    filterType || undefined
  )

  const [gestores, setGestores] = useState<Gestor[]>([])

  useEffect(() => {
    const fetchGestores = async () => {
      try {
        const { data, error } = await supabase
          .from('gestores')
          .select('email, nome')

        if (error) {
          console.error('Erro ao buscar gestores:', error)
        }

        if (data) {
          setGestores(data)
        }
      } catch (error) {
        console.error('Erro ao buscar gestores:', error)
      }
    }

    fetchGestores()
  }, [])

  const [isAddingClient, setIsAddingClient] = useState(false)

  const handleAddClient = () => {
    setIsAddingClient(true)
  }

  const handleCancelAddClient = () => {
    setIsAddingClient(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const success = await updateCliente(id, 'status_campanha', newStatus)
    if (success) {
      toast.success('Status da campanha atualizado com sucesso!')
    } else {
      toast.error('Erro ao atualizar o status da campanha.')
    }
  }

  const filteredClientes = clientes.filter((cliente) => {
    const statusMatch =
      !selectedStatus || cliente.status_campanha === selectedStatus
    const searchMatch =
      cliente.nome_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.email_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.telefone.includes(searchQuery)

    return statusMatch && searchMatch
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)

  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)

  const handleTransferirCliente = async (clienteId: string, novoEmailGestor: string) => {
    setTransferindoCliente(clienteId)
    try {
      const success = await updateCliente(clienteId, 'email_gestor', novoEmailGestor)
      if (success) {
        toast.success('Gestor transferido com sucesso!')
        refetch()
      } else {
        toast.error('Erro ao transferir gestor.')
      }
    } catch (error) {
      toast.error('Erro ao transferir gestor.')
    } finally {
      setTransferindoCliente(null)
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const reader = new FileReader()

      reader.onload = async (e: any) => {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',')
        const data = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length === headers.length) {
            const row: { [key: string]: any } = {}
            for (let j = 0; j < headers.length; j++) {
              row[headers[j].trim()] = values[j].trim()
            }
            data.push(row)
          }
        }

        for (const clienteData of data) {
          await addCliente(clienteData)
        }

        toast.success('Clientes importados com sucesso!')
        refetch()
      }

      reader.readAsText(file)
    } catch (error) {
      toast.error('Erro ao importar clientes.')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const csvRows = []
      const headers = Object.keys(clientes[0] || {})
      csvRows.push(headers.join(','))

      for (const row of clientes) {
        const values = headers.map((header) => row[header])
        csvRows.push(values.join(','))
      }

      const csvData = csvRows.join('\n')
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', 'clientes.csv')
      a.click()
      toast.success('Clientes exportados com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar clientes.')
    } finally {
      setExporting(false)
    }
  }

  const calculateDaysSinceCreation = (createdAt: string): number => {
    const creationDate = parseISO(createdAt)
    const today = new Date()
    return differenceInDays(today, creationDate)
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSitesContext ? (
            <>
              <FileText className="h-5 w-5" />
              Sites
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Clientes
            </>
          )}
          {isAdmin && !isSitesContext && (
            <Badge variant="secondary">Admin</Badge>
          )}
          {isSitesContext && (
            <Badge variant="secondary">Painel Site Creator</Badge>
          )}
          <div className="ml-auto flex items-center gap-2">
            {error && (
              <Badge variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Erro
              </Badge>
            )}
            <RealtimeStatus />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TableActions
          isSitesContext={isSitesContext}
          isAddingClient={isAddingClient}
          handleAddClient={handleAddClient}
          handleCancelAddClient={handleCancelAddClient}
          handleImport={handleImport}
          handleExport={handleExport}
          importing={importing}
          exporting={exporting}
          refetch={refetch}
        />

        <TableFilters
          isSitesContext={isSitesContext}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAdmin={isAdmin}
          selectedManager={selectedManager}
          setSelectedManager={setSelectedManager}
          gestores={gestores}
          filterType={filterType}
          setFilterType={setFilterType}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card border-border">
            <div className="w-full" style={{ overflowX: 'scroll', scrollbarWidth: 'auto' }}>
              <Table className="table-dark">
                <TableHeader isAdmin={isAdmin} showEmailGestor={isSitesContext} />
                <TableBody>
                  {isAddingClient && (
                    <AddClientRow
                      gestores={gestores}
                      addCliente={addCliente}
                      setIsAddingClient={setIsAddingClient}
                      refetch={refetch}
                    />
                  )}
                  {currentItems.map((cliente) => (
                    <ClienteRow
                      key={cliente.id}
                      cliente={cliente}
                      isAdmin={isAdmin}
                      gestores={gestores}
                      transferindoCliente={transferindoCliente}
                      onTransferirCliente={handleTransferirCliente}
                      onStatusChange={handleStatusChange}
                      calculateDaysSinceCreation={calculateDaysSinceCreation}
                      showEmailGestor={isSitesContext}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredClientes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-3 py-1 rounded-full ${currentPage === number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  {number}
                </button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
