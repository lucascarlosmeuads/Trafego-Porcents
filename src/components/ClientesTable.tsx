
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [user])

  useEffect(() => {
    filterClientes()
  }, [clientes, searchTerm, statusFilter])

  const fetchClientes = async () => {
    if (!user) {
      console.log('Usuário não autenticado')
      setLoading(false)
      return
    }

    try {
      console.log('Iniciando busca de clientes...')
      console.log('Usuário:', user.email)
      console.log('É admin:', isAdmin)

      // Primeiro, tenta buscar todos os dados sem filtro para diagnóstico
      const { data: allData, error: allError } = await supabase
        .from('clientes')
        .select('*')

      console.log('Todos os dados na tabela:', allData)
      console.log('Erro ao buscar todos os dados:', allError)

      // Agora faz a busca com filtro se não for admin
      let query = supabase.from('clientes').select('*')
      
      if (!isAdmin) {
        query = query.eq('email_gestor_responsavel', user.email)
        console.log('Filtrando por email_gestor_responsavel:', user.email)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      console.log('Dados filtrados:', data)
      console.log('Erro na consulta filtrada:', error)

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Não foi possível carregar os dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        console.log('Dados carregados com sucesso:', data?.length || 0, 'registros')
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterClientes = () => {
    let filtered = clientes

    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        (cliente.nome_cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email_cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.nome_vendedor || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(cliente => cliente.status_campanha === statusFilter)
    }

    setFilteredClientes(filtered)
  }

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({id, field})
    setEditValue(currentValue || '')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const saveEdit = async () => {
    if (!editingCell) return

    try {
      const { error } = await supabase
        .from('clientes')
        .update({ [editingCell.field]: editValue })
        .eq('id', editingCell.id)

      if (error) {
        throw error
      }

      setClientes(prev => prev.map(cliente => 
        cliente.id === editingCell.id 
          ? { ...cliente, [editingCell.field]: editValue } 
          : cliente
      ))

      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso"
      })

      setEditingCell(null)
      setEditValue('')
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o campo",
        variant: "destructive"
      })
    }
  }

  const updateFieldQuick = async (id: string, field: string, value: string) => {
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
      cliente.data_subida_campanha || '',
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

  const renderEditableCell = (cliente: Cliente, field: string, value: string, isSelect: boolean = false) => {
    if (editingCell?.id === cliente.id && editingCell?.field === field) {
      if (isSelect) {
        return (
          <Select
            value={editValue}
            onValueChange={(newValue) => {
              setEditValue(newValue)
              updateFieldQuick(cliente.id, field, newValue)
              setEditingCell(null)
            }}
            onOpenChange={(open) => !open && cancelEdit()}
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
        )
      } else {
        return (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            autoFocus
            className="w-32"
          />
        )
      }
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => startEdit(cliente.id, field, value)}
        className="h-auto p-1 font-normal justify-start text-left max-w-32 truncate"
      >
        {value || 'Clique para editar'}
      </Button>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clientes ({filteredClientes.length})</span>
          <div className="flex gap-2">
            <Button onClick={fetchClientes} variant="outline" size="sm">
              Recarregar Dados
            </Button>
            <Button onClick={exportToCSV} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou vendedor..."
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
        {clientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum dado encontrado na tabela.</p>
            <p className="text-sm text-gray-400 mb-4">
              Isso pode acontecer se:
            </p>
            <ul className="text-sm text-gray-400 text-left max-w-md mx-auto mb-4">
              <li>• A tabela estiver vazia</li>
              <li>• Há problemas com as políticas de segurança (RLS)</li>
              <li>• Seu usuário não tem permissão para ver os dados</li>
            </ul>
            <Button onClick={fetchClientes} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Data Venda</TableHead>
                  <TableHead className="min-w-[150px]">Nome Cliente</TableHead>
                  <TableHead className="min-w-[120px]">Telefone</TableHead>
                  <TableHead className="min-w-[180px]">Email Cliente</TableHead>
                  <TableHead className="min-w-[120px]">Vendedor</TableHead>
                  <TableHead className="min-w-[100px]">Comissão</TableHead>
                  <TableHead className="min-w-[180px]">Email Gestor</TableHead>
                  <TableHead className="min-w-[120px]">Status Campanha</TableHead>
                  <TableHead className="min-w-[100px]">Data Limite</TableHead>
                  <TableHead className="min-w-[100px]">Data Subida</TableHead>
                  <TableHead className="min-w-[120px]">Link Grupo</TableHead>
                  <TableHead className="min-w-[120px]">Link Briefing</TableHead>
                  <TableHead className="min-w-[120px]">Link Criativo</TableHead>
                  <TableHead className="min-w-[120px]">Link Site</TableHead>
                  <TableHead className="min-w-[100px]">Número BM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        {cliente.data_venda ? new Date(cliente.data_venda).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cliente.nome_cliente || '-'}
                      </TableCell>
                      <TableCell>{cliente.telefone || '-'}</TableCell>
                      <TableCell>{cliente.email_cliente || '-'}</TableCell>
                      <TableCell>{cliente.nome_vendedor || '-'}</TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'comissao', cliente.comissao || '')}
                      </TableCell>
                      <TableCell>{cliente.email_gestor_responsavel || '-'}</TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'status_campanha', cliente.status_campanha || '', true)}
                      </TableCell>
                      <TableCell>
                        {cliente.data_limite || '-'}
                      </TableCell>
                      <TableCell>
                        {cliente.data_subida_campanha || '-'}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'link_grupo', cliente.link_grupo || '')}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'link_reuniao_1', cliente.link_reuniao_1 || '')}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'link_reuniao_2', cliente.link_reuniao_2 || '')}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'link_reuniao_3', cliente.link_reuniao_3 || '')}
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'bm_identificacao', cliente.bm_identificacao || '')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                      Nenhum cliente encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
