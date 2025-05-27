import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Smartphone, Monitor, Calendar, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { TransferClientModal } from './TransferClientModal'

interface ClientesTableProps {
  selectedManager: string | null
  filterType?: string
}

export function ClientesTable({ selectedManager, filterType }: ClientesTableProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [selectedClienteForTransfer, setSelectedClienteForTransfer] = useState<Cliente | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [selectedManager, filterType])

  const fetchClientes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedManager && selectedManager !== '__TODOS__') {
        query = query.eq('email_gestor', selectedManager)
      }

      if (filterType === 'saques-pendentes') {
        query = query.eq('saque_solicitado', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro na consulta:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = async (id: string, field: keyof Cliente, value: string) => {
    try {
      console.log(`Atualizando cliente ${id}: ${field} = ${value}`)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        // Atualizar o estado local
        setClientes(prev => prev.map(cliente => 
          cliente.id === id ? { ...cliente, [field]: value } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Alterando status do cliente ${id} para: ${newStatus}`)
    updateField(id, 'status_campanha', newStatus)
  }

  const handleTransferClick = (cliente: Cliente) => {
    console.log('Abrindo modal de transferência para cliente:', cliente.nome_cliente)
    setSelectedClienteForTransfer(cliente)
    setTransferModalOpen(true)
  }

  const handleTransferComplete = () => {
    console.log('Transferência concluída, recarregando dados')
    fetchClientes() // Recarregar dados após transferência
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
      case 'Configurando BM':
        return 'bg-cyan-500/20 text-cyan-700 border border-cyan-500/30'
      case 'Subindo Campanha':
        return 'bg-lime-500/20 text-lime-700 border border-lime-500/30'
      case 'Campanha no Ar':
        return 'bg-green-500/20 text-green-700 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
      case 'Cliente Sumiu':
        return 'bg-slate-500/20 text-slate-700 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-700 border border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

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
    <>
      <Card className="w-full bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              Clientes ({clientes.length})
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
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Visualização em cartões para mobile */}
          {viewMode === 'cards' && (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="w-full bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between text-card-foreground">
                      <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                      <span className="text-xs font-mono text-muted-foreground">#{cliente.id}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Telefone:</span>
                      <span className="ml-2 text-card-foreground">{cliente.telefone || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Email Gestor:</span>
                      <span className="ml-2 text-card-foreground">{cliente.email_gestor || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha)}`}>
                        {cliente.status_campanha || 'Sem status'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Data Venda:</span>
                      <span className="ml-2 text-card-foreground">{formatDate(cliente.data_venda)}</span>
                    </div>
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleTransferClick(cliente)}
                        variant="outline" 
                        size="sm"
                        className="w-full gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Transferir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tabela para desktop */}
          <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'} overflow-x-auto`}>
            <Table className="table-dark">
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/20">
                  <TableHead className="w-16 text-muted-foreground">ID</TableHead>
                  <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                  <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                  <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
                  <TableHead className="min-w-[180px] text-muted-foreground">Email Gestor</TableHead>
                  <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
                  <TableHead className="min-w-[120px] text-muted-foreground">Transferir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente, index) => (
                  <TableRow 
                    key={cliente.id} 
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-foreground">
                      {String(index + 1).padStart(3, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">{formatDate(cliente.data_venda)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate text-foreground">
                        {cliente.nome_cliente}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{cliente.telefone}</TableCell>
                    <TableCell>
                      <div className="max-w-[180px] truncate text-foreground">
                        {cliente.email_gestor}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={cliente.status_campanha || ''}
                        onValueChange={(value) => handleStatusChange(cliente.id, value)}
                      >
                        <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
                          <SelectValue>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                              {cliente.status_campanha || 'Sem status'}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {STATUS_CAMPANHA.map(status => (
                            <SelectItem key={status} value={status}>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handleTransferClick(cliente)}
                        variant="outline" 
                        size="sm"
                        className="gap-1 h-8 px-3"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Transferir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {clientes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <TransferClientModal
        cliente={selectedClienteForTransfer}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransferComplete={handleTransferComplete}
      />
    </>
  )
}
