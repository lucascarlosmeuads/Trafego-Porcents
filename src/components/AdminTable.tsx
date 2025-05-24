
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STATUS_CAMPANHA } from '@/lib/supabase'

export function AdminTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const { toast } = useToast()

  useEffect(() => {
    fetchAllClientes()
  }, [])

  const fetchAllClientes = async () => {
    console.log('Carregando todos os clientes...')
    try {
      const { data, error } = await supabase
        .from('clientes')
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
        console.log('Dados carregados:', data?.length || 0, 'registros')
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
    setSaving(`${id}-${field}`)
    try {
      const { error } = await supabase
        .from('clientes')
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
    } finally {
      setSaving(null)
      setEditingCell(null)
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
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

  const isDataLimiteVencida = (dataLimite: string) => {
    if (!dataLimite) return false
    const hoje = new Date()
    const limite = new Date(dataLimite)
    return hoje > limite
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'No Ar':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                    <span className="font-medium text-muted-foreground">Vendedor:</span>
                    <span className="ml-2 text-card-foreground">{cliente.vendedor || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha)}`}>
                      {cliente.status_campanha || 'Sem Status'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Data Venda:</span>
                    <span className="ml-2 text-card-foreground">{formatDate(cliente.data_venda)}</span>
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
                <TableHead className="w-20 text-muted-foreground">ID</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground">Email Cliente</TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground">Vendedor</TableHead>
                <TableHead className="min-w-[180px] text-muted-foreground">Email Gestor</TableHead>
                <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow 
                  key={cliente.id} 
                  className={`border-border hover:bg-muted/20 transition-colors ${
                    isDataLimiteVencida(cliente.data_limite) ? 'bg-red-500/10' : ''
                  }`}
                >
                  <TableCell className="font-mono text-xs text-foreground">{cliente.id}</TableCell>
                  <TableCell className="text-xs text-foreground">{formatDate(cliente.data_venda)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.nome_cliente}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{cliente.telefone}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.email_cliente}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate text-foreground">
                      {cliente.vendedor}
                    </div>
                  </TableCell>
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha)}`}>
                            {cliente.status_campanha || 'Selecionar Status'}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {STATUS_CAMPANHA.map(status => (
                          <SelectItem key={status} value={status}>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {saving === `${cliente.id}-status_campanha` && (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    )}
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
