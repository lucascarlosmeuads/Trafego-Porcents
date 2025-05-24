import { useState, useEffect } from 'react'
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
import { Download, Search, Filter, RefreshCw, Calendar, Edit2, ExternalLink, AlertTriangle, Check, X, Wifi, WifiOff } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { calculateDataLimite, getDataLimiteMensagem } from '@/utils/dateUtils'
import { checkRealtimeConnection } from '@/utils/realtimeUtils'

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
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  useEffect(() => {
    const checkConnection = () => {
      const connected = checkRealtimeConnection()
      setRealtimeConnected(connected)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

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

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return ''
    
    const numbersOnly = phone.replace(/\D/g, '')
    
    if (!numbersOnly.startsWith('55') && numbersOnly.length >= 10) {
      return `55${numbersOnly}`
    }
    
    return numbersOnly
  }

  const openWhatsApp = (phone: string) => {
    const formattedPhone = formatPhoneForWhatsApp(phone)
    if (formattedPhone) {
      window.open(`https://wa.me/${formattedPhone}`, '_blank')
    }
  }

  const openLink = (url: string) => {
    if (!url) return
    
    let formattedUrl = url.trim()
    
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }
    
    console.log(`🔗 Abrindo link: ${formattedUrl}`)
    window.open(formattedUrl, '_blank')
  }

  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    console.log(`🚀 === ALTERANDO STATUS ===`)
    console.log(`🆔 Cliente ID recebido: "${clienteId}" (tipo: ${typeof clienteId})`)
    console.log(`🎯 Novo Status: "${newStatus}"`)
    console.log(`👤 Manager: ${selectedManager}`)
    
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
          onClick={() => openLink(currentValue)}
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
        <span className="text-xs text-white">{currentValue}</span>
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

  const renderWhatsAppButton = (phone: string) => {
    if (!phone) {
      return <span className="text-white text-xs">-</span>
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:border-green-800 dark:text-green-300 dark:hover:text-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => openWhatsApp(phone)}
      >
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
        WhatsApp
      </Button>
    )
  }

  const renderDataLimite = (cliente: any) => {
    const dataLimiteCalculada = cliente.data_venda ? calculateDataLimite(cliente.data_venda) : cliente.data_limite
    
    if (!dataLimiteCalculada) {
      return <span className="text-white">-</span>
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
          <span className="text-center text-white">Carregando clientes de {selectedManager}...</span>
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
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-semibold text-white">Clientes - {selectedManager}</h2>
            <div className="flex items-center gap-1">
              {realtimeConnected ? (
                <Wifi className="w-4 h-4 text-green-500" title="Conexão realtime ativa" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" title="Conexão realtime inativa" />
              )}
              <span className="text-xs text-gray-400">
                {realtimeConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300">{filteredClientes.length} clientes encontrados</p>
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

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-white"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background border-border text-white">
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

      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <Table className="table-dark">
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/20 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
                <TableHead className="w-16 text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-300">#</span>
                    <span>ID</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>Data Venda</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Nome Cliente</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>Telefone</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[180px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>Status Campanha</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>Data Limite</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    <span>Grupo</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    <span>Briefing</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                    <span>Criativo</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-orange-400" />
                    <span>Site</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Número BM</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">R$</span>
                    <span>Comissão</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/20">
                  <TableCell colSpan={12} className="text-center py-8 text-white">
                    Nenhum cliente encontrado para {selectedManager}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente, index) => {
                  const clienteId = String(cliente.id || '')
                  
                  if (!clienteId || clienteId.trim() === '' || clienteId === 'undefined') {
                    console.warn(`⚠️ Cliente ${index + 1} tem ID completamente inválido, não será renderizado:`, cliente)
                    return null
                  }

                  return (
                    <TableRow 
                      key={`${selectedManager}-${clienteId}-${index}`}
                      className="border-border hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="font-mono text-xs">
                        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30 rounded px-2 py-1 shadow-sm">
                          <span className="text-slate-400 mr-1">#</span>
                          <span className="text-white font-medium">{clienteId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-white">{cliente.data_venda || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate text-white">
                          {cliente.nome_cliente || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderWhatsAppButton(cliente.telefone)}
                      </TableCell>
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
                          <SelectTrigger className="h-8 w-48 bg-background border-border text-white z-[400]">
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
