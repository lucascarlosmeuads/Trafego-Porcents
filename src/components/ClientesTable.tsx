
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
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Search, Filter, RefreshCw, Calendar, Edit2, ExternalLink, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'

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
      cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const isDataLimiteVencida = (dataLimite: string) => {
    if (!dataLimite) return false
    const hoje = new Date()
    const limite = new Date(dataLimite)
    return hoje > limite
  }

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

  const handleCheckboxChange = async (clienteId: string, checked: boolean) => {
    const success = await updateCliente(clienteId, 'comissao_paga', checked)
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Status da comissão atualizado",
      })
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da comissão",
        variant: "destructive",
      })
    }
  }

  const renderEditableCell = (cliente: any, field: string, value: string) => {
    const isEditing = editingCell?.id === cliente.id && editingCell?.field === field

    if (isEditing) {
      if (field === 'status_campanha') {
        return (
          <Select value={editValue} onValueChange={(newValue) => {
            updateCliente(cliente.id, field, newValue)
            setEditingCell(null)
          }}>
            <SelectTrigger className="h-8 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {STATUS_CAMPANHA.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

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

  const renderLinkButton = (url: string, label: string) => {
    if (!url) return <span className="text-muted-foreground">-</span>
    
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => window.open(url, '_blank')}
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        Ver
      </Button>
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
      'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor',
      'Email Gestor', 'Status Campanha', 'Data Venda', 'Data Limite',
      'Link Grupo', 'Link Briefing', 'Link Criativo', 'Link Site', 
      'Número BM', 'Comissão Paga', 'Valor Comissão'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredClientes.map(cliente => [
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.data_venda || '',
        cliente.data_limite || '',
        cliente.link_grupo || '',
        cliente.link_briefing || '', 
        cliente.link_criativo || '', 
        cliente.link_site || '', 
        cliente.numero_bm || '',
        cliente.comissao_paga ? 'Pago' : 'Não Pago',
        `R$ ${cliente.valor_comissao?.toFixed(2) || '60,00'}`
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
            {STATUS_CAMPANHA.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <Table className="table-dark">
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/20">
                <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
                <TableHead className="min-w-[200px] hidden sm:table-cell text-muted-foreground">Email Cliente</TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground">Vendedor</TableHead>
                <TableHead className="min-w-[180px] hidden md:table-cell text-muted-foreground">Email Gestor</TableHead>
                <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Data Limite</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Grupo</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Briefing</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Criativo</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Site</TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell text-muted-foreground">Número BM</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Comissão</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Valor</TableHead>
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
                  <TableRow 
                    key={cliente.id} 
                    className={`border-border hover:bg-muted/10 transition-colors ${
                      isDataLimiteVencida(cliente.data_limite) ? 'bg-red-500/10' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate text-foreground">
                        {cliente.nome_cliente || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(cliente, 'telefone', cliente.telefone || '')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {renderEditableCell(cliente, 'email_cliente', cliente.email_cliente || '')}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(cliente, 'vendedor', cliente.vendedor || '')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {renderEditableCell(cliente, 'email_gestor', cliente.email_gestor || '')}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(cliente, 'status_campanha', cliente.status_campanha || '')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">{cliente.data_venda || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className={isDataLimiteVencida(cliente.data_limite) ? 'bg-red-500/20' : ''}>
                      <div className="flex items-center gap-1">
                        {isDataLimiteVencida(cliente.data_limite) && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs text-foreground">{cliente.data_limite || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {renderLinkButton(cliente.link_grupo, 'Grupo')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {renderLinkButton(cliente.link_briefing, 'Briefing')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {renderLinkButton(cliente.link_criativo, 'Criativo')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {renderLinkButton(cliente.link_site, 'Site')}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {renderEditableCell(cliente, 'numero_bm', cliente.numero_bm || '')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={cliente.comissao_paga || false}
                          onCheckedChange={(checked) => handleCheckboxChange(cliente.id, !!checked)}
                        />
                        <span className="text-xs">
                          {cliente.comissao_paga ? 'Pago' : 'Não Pago'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        R$ {cliente.valor_comissao?.toFixed(2) || '60,00'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Informação sobre edição */}
      <div className="text-xs text-muted-foreground mt-4 text-center lg:text-left">
        💡 Clique em qualquer campo editável para modificar os dados
      </div>
    </div>
  )
}
