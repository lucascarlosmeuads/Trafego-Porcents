import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { useSitePagoUpdate } from '@/hooks/useSitePagoUpdate'
import { supabase } from '@/lib/supabase'
import { RefreshCw, ChevronDown, ChevronUp, Sparkles, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { checkRealtimeConnection } from '@/utils/realtimeUtils'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableActions } from './ClientesTable/TableActions'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { AddClientModal } from './ClientesTable/AddClientModal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ClientesTableProps {
  selectedManager?: string
  userEmail?: string
  filterType?: 'ativos' | 'inativos' | 'problemas' | 'sites-pendentes' | 'sites-finalizados'
}

export function ClientesTable({ selectedManager, userEmail, filterType }: ClientesTableProps) {
  const { isAdmin, user } = useAuth()
  
  const emailToUse = userEmail || user?.email || ''
  
  const isSitesContext = filterType === 'sites-pendentes' || 
                        filterType === 'sites-finalizados' ||
                        emailToUse.includes('criador') || 
                        emailToUse.includes('site') || 
                        emailToUse.includes('webdesign')
  
  const showSitePagoCheckbox = isAdmin || isSitesContext
  
  console.log('🔍 [ClientesTable] Configuração de acesso:', {
    isAdmin,
    emailToUse,
    selectedManager,
    userEmail: user?.email,
    filterType,
    isSitesContext,
    showSitePagoCheckbox
  })
  
  const managerForQuery = isSitesContext ? undefined : selectedManager
  
  const { clientes, loading, error, updateCliente, addCliente, refetch, currentManager, setClientes } = useManagerData(
    emailToUse, 
    isAdmin, 
    managerForQuery,
    filterType === 'sites-pendentes' ? 'sites-pendentes' : 
    filterType === 'sites-finalizados' ? 'sites-finalizados' : undefined
  )

  const { handleSitePagoChange } = useSitePagoUpdate(clientes, setClientes)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')
  const [creativoFilter, setCreativoFilter] = useState('all')
  const [bmFilter, setBmFilter] = useState('all')
  const [clientesComCriativos, setClientesComCriativos] = useState<Set<string>>(new Set())
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [podeAdicionarCliente, setPodeAdicionarCliente] = useState(false)
  const [loadingPermissoes, setLoadingPermissoes] = useState(true)
  const [addingClient, setAddingClient] = useState(false)
  const [bannerExpanded, setBannerExpanded] = useState(true)

  const [bannerMelhoriasExpanded, setBannerMelhoriasExpanded] = useState(false)
  const [bannerProdutividadeExpanded, setBannerProdutividadeExpanded] = useState(false)

  const fetchClientesComCriativos = async () => {
    try {
      console.log('🎨 [ClientesTable] Buscando clientes com criativos do gestor...')
      
      const { data: arquivos, error } = await supabase
        .from('arquivos_cliente')
        .select('email_cliente')
        .eq('author_type', 'gestor')
      
      if (error) {
        console.error('❌ [ClientesTable] Erro ao buscar arquivos:', error)
        return
      }
      
      const emailsComCriativos = new Set(arquivos?.map(arquivo => arquivo.email_cliente) || [])
      
      console.log('✅ [ClientesTable] Clientes com criativos encontrados:', emailsComCriativos.size)
      setClientesComCriativos(emailsComCriativos)
      
    } catch (error) {
      console.error('💥 [ClientesTable] Erro inesperado ao buscar criativos:', error)
    }
  }

  useEffect(() => {
    if (clientes.length > 0) {
      fetchClientesComCriativos()
    }
  }, [clientes])

  const categorizarClientes = (clientesList: typeof clientes) => {
    console.log('📊 [ClientesTable] === CATEGORIZANDO CLIENTES (VERSÃO FINAL - SEM SAQUES PENDENTES) ===')
    console.log('📊 [ClientesTable] Total de clientes recebidos:', clientesList.length)
    
    const statusInativos = [
      'Cliente Sumiu',
      'Reembolso', 
      'Cancelado',
      'Cancelamento',
      'Inativo',
      'Off',
      'Pausado',
      'Parado',
      'Finalizado',
      'Encerrado'
    ]
    
    const clientesAtivos = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return !statusInativos.includes(status)
    })
    
    const clientesInativos = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return statusInativos.includes(status)
    })
    
    const clientesProblemas = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return status === 'Problema'
    })
    
    const statusDistribution = clientesList.reduce((acc, cliente) => {
      const status = cliente.status_campanha || 'SEM_STATUS'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const uniqueStatuses = Object.keys(statusDistribution).sort()
    
    console.log('📊 [ClientesTable] Todos os status únicos encontrados (', uniqueStatuses.length, '):', uniqueStatuses)
    console.log('📊 [ClientesTable] Distribuição completa por status:', statusDistribution)
    console.log('📊 [ClientesTable] Contagem após categorização FINAL (sem saques pendentes):')
    console.log('   ✅ Ativos (INCLUINDO "Saque Pendente" e "Campanha Anual"):', clientesAtivos.length)
    console.log('   ❌ Inativos:', clientesInativos.length)
    console.log('   ⚠️ Problemas (dentro dos ativos):', clientesProblemas.length)
    console.log('   🧮 Soma total:', clientesAtivos.length + clientesInativos.length)
    console.log('   🎯 Total esperado:', clientesList.length)
    
    console.log('📋 [ClientesTable] Status por categoria:')
    console.log('   ✅ Status ATIVOS (incluindo Saque Pendente e Campanha Anual):', 
      uniqueStatuses.filter(s => !statusInativos.includes(s))
    )
    console.log('   ❌ Status INATIVOS:', statusInativos.filter(s => uniqueStatuses.includes(s)))
    
    const totalCategorizado = clientesAtivos.length + clientesInativos.length
    if (totalCategorizado !== clientesList.length) {
      console.error('🚨 [ClientesTable] ERRO CRÍTICO: Clientes não categorizados encontrados!')
      console.error('🚨 [ClientesTable] Diferença:', clientesList.length - totalCategorizado, 'clientes')
      
      const clientesCategorizados = [...clientesAtivos, ...clientesInativos]
      const idsCategorizados = new Set(clientesCategorizados.map(c => c.id))
      const clientesOrfaos = clientesList.filter(c => !idsCategorizados.has(c.id))
      
      console.error('🚨 [ClientesTable] Clientes órfãos (não categorizados):')
      clientesOrfaos.forEach(cliente => {
        console.error(`   - ID: ${cliente.id}, Nome: ${cliente.nome_cliente}, Status: "${cliente.status_campanha}"`)
      })
      
      toast({
        title: "⚠️ Erro de Categorização",
        description: `${clientesOrfaos.length} clientes não foram categorizados. Verifique os logs.`,
        variant: "destructive"
      })
    } else {
      console.log('✅ [ClientesTable] SUCESSO: Todos os', clientesList.length, 'clientes foram categorizados corretamente!')
      console.log('🎯 [ClientesTable] ALTERAÇÃO IMPLEMENTADA:')
      console.log('   - "Saque Pendente" e "Campanha Anual" agora são ATIVOS')
      console.log('   - Não existe mais categoria "Saques Pendentes"')
      console.log('   - Total ativos:', clientesAtivos.length, '(incluindo', clientesProblemas.length, 'com problemas)')
    }
    
    return {
      clientesAtivos,
      clientesInativos,
      clientesProblemas,
      statusDistribution
    }
  }

  const getFilteredClientes = (clientesList: typeof clientes) => {
    return clientesList.filter(cliente => {
      const matchesSearch = 
        cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm) ||
        cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
      
      const matchesSiteStatus = siteStatusFilter === 'all' || cliente.site_status === siteStatusFilter
      
      let matchesCreativo = true
      if (creativoFilter === 'pendente') {
        matchesCreativo = !clientesComCriativos.has(cliente.email_cliente || '')
      } else if (creativoFilter === 'feito') {
        matchesCreativo = clientesComCriativos.has(cliente.email_cliente || '')
      }
      
      let matchesBm = true
      if (bmFilter === 'com_bm') {
        matchesBm = !!(cliente.numero_bm && cliente.numero_bm.trim() !== '')
      } else if (bmFilter === 'sem_bm') {
        matchesBm = !(cliente.numero_bm && cliente.numero_bm.trim() !== '')
      }
      
      return matchesSearch && matchesStatus && matchesSiteStatus && matchesCreativo && matchesBm
    })
  }

  const exportToCSV = () => {
    if (clientes.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum cliente para exportar",
      })
      return
    }

    const headers = [
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor',
      'Email Gestor', 'Status Campanha', 'Data Limite',
      'Link Briefing', 'Link Criativo', 'Link Site', 
      'Número BM', 'Comissão Paga'
    ]
    
    const csvContent = [
      headers.join(','),
      ...clientes.map(cliente => [
        cliente.id || '',
        cliente.data_venda || '',
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.data_limite || '',
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
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso",
    })
  }

  const getStatusColor = (status: string) => {
    if (!status || status.trim() === '') {
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
    
    switch (status) {
      case 'Cliente Novo':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'Configurando BM':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
      case 'Subindo Campanha':
        return 'bg-lime-500/20 text-lime-300 border border-lime-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      case 'Problema':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
      case 'Cliente Sumiu':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'Campanha no Ar':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'Campanha Anual':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'Urgente':
        return 'bg-red-600/30 text-red-200 border border-red-600/50'
      case 'Cliente Antigo':
        return 'bg-red-700/30 text-red-100 border border-red-700/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getDisplaySiteStatus = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'aguardando_link': return 'Aguardando link'
      case 'nao_precisa': return 'Não precisa'
      case 'finalizado': return 'Finalizado'
      default: return status
    }
  }

  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    console.log(`🚀 === ALTERANDO STATUS ===`)
    console.log(`🆔 Cliente ID: "${clienteId}"`)
    console.log(`🎯 Novo Status: "${newStatus}"`)
    console.log(`👤 User Email: ${emailToUse}`)
    console.log(`🔒 IsAdmin: ${isAdmin}`)
    
    if (!clienteId || clienteId.trim() === '') {
      console.error('❌ ID do cliente inválido:', clienteId)
      toast({
        title: "Erro",
        description: "ID do cliente não encontrado",
        variant: "destructive",
      })
      return
    }

    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'status_campanha', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Status da campanha alterado para: ${newStatus}`,
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro na atualização:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSiteStatusChange = async (clienteId: string, newStatus: string) => {
    console.log(`🚀 === ALTERANDO STATUS DO SITE ===`)
    console.log(`🆔 Cliente ID: "${clienteId}"`)
    console.log(`🎯 Novo Status Site: "${newStatus}"`)
    console.log(`👤 User Email: ${emailToUse}`)
    console.log(`🔒 IsAdmin: ${isAdmin}`)
    
    if (!clienteId || clienteId.trim() === '') {
      console.error('❌ ID do cliente inválido:', clienteId)
      toast({
        title: "Erro",
        description: "ID do cliente não encontrado",
        variant: "destructive",
      })
      return
    }

    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'site_status', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Status do site alterado para: ${getDisplaySiteStatus(newStatus)}`,
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do site",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro na atualização do status do site:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status do site",
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

  const handleLinkSave = async (clienteId: string) => {
    try {
      let valueToSave = linkValue
      
      console.log('💾 Salvando link_site com valor:', valueToSave)
      
      const success = await updateCliente(clienteId, 'link_site', valueToSave)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Link atualizado com sucesso",
        })
        setEditingLink(null)
        setLinkValue('')
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar link",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar link",
        variant: "destructive",
      })
      return false
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

  const marcarPagamentoFeito = async (clienteId: string, currentStatus: boolean): Promise<boolean> => {
    setUpdatingComission(clienteId)
    
    try {
      console.log('💰 [ClientesTable] Marcando pagamento como feito para cliente:', clienteId)
      
      const success = await updateCliente(clienteId, 'comissao_paga', true)
      
      if (success) {
        const { error: updateSaqueError } = await supabase
          .from('solicitacoes_saque')
          .update({ 
            status_saque: 'pago',
            processado_em: new Date().toISOString()
          })
          .eq('cliente_id', parseInt(clienteId))

        if (updateSaqueError) {
          console.error('❌ Erro ao atualizar solicitação de saque:', updateSaqueError)
        }

        toast({
          title: "Pagamento Confirmado",
          description: "Pagamento marcado como feito. O gestor será notificado.",
        })
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao confirmar pagamento",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('💥 Erro ao marcar pagamento:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao confirmar pagamento",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdatingComission(null)
    }
  }

  const handleGestorSaqueRequest = async (clienteId: string, currentStatus: boolean): Promise<boolean> => {
    setUpdatingComission(clienteId)
    
    try {
      console.log('💸 [ClientesTable] Gestor solicitando saque para cliente:', clienteId)
      
      const success = await updateCliente(clienteId, 'comissao', 'Solicitado')
      
      if (success) {
        toast({
          title: "Instruções para Saque",
          description: "Mude o status para 'Campanha no Ar' para solicitar o saque",
        })
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao solicitar saque",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('💥 Erro ao solicitar saque:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao solicitar saque",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdatingComission(null)
    }
  }

  const handleComissionToggle = async (clienteId: string, currentStatus: boolean): Promise<boolean> => {
    setUpdatingComission(clienteId)
    
    try {
      console.log('🔍 [ClientesTable] Buscando cliente:', {
        clienteId,
        clienteIdType: typeof clienteId,
        totalClientes: clientes.length
      })
      
      const cliente = clientes.find(c => c.id?.toString() === clienteId)
      if (!cliente) {
        console.error('❌ [ClientesTable] Cliente não encontrado:', {
          clienteIdBuscado: clienteId,
          idsDisponiveis: clientes.map(c => ({ id: c.id, nome: c.nome_cliente })).slice(0, 5)
        })
        toast({
          title: "Erro",
          description: "Cliente não encontrado",
          variant: "destructive",
        })
        return false
      }

      const newComissaoStatus = cliente.comissao === 'Pago' ? 'Pendente' : 'Pago'
      
      console.log('💰 [ClientesTable] Alterando comissão:', {
        clienteId,
        clienteNome: cliente.nome_cliente,
        currentComissao: cliente.comissao,
        newComissaoStatus
      })
      
      const success = await updateCliente(clienteId, 'comissao', newComissaoStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Comissão alterada para: ${newComissaoStatus}`,
        })
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar comissão",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar comissão",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdatingComission(null)
    }
  }

  const handleAddClient = async (clienteData: any) => {
    setAddingClient(true)
    try {
      const success = await addCliente(clienteData)
      return success
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      return false
    } finally {
      setAddingClient(false)
    }
  }

  const renderClientesTable = (clientesList: typeof clientes, isInactive = false) => (
    <div className="space-y-4">
      <div className="lg:hidden">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-center gap-2 text-blue-600 text-xs">
            <span>📱 Deslize horizontalmente para ver todas as colunas</span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table className="table-dark">
              <TableHeader isAdmin={isAdmin} showEmailGestor={isSitesContext} />
              <TableBody>
                {clientesList.length === 0 ? (
                  <TableRow className="border-border hover:bg-muted/20">
                    <TableCell colSpan={isAdmin || isSitesContext ? 12 : 11} className="text-center py-8 text-white">
                      {isInactive 
                        ? `Nenhum cliente inativo encontrado`
                        : clientes.length === 0 
                          ? `Nenhum cliente encontrado`
                          : `Nenhum cliente corresponde aos filtros aplicados`
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesList.map((cliente, index) => (
                    <ClienteRow
                      key={`${emailToUse}-${cliente.id}-${index}`}
                      cliente={cliente}
                      selectedManager={currentManager || selectedManager || 'Próprios dados'}
                      index={index}
                      isAdmin={isAdmin}
                      showEmailGestor={isSitesContext}
                      showSitePagoCheckbox={showSitePagoCheckbox}
                      updatingStatus={updatingStatus}
                      editingLink={editingLink}
                      linkValue={linkValue}
                      setLinkValue={setLinkValue}
                      editingBM={editingBM}
                      bmValue={bmValue}
                      setBmValue={setBmValue}
                      updatingComission={updatingComission}
                      getStatusColor={getStatusColor}
                      onStatusChange={handleStatusChange}
                      onSiteStatusChange={handleSiteStatusChange}
                      onLinkEdit={handleLinkEdit}
                      onLinkSave={handleLinkSave}
                      onLinkCancel={handleLinkCancel}
                      onBMEdit={handleBMEdit}
                      onBMSave={handleBMSave}
                      onBMCancel={handleBMCancel}
                      onComissionToggle={handleComissionToggle}
                      onSitePagoChange={handleSitePagoChange}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    const checkConnection = () => {
      const connected = checkRealtimeConnection()
      setRealtimeConnected(connected)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log(`🔍 [ClientesTable] Validação de resultados:`, {
      totalClientes: clientes.length,
      currentManager,
      emailToUse,
      selectedManager,
      isAdmin,
      isSitesContext,
      filterType
    })
    
    if (clientes.length > 0) {
      console.log(`📊 [ClientesTable] Primeiros 5 clientes:`, clientes.slice(0, 5).map(c => ({ 
        id: c.id, 
        nome: c.nome_cliente, 
        email_gestor: c.email_gestor,
        site_status: c.site_status
      })))
      
      if (isAdmin && !isSitesContext && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes')) {
        console.log('👑 [ClientesTable] ADMIN GLOBAL VIEW - Verificando se mostra todos os clientes:')
        console.log('📈 [ClientesTable] Total de clientes exibidos:', clientes.length)
        console.log('🎯 [ClientesTable] Esperado: 552 clientes (total no Supabase)')
        
        if (clientes.length < 500) {
          console.warn('⚠️ [ClientesTable] POSSÍVEL PROBLEMA: Menos clientes que o esperado no painel Admin!')
        }
      }
      
      if (filterType === 'sites-pendentes') {
        console.log('🌐 [ClientesTable] SITE CREATOR - Sites pendentes:')
        console.log('📈 [ClientesTable] Total de sites aguardando_link:', clientes.length)
        console.log('🎯 [ClientesTable] Todos devem ter site_status = "aguardando_link"')
        
        const statusDistribution = clientes.reduce((acc, c) => {
          acc[c.site_status] = (acc[c.site_status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('📊 [ClientesTable] Distribuição por site_status:', statusDistribution)
      }
      
      if (filterType === 'sites-finalizados') {
        console.log('✅ [ClientesTable] SITE CREATOR - Sites finalizados:')
        console.log('📈 [ClientesTable] Total de sites finalizados:', clientes.length)
        console.log('🎯 [ClientesTable] Esperado: ~14 clientes (confirmado no Supabase)')
      }
      
      if (!isAdmin && !isSitesContext) {
        const clientesInvalidos = clientes.filter(c => c.email_gestor !== emailToUse)
        if (clientesInvalidos.length > 0) {
          console.error('🚨 [ClientesTable] ERRO DE SEGURANÇA: Clientes com email_gestor incorreto detectados!', {
            emailToUse,
            clientesInvalidos: clientesInvalidos.map(c => ({ id: c.id, email_gestor: c.email_gestor }))
          })
          
          setTimeout(() => {
            toast({
              title: "Erro de Segurança",
              description: "Dados inconsistentes detectados. Recarregando...",
              variant: "destructive"
            })
            refetch()
          }, 1000)
          return
        }
        console.log('✅ [ClientesTable] Validação de segurança: todos os clientes pertencem ao gestor correto')
      }
    }
  }, [clientes, currentManager, emailToUse, selectedManager, isAdmin, isSitesContext, filterType])

  useEffect(() => {
    const verificarPermissoes = async () => {
      console.log('🔍 [ClientesTable] Verificando permissões para:', user?.email)
      
      if (!user?.email) {
        console.log('❌ Usuário não logado')
        setPodeAdicionarCliente(false)
        setLoadingPermissoes(false)
        return
      }

      if (isAdmin) {
        console.log('✅ Usuário é admin - pode adicionar clientes')
        setPodeAdicionarCliente(true)
      } else {
        console.log('❌ Usuário é gestor - NÃO pode adicionar clientes (nova política)')
        setPodeAdicionarCliente(false)
      }
      
      setLoadingPermissoes(false)
    }

    verificarPermissoes()
  }, [user?.email, isAdmin])

  function renderWithTabs(clientesOriginais: typeof clientes) {
    const { clientesAtivos, clientesInativos, statusDistribution } = categorizarClientes(clientesOriginais)
    
    const filteredClientesAtivos = getFilteredClientes(clientesAtivos)
    const filteredClientesInativos = getFilteredClientes(clientesInativos)

    return (
      <div className="space-y-4 p-4 lg:p-0">
        {/* Banner de Melhorias Recentes - Versão Sutil */}
        <div className="bg-muted/30 border border-muted-foreground/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-medium border border-yellow-500/30">
                  NOVO
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Melhorias Recentes (Junho 2025)
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBannerMelhoriasExpanded(!bannerMelhoriasExpanded)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        {bannerMelhoriasExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bannerMelhoriasExpanded ? 'Minimizar' : 'Ver melhorias'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                bannerMelhoriasExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span><strong>Interface otimizada:</strong> Botões menores para melhor aproveitamento do espaço na tela</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">✅</span>
                    <span><strong>Filtro "Pendente Criativo":</strong> Novo filtro para identificar clientes que ainda precisam de criativos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">✅</span>
                    <span><strong>Filtro "Sem BM":</strong> Novo filtro para localizar clientes sem número de Business Manager configurado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">✅</span>
                    <span><strong>Status renomeado:</strong> "Campanha no Ar" agora é "Otimização" para lembrar que clientes ativos precisam de otimização contínua</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground/70">
                  Todas as mudanças foram implementadas para otimizar o fluxo de trabalho dos gestores.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Dicas de Produtividade */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-blue-400" />
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium border border-blue-500/30">
                  DICAS
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-blue-400">
                  Dicas de Produtividade
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBannerProdutividadeExpanded(!bannerProdutividadeExpanded)}
                        className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        {bannerProdutividadeExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bannerProdutividadeExpanded ? 'Minimizar' : 'Ver dicas'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                bannerProdutividadeExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-1.5 text-xs text-blue-300">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">💡</span>
                    <span><strong>Filtro "Sem BM":</strong> Use para localizar e configurar Business Managers rapidamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🎯</span>
                    <span><strong>Filtro "Pendente Criativo":</strong> Identifique clientes que precisam de materiais criativos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span><strong>Status "Otimização":</strong> Clientes neste status precisam de novos criativos semanalmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">📞</span>
                    <span><strong>Follow-up:</strong> Clientes em "Agendamento" precisam de ligação para marcar reunião</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">📋</span>
                    <span><strong>Combine filtros:</strong> Use "Status + Criativo" para priorizar tarefas do dia</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-400/70">
                  Use os filtros em combinação para organizar melhor seu fluxo de trabalho diário.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ativos">Clientes Ativos ({clientesAtivos.length})</TabsTrigger>
            <TabsTrigger value="inativos">Clientes Inativos ({clientesInativos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TableActions
                selectedManager={currentManager || selectedManager || 'Próprios dados'}
                filteredClientesCount={filteredClientesAtivos.length}
                realtimeConnected={realtimeConnected}
                onRefresh={refetch}
                onExport={exportToCSV}
              />
              
              {podeAdicionarCliente && !loadingPermissoes && (
                <AddClientModal
                  selectedManager={currentManager || selectedManager || 'Próprios dados'}
                  onClienteAdicionado={refetch}
                  gestorMode={!isAdmin}
                />
              )}
            </div>

            <TableFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              siteStatusFilter={siteStatusFilter}
              setSiteStatusFilter={setSiteStatusFilter}
              showSiteStatusFilter={isAdmin}
              creativoFilter={creativoFilter}
              setCreativoFilter={setCreativoFilter}
              bmFilter={bmFilter}
              setBmFilter={setBmFilter}
              getStatusColor={getStatusColor}
            />

            {renderClientesTable(filteredClientesAtivos)}
          </TabsContent>

          <TabsContent value="inativos" className="space-y-4">
            <TableActions
              selectedManager={currentManager || selectedManager || 'Próprios dados'}
              filteredClientesCount={filteredClientesInativos.length}
              realtimeConnected={realtimeConnected}
              onRefresh={refetch}
              onExport={exportToCSV}
            />

            <TableFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              siteStatusFilter={siteStatusFilter}
              setSiteStatusFilter={setSiteStatusFilter}
              showSiteStatusFilter={isAdmin}
              creativoFilter={creativoFilter}
              setCreativoFilter={setCreativoFilter}
              bmFilter={bmFilter}
              setBmFilter={setBmFilter}
              getStatusColor={getStatusColor}
            />

            {renderClientesTable(filteredClientesInativos, true)}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  let clientesFiltrados = clientes
  if (filterType === 'ativos') {
    const { clientesAtivos } = categorizarClientes(clientes)
    clientesFiltrados = clientesAtivos
  } else if (filterType === 'inativos') {
    const { clientesInativos } = categorizarClientes(clientes)
    clientesFiltrados = clientesInativos
  } else if (filterType === 'problemas') {
    const { clientesProblemas } = categorizarClientes(clientes)
    clientesFiltrados = clientesProblemas
  } else if (filterType === 'sites-pendentes') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.site_status === 'aguardando_link'
    )
  } else if (filterType === 'sites-finalizados') {
    console.log('🌐 [ClientesTable] Aplicando filtro de sites finalizados - usando dados já filtrados do useManagerData')
    console.log('📊 [ClientesTable] Total de clientes recebidos do useManagerData:', clientes.length)
    clientesFiltrados = clientes
  } else {
    return renderWithTabs(clientes)
  }

  const filteredClientes = getFilteredClientes(clientesFiltrados)

  console.log('📋 [ClientesTable] Resultado final da filtragem:', {
    filterType,
    clientesOriginais: clientes.length,
    clientesFiltrados: clientesFiltrados.length,
    filteredClientes: filteredClientes.length
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-center text-white">Carregando clientes...</span>
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

  if (!filterType) {
    return renderWithTabs(clientes)
  }

  return (
    <div className="space-y-4 p-4 lg:p-0">
      {isSitesContext && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>🌐 Painel de Criação de Sites - Visualizando clientes aguardando sites</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TableActions
          selectedManager={currentManager || selectedManager || 'Próprios dados'}
          filteredClientesCount={filteredClientes.length}
          realtimeConnected={realtimeConnected}
          onRefresh={refetch}
          onExport={exportToCSV}
        />
        
        {podeAdicionarCliente && !loadingPermissoes && filterType === 'ativos' && (
          <AddClientModal
            selectedManager={currentManager || selectedManager || 'Próprios dados'}
            onClienteAdicionado={refetch}
            gestorMode={!isAdmin}
          />
        )}
      </div>

      <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        siteStatusFilter={siteStatusFilter}
        setSiteStatusFilter={setSiteStatusFilter}
        showSiteStatusFilter={isAdmin}
        creativoFilter={creativoFilter}
        setCreativoFilter={setCreativoFilter}
        bmFilter={bmFilter}
        setBmFilter={setBmFilter}
        getStatusColor={getStatusColor}
      />

      {renderClientesTable(filteredClientes, filterType === 'inativos')}
    </div>
  )
}
