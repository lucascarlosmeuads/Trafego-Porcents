
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Search, Filter, RefreshCw, Calendar, Edit2, Eye, EyeOff } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

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
        <div className="flex gap-1 min-w-[120px]">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs bg-background border-border"
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
        className="editable-cell cursor-pointer p-1 rounded min-h-[20px] flex items-center gap-1 group"
        onClick={() => handleCellEdit(cliente.id, field, value)}
      >
        <span className="truncate flex-1 text-foreground">{value || '-'}</span>
        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity text-muted-foreground" />
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
      <div className="flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-center text-foreground">Carregando clientes de {selectedManager}...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 lg:p-0">
      {/* Header responsivo */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Clientes - {selectedManager}</h2>
          <p className="text-sm text-muted-foreground">{filteredClientes.length} clientes encontrados</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={refetch} variant="outline" size="sm" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none lg:hidden"
          >
            {viewMode === 'table' ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {viewMode === 'table' ? 'Cartões' : 'Tabela'}
          </Button>
        </div>
      </div>

      {/* Filtros responsivos */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome, email, telefone ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status da campanha" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Em andamento">Em andamento</SelectItem>
            <SelectItem value="Concluída">Concluída</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visualização em cartões para mobile */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2 lg:hidden">
          {filteredClientes.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado para {selectedManager}
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="w-full bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between text-card-foreground">
                    <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                    <Badge variant={
                      cliente.status_campanha === 'Concluída' ? 'default' :
                      cliente.status_campanha === 'Em andamento' ? 'secondary' :
                      cliente.status_campanha === 'Cancelada' ? 'destructive' : 'outline'
                    }>
                      {cliente.status_campanha || 'Pendente'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Telefone:</span>
                      <span className="ml-2 text-card-foreground">{cliente.telefone || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <span className="ml-2 truncate block text-card-foreground">{cliente.email_cliente || '-'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Vendedor:</span>
                      <div className="mt-1">
                        {renderEditableCell(cliente, 'nome_vendedor', cliente.nome_vendedor || '')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Data Venda:</span>
                      <span className="ml-2 flex items-center text-card-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {cliente.data_venda || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Comissão:</span>
                      <div className="mt-1">
                        {renderEditableCell(cliente, 'comissao', cliente.comissao || '')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tabela para desktop */}
      <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
        <div className="border rounded-lg overflow-hidden bg-card border-border">
          <div className="overflow-x-auto">
            <Table className="table-dark">
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/20">
                  <TableHead className="w-[100px] min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                  <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                  <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
                  <TableHead className="min-w-[200px] hidden sm:table-cell text-muted-foreground">Email Cliente</TableHead>
                  <TableHead className="min-w-[150px] text-muted-foreground">Vendedor</TableHead>
                  <TableHead className="min-w-[180px] hidden md:table-cell text-muted-foreground">Email Gestor</TableHead>
                  <TableHead className="min-w-[130px] text-muted-foreground">Status</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell text-muted-foreground">Data Limite</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell text-muted-foreground">Data Subida</TableHead>
                  <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Grupo</TableHead>
                  <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Briefing</TableHead>
                  <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Criativo</TableHead>
                  <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Site</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell text-muted-foreground">BM ID</TableHead>
                  <TableHead className="min-w-[100px] text-muted-foreground">Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length === 0 ? (
                  <TableRow className="border-border hover:bg-muted/20">
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado para {selectedManager}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="border-border hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-foreground">{cliente.data_venda || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate text-foreground">
                          {cliente.nome_cliente || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate text-foreground">
                          {cliente.telefone || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="max-w-[200px] truncate text-foreground">
                          {cliente.email_cliente || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderEditableCell(cliente, 'nome_vendedor', cliente.nome_vendedor || '')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderEditableCell(cliente, 'email_gestor_responsavel', cliente.email_gestor_responsavel || '')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          cliente.status_campanha === 'Concluída' ? 'default' :
                          cliente.status_campanha === 'Em andamento' ? 'secondary' :
                          cliente.status_campanha === 'Cancelada' ? 'destructive' : 'outline'
                        } className="text-xs">
                          {cliente.status_campanha || 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-foreground">
                        {cliente.data_limite || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-foreground">
                        {cliente.data_subida_campanha || '-'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {renderEditableCell(cliente, 'link_grupo', cliente.link_grupo || '')}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {renderEditableCell(cliente, 'link_reuniao_1', cliente.link_reuniao_1 || '')}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {renderEditableCell(cliente, 'link_reuniao_2', cliente.link_reuniao_2 || '')}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {renderEditableCell(cliente, 'link_reuniao_3', cliente.link_reuniao_3 || '')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
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
      </div>

      {/* Informação sobre edição */}
      <div className="text-xs text-muted-foreground mt-4 text-center lg:text-left">
        💡 Clique em qualquer campo editável para modificar os dados
      </div>
    </div>
  )
}
