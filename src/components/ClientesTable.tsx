
import { useState } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Search, Filter, RefreshCw, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ClientesTableProps {
  selectedManager: string
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const { isAdmin } = useAuth()
  const { clientes, loading, error, updateCliente, refetch } = useManagerData(selectedManager)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState('')

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.nome_vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCellEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingCell({ id: clienteId, field })
    setEditValue(currentValue)
  }

  const handleSaveEdit = async () => {
    if (!editingCell) return

    const success = await updateCliente(editingCell.id, editingCell.field, editValue)
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      })
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      })
    }
    
    setEditingCell(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const renderEditableCell = (cliente: any, field: string, value: string) => {
    const isEditing = editingCell?.id === cliente.id && editingCell?.field === field

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit()
              if (e.key === 'Escape') handleCancelEdit()
            }}
            autoFocus
          />
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[20px]"
        onClick={() => handleCellEdit(cliente.id, field, value)}
      >
        {value || '-'}
      </div>
    )
  }

  const exportToCSV = () => {
    if (filteredClientes.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum cliente para exportar",
      })
      return
    }

    const headers = [
      'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor',
      'Email Gestor', 'Status Campanha', 'Data Limite', 'Data Subida',
      'Link Grupo', 'Link Briefing', 'Link Criativo', 'Link Site', 'BM', 'Comissão'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredClientes.map(cliente => [
        cliente.data_venda || '',
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.nome_vendedor || '',
        cliente.email_gestor_responsavel || '',
        cliente.status_campanha || '',
        cliente.data_limite || '',
        cliente.data_subida_campanha || '',
        cliente.link_grupo || '',
        cliente.link_reuniao_1 || '', 
        cliente.link_reuniao_2 || '', 
        cliente.link_reuniao_3 || '', 
        cliente.bm_identificacao || '',
        cliente.comissao || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_${selectedManager.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Carregando clientes de {selectedManager}...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com título e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Clientes - {selectedManager}</h2>
          <p className="text-sm text-gray-600">{filteredClientes.length} clientes encontrados</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome, email, telefone ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status da campanha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Em andamento">Em andamento</SelectItem>
            <SelectItem value="Concluída">Concluída</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Data Venda</TableHead>
                <TableHead className="min-w-[200px]">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px]">Telefone</TableHead>
                <TableHead className="min-w-[200px]">Email Cliente</TableHead>
                <TableHead className="min-w-[150px]">Vendedor</TableHead>
                <TableHead className="min-w-[180px]">Email Gestor</TableHead>
                <TableHead className="min-w-[130px]">Status Campanha</TableHead>
                <TableHead className="min-w-[100px]">Data Limite</TableHead>
                <TableHead className="min-w-[100px]">Data Subida</TableHead>
                <TableHead className="min-w-[200px]">Link Grupo</TableHead>
                <TableHead className="min-w-[200px]">Link Briefing</TableHead>
                <TableHead className="min-w-[200px]">Link Criativo</TableHead>
                <TableHead className="min-w-[200px]">Link Site</TableHead>
                <TableHead className="min-w-[120px]">BM ID</TableHead>
                <TableHead className="min-w-[100px]">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                    Nenhum cliente encontrado para {selectedManager}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {cliente.data_venda || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {cliente.nome_cliente || '-'}
                    </TableCell>
                    <TableCell>{cliente.telefone || '-'}</TableCell>
                    <TableCell>{cliente.email_cliente || '-'}</TableCell>
                    <TableCell>
                      {renderEditableCell(cliente, 'nome_vendedor', cliente.nome_vendedor || '')}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(cliente, 'email_gestor_responsavel', cliente.email_gestor_responsavel || '')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        cliente.status_campanha === 'Concluída' ? 'default' :
                        cliente.status_campanha === 'Em andamento' ? 'secondary' :
                        cliente.status_campanha === 'Cancelada' ? 'destructive' : 'outline'
                      }>
                        {cliente.status_campanha || 'Pendente'}
                      </Badge>
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
                    <TableCell>
                      {renderEditableCell(cliente, 'comissao', cliente.comissao || '')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Informação sobre edição */}
      <div className="text-xs text-gray-500 mt-4">
        💡 Clique em qualquer campo editável para modificar os dados
      </div>
    </div>
  )
}
