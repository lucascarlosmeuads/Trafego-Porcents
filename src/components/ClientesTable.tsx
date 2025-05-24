
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
import { Download, Search, Filter, RefreshCw, Calendar, Edit2, ExternalLink, AlertTriangle, Check, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { calculateDataLimite, getDataLimiteMensagem } from '@/utils/dateUtils'

interface ClientesTableProps {
  selectedManager: string
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const { isAdmin } = useAuth()
  const { clientes, loading, error, updateCliente, refetch } = useManagerData(selectedManager)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
      case 'No Ar':
        return 'bg-green-500/20 text-green-700 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    console.log(`🚀 === ALTERANDO STATUS ===`)
    console.log(`🆔 Cliente ID recebido: "${clienteId}" (tipo: ${typeof clienteId})`)
    console.log(`🎯 Novo Status: "${newStatus}"`)
    console.log(`👤 Manager: ${selectedManager}`)
    
    // VALIDAÇÃO DO ID
    if (!clienteId || clienteId.trim() === '') {
      console.error('❌ ERRO CRÍTICO: ID do cliente está vazio ou inválido:', clienteId)
      toast({
        title: "Erro Crítico",
        description: "ID do cliente não encontrado. Verifique os dados do registro.",
        variant: "destructive",
      })
      return
    }

    const numericId = parseInt(clienteId)
    if (isNaN(numericId) || numericId <= 0) {
      console.error('❌ ERRO CRÍTICO: ID não é um número válido:', { clienteId, numericId })
      toast({
        title: "Erro Crítico",
        description: "ID do cliente tem formato inválido.",
        variant: "destructive",
      })
      return
    }

    if (!newStatus || newStatus.trim() === '') {
      console.error('❌ Novo status está vazio ou inválido:', newStatus)
      toast({
        title: "Erro",
        description: "Status inválido",
        variant: "destructive",
      })
      return
    }

    // Verificar se o cliente existe na lista local
    const clienteAtual = clientes.find(c => c.id === clienteId)
    if (!clienteAtual) {
      console.error('❌ Cliente não encontrado na lista local:', clienteId)
      console.log('📋 Clientes disponíveis:', clientes.map(c => ({ id: c.id, nome: c.nome_cliente })))
      toast({
        title: "Erro",
        description: "Cliente não encontrado na lista local",
        variant: "destructive",
      })
      return
    }

    console.log(`📋 Cliente encontrado na lista local:`, {
      id: clienteAtual.id,
      nome: clienteAtual.nome_cliente,
      statusAtual: clienteAtual.status_campanha,
      clienteCompleto: clienteAtual
    })
    
    setUpdatingStatus(clienteId)
    
    try {
      console.log('🔄 Iniciando atualização via updateCliente...')
      const success = await updateCliente(clienteId, 'status_campanha', newStatus)
      
      if (success) {
        console.log('✅ Status atualizado com sucesso!')
        toast({
          title: "Sucesso",
          description: `Status alterado para: ${newStatus}`,
        })
      } else {
        console.error('❌ Falha ao atualizar status - função retornou false')
        toast({
          title: "Erro",
          description: "Falha ao atualizar status. Verifique os logs do console para mais detalhes.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('💥 Erro na atualização (catch):', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue || '')
  }

  const handleLinkSave = async (clienteId: string, field: string) => {
    try {
      const success = await updateCliente(clienteId, field, linkValue)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Link atualizado com sucesso",
        })
        setEditingLink(null)
        setLinkValue('')
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar link",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar link",
        variant: "destructive",
      })
    }
  }

  const handleLinkCancel = () => {
    setEditingLink(null)
    setLinkValue('')
  }

  const handleBMEdit = (clienteId: string, currentValue: string) => {
    setEditingBM(clienteId)
    setBmValue(currentValue || '')
  }

  const handleBMSave = async (clienteId: string) => {
    try {
      const success = await updateCliente(clienteId, 'numero_bm', bmValue)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Número BM atualizado com sucesso",
        })
        setEditingBM(null)
        setBmValue('')
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar número BM",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar BM:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar número BM",
        variant: "destructive",
      })
    }
  }

  const handleBMCancel = () => {
    setEditingBM(null)
    setBmValue('')
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Já está pago, não fazer nada
      return
    }

    setUpdatingComission(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'comissao_paga', true)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Comissão marcada como paga",
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar comissão",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar comissão",
        variant: "destructive",
      })
    } finally {
      setUpdatingComission(null)
    }
  }

  const renderLinkField = (cliente: any, field: string, label: string) => {
    const clienteId = String(cliente.id || '')
    const currentValue = cliente[field]
    const isEditing = editingLink?.clienteId === clienteId && editingLink?.field === field

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="Cole o link aqui..."
            className="h-6 text-xs px-2"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleLinkSave(clienteId, field)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleLinkCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    if (!currentValue) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => handleLinkEdit(clienteId, field, currentValue)}
        >
          Adicionar link
        </Button>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => window.open(currentValue, '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={() => handleLinkEdit(clienteId, field, currentValue)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  const renderBMField = (cliente: any) => {
    const clienteId = String(cliente.id || '')
    const currentValue = cliente.numero_bm
    const isEditing = editingBM === clienteId

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px]">
          <Input
            value={bmValue}
            onChange={(e) => setBmValue(e.target.value)}
            placeholder="Número BM..."
            className="h-6 text-xs px-2"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleBMSave(clienteId)}
          >
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleBMCancel}
          >
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      )
    }

    if (!currentValue) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => handleBMEdit(clienteId, currentValue)}
        >
          Adicionar número
        </Button>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground">{currentValue}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={() => handleBMEdit(clienteId, currentValue)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  const renderComissionField = (cliente: any) => {
    const clienteId = String(cliente.id || '')
    const isPaid = cliente.comissao_paga
    const isUpdating = updatingComission === clienteId

    if (isPaid) {
      return (
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-xs text-green-600 font-medium">R$ 60,00</span>
        </div>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => handleComissionToggle(clienteId, isPaid)}
        disabled={isUpdating}
      >
        {isUpdating && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
        Não Pago
      </Button>
    )
  }

  const renderDataLimite = (cliente: any) => {
    // Calcula a data limite baseada na data de venda
    const dataLimiteCalculada = cliente.data_venda ? calculateDataLimite(cliente.data_venda) : cliente.data_limite
    
    if (!dataLimiteCalculada) {
      return <span className="text-muted-foreground">-</span>
    }
    
    const { texto, estilo } = getDataLimiteMensagem(dataLimiteCalculada, cliente.status_campanha)
    
    return (
      <span className={estilo}>
        {texto}
      </span>
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
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor',
      'Email Gestor', 'Status Campanha', 'Data Limite',
      'Link Grupo', 'Link Briefing', 'Link Criativo', 'Link Site', 
      'Número BM', 'Comissão Paga'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredClientes.map(cliente => [
        cliente.id || '',
        cliente.data_venda || '',
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.data_limite || '',
        cliente.link_grupo || '',
        cliente.link_briefing || '', 
        cliente.link_criativo || '', 
        cliente.link_site || '', 
        cliente.numero_bm || '',
        cliente.comissao_paga ? 'Pago - R$ 60,00' : 'Não Pago'
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
            placeholder="Pesquisar por nome, telefone..."
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
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
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
                <TableHead className="w-16 text-muted-foreground">ID</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground">Telefone</TableHead>
                <TableHead className="min-w-[180px] text-muted-foreground">Status Campanha</TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground">Data Limite</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Grupo</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Briefing</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Criativo</TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-muted-foreground">Site</TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell text-muted-foreground">Número BM</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/20">
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado para {selectedManager}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente, index) => {
                  const clienteId = String(cliente.id || '')
                  
                  // Não renderizar se não tiver ID válido
                  if (!clienteId || clienteId.trim() === '' || clienteId === 'undefined') {
                    console.warn(`⚠️ Cliente ${index + 1} tem ID completamente inválido, não será renderizado:`, cliente)
                    return null
                  }

                  return (
                    <TableRow 
                      key={`${selectedManager}-${clienteId}-${index}`}
                      className="border-border hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-foreground">
                        {clienteId}
                      </TableCell>
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
                      <TableCell className="text-foreground">{cliente.telefone || '-'}</TableCell>
                      <TableCell>
                        <Select 
                          value={cliente.status_campanha || ''}
                          onValueChange={(value) => {
                            console.log(`🎯 Select onChange disparado:`, {
                              clienteId: clienteId,
                              novoStatus: value,
                              clienteOriginal: cliente
                            })
                            
                            if (!clienteId || clienteId.trim() === '') {
                              console.error('❌ ERRO: ID inválido no onChange:', clienteId)
                              toast({
                                title: "Erro",
                                description: "ID do cliente inválido",
                                variant: "destructive",
                              })
                              return
                            }
                            
                            handleStatusChange(clienteId, value)
                          }}
                          disabled={updatingStatus === clienteId}
                        >
                          <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground z-[400]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {updatingStatus === clienteId && (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cliente.status_campanha || '')}`}>
                                  {cliente.status_campanha || 'Selecionar Status'}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border z-[500]">
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
                        {renderDataLimite(cliente)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {renderLinkField(cliente, 'link_grupo', 'Grupo')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {renderLinkField(cliente, 'link_briefing', 'Briefing')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {renderLinkField(cliente, 'link_criativo', 'Criativo')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {renderLinkField(cliente, 'link_site', 'Site')}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {renderBMField(cliente)}
                      </TableCell>
                      <TableCell>
                        {renderComissionField(cliente)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
