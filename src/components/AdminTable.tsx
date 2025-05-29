import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Smartphone, Monitor, Calendar, AlertTriangle, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { getDataLimiteDisplayForGestor } from '@/utils/dateUtils'

interface TransferirModalProps {
  cliente: Cliente
  onTransferirCliente: (clienteId: string, novoEmailGestor: string) => void
  isLoading: boolean
  gestores: Array<{ email: string, nome: string }>
}

function TransferirModal({ cliente, onTransferirCliente, isLoading, gestores }: TransferirModalProps) {
  const [novoEmailGestor, setNovoEmailGestor] = useState('')
  const [open, setOpen] = useState(false)

  const handleTransferir = () => {
    if (!novoEmailGestor) return
    onTransferirCliente(cliente.id, novoEmailGestor)
    setOpen(false)
    setNovoEmailGestor('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <UserX className="w-3 h-3 mr-1" />
          Transferir
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Transferir Cliente: {cliente.nome_cliente}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Gestor Atual: {cliente.email_gestor}
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Novo Gestor:
            </label>
            <Select value={novoEmailGestor} onValueChange={setNovoEmailGestor}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione um gestor..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.email} value={gestor.email}>
                    {gestor.nome} ({gestor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleTransferir} 
              disabled={!novoEmailGestor || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transferindo...
                </>
              ) : (
                'Confirmar Transferência'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [gestores, setGestores] = useState<Array<{ email: string, nome: string }>>([])
  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAllClientes()
    fetchGestores()
  }, [])

  const fetchGestores = async () => {
    try {
      const { data, error } = await supabase
        .from('gestores')
        .select('email, nome')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('Erro ao buscar gestores:', error)
      } else {
        setGestores(data || [])
      }
    } catch (error) {
      console.error('Erro na consulta de gestores:', error)
    }
  }

  const fetchAllClientes = async () => {
    console.log('Carregando todos os clientes da tabela unificada...')
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        console.log('Dados carregados da tabela unificada:', data?.length || 0, 'registros')
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
      console.log(`Atualizando cliente admin ${id}: ${field} = ${value}`)
      
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
        console.log('Campo atualizado com sucesso na tabela unificada')
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

  const handleTransferirCliente = async (clienteId: string, novoEmailGestor: string) => {
    setTransferindoCliente(clienteId)
    
    try {
      console.log(`Transferindo cliente ${clienteId} para gestor: ${novoEmailGestor}`)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ email_gestor: novoEmailGestor })
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao transferir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao transferir cliente: ${error.message}`,
          variant: "destructive"
        })
      } else {
        // Atualizar o estado local
        setClientes(prev => prev.map(cliente => 
          cliente.id === clienteId ? { ...cliente, email_gestor: novoEmailGestor } : cliente
        ))
        console.log('Cliente transferido com sucesso')
        toast({
          title: "Sucesso",
          description: "Cliente transferido com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao transferir cliente",
        variant: "destructive"
      })
    } finally {
      setTransferindoCliente(null)
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Admin alterando status do cliente ${id} para: ${newStatus}`)
    updateField(id, 'status_campanha', newStatus)
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
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl text-card-foreground">
            Todos os Clientes ({clientes.length})
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
                  <div>
                    <span className="font-medium text-muted-foreground">Data Limite:</span>
                    <div className="ml-2">
                      {(() => {
                        const dataLimiteDisplay = getDataLimiteDisplayForGestor(
                          cliente.data_venda || '', 
                          cliente.created_at, 
                          cliente.status_campanha || 'Cliente Novo'
                        )
                        return (
                          <Badge className={`${dataLimiteDisplay.classeCor} rounded-md text-xs`}>
                            {dataLimiteDisplay.texto}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="pt-2">
                    <TransferirModal
                      cliente={cliente}
                      onTransferirCliente={handleTransferirCliente}
                      isLoading={transferindoCliente === cliente.id}
                      gestores={gestores}
                    />
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
                <TableHead className="min-w-[150px] text-muted-foreground">Data Limite</TableHead>
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
                  <TableCell className="text-foreground text-sm">
                    {(() => {
                      console.log(`👨‍💼 [AdminTable] Aplicando visualização dinâmica para: ${cliente.nome_cliente}`)
                      
                      const dataLimiteDisplay = getDataLimiteDisplayForGestor(
                        cliente.data_venda || '', 
                        cliente.created_at, 
                        cliente.status_campanha || 'Cliente Novo'
                      )
                      
                      console.log(`👨‍💼 [AdminTable] Resultado da visualização:`, dataLimiteDisplay)
                      
                      return (
                        <Badge className={`${dataLimiteDisplay.classeCor} rounded-md`}>
                          {dataLimiteDisplay.texto}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <TransferirModal
                      cliente={cliente}
                      onTransferirCliente={handleTransferirCliente}
                      isLoading={transferindoCliente === cliente.id}
                      gestores={gestores}
                    />
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
  )
}
