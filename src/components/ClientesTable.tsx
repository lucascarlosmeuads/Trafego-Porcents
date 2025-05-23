
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Download, Search, Filter } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusOptions = ['Planejamento', 'Brief', 'Criativo', 'No Ar']

export function ClientesTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [user])

  useEffect(() => {
    filterClientes()
  }, [clientes, searchTerm, statusFilter])

  const fetchClientes = async () => {
    if (!user) return

    try {
      let query = supabase.from('clientes').select('*')
      
      if (!isAdmin) {
        // Update to use email_gestor_responsavel which exists in the database
        query = query.eq('email_gestor_responsavel', user.email)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive"
        })
      } else {
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClientes = () => {
    let filtered = clientes

    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        (cliente.nome_cliente || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Modified to ignore 'all' value as requested
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(cliente => cliente.status_campanha === statusFilter)
    }

    setFilteredClientes(filtered)
  }

  const updateField = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        throw error
      }

      setClientes(prev => prev.map(cliente => 
        cliente.id === id ? { ...cliente, [field]: value } : cliente
      ))

      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso"
      })
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o campo",
        variant: "destructive"
      })
    }
  }

  const exportToCSV = () => {
    const headers = [
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 
      'Vendedor', 'Comissão', 'Email Gestor', 'Status Campanha', 'Data Limite', 
      'Data Subida', 'Link Grupo', 'Link Briefing', 'Link Criativo', 
      'Link Site', 'Número BM'
    ]

    const csvData = filteredClientes.map(cliente => [
      cliente.id,
      cliente.data_venda || '',
      cliente.nome_cliente || '',
      cliente.telefone || '',
      cliente.email_cliente || '',
      cliente.nome_vendedor || '',
      cliente.comissao || '',
      cliente.email_gestor_responsavel || '',
      cliente.status_campanha || '',
      cliente.data_limite || '',
      cliente.data_subida || '',
      cliente.link_grupo || '',
      cliente.link_reuniao_1 || '', 
      cliente.link_reuniao_2 || '', 
      cliente.link_reuniao_3 || '', 
      cliente.bm_identificacao || '' 
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clientes</span>
          <Button onClick={exportToCSV} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar por nome do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Venda</TableHead>
                <TableHead>Nome Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Email Gestor</TableHead>
                <TableHead>Status Campanha</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Data Subida</TableHead>
                <TableHead>Link Grupo</TableHead>
                <TableHead>Link Briefing</TableHead>
                <TableHead>Link Criativo</TableHead>
                <TableHead>Link Site</TableHead>
                <TableHead>Número BM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.data_venda ? new Date(cliente.data_venda).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell className="font-medium">{cliente.nome_cliente || '-'}</TableCell>
                    <TableCell>{cliente.telefone || '-'}</TableCell>
                    <TableCell>{cliente.email_cliente || '-'}</TableCell>
                    <TableCell>{cliente.nome_vendedor || '-'}</TableCell>
                    <TableCell>{cliente.comissao || '-'}</TableCell>
                    <TableCell>{cliente.email_gestor_responsavel || '-'}</TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'status_campanha' ? (
                        <Select
                          value={cliente.status_campanha || ''}
                          onValueChange={(value) => {
                            updateField(cliente.id, 'status_campanha', value)
                            setEditingCell(null)
                          }}
                          onOpenChange={(open) => !open && setEditingCell(null)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'status_campanha'})}
                          className="h-auto p-1 font-normal justify-start"
                        >
                          {cliente.status_campanha || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{cliente.data_limite ? new Date(cliente.data_limite).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>{cliente.data_subida ? new Date(cliente.data_subida).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'link_grupo' ? (
                        <Input
                          value={cliente.link_grupo || ''}
                          onChange={(e) => updateField(cliente.id, 'link_grupo', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'link_grupo'})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {cliente.link_grupo || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'link_reuniao_1' ? (
                        <Input
                          value={cliente.link_reuniao_1 || ''}
                          onChange={(e) => updateField(cliente.id, 'link_reuniao_1', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'link_reuniao_1'})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {cliente.link_reuniao_1 || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'link_reuniao_2' ? (
                        <Input
                          value={cliente.link_reuniao_2 || ''}
                          onChange={(e) => updateField(cliente.id, 'link_reuniao_2', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'link_reuniao_2'})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {cliente.link_reuniao_2 || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'link_reuniao_3' ? (
                        <Input
                          value={cliente.link_reuniao_3 || ''}
                          onChange={(e) => updateField(cliente.id, 'link_reuniao_3', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'link_reuniao_3'})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {cliente.link_reuniao_3 || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCell?.id === cliente.id && editingCell?.field === 'bm_identificacao' ? (
                        <Input
                          value={cliente.bm_identificacao || ''}
                          onChange={(e) => updateField(cliente.id, 'bm_identificacao', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field: 'bm_identificacao'})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {cliente.bm_identificacao || 'Clique para editar'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
