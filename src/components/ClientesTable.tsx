import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { useSitePagoUpdate } from '@/hooks/useSitePagoUpdate'
import { supabase } from '@/lib/supabase'
import { RefreshCw } from 'lucide-react'
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
import { ProblemaDescricao } from './ClientesTable/ProblemaDescricao'

interface ClientesTableProps {
  selectedManager?: string
  userEmail?: string
  filterType?: 'ativos' | 'inativos' | 'problemas' | 'saques-pendentes' | 'sites-pendentes' | 'sites-finalizados'
}

export function ClientesTable({ selectedManager, userEmail, filterType }: ClientesTableProps) {
  const { isAdmin, user } = useAuth()
  
  const emailToUse = userEmail || user?.email || ''
  
  // Site Creator context detection
  const isSitesContext = filterType === 'sites-pendentes' || 
                        filterType === 'sites-finalizados' ||
                        emailToUse.includes('criador') || 
                        emailToUse.includes('site') || 
                        emailToUse.includes('webdesign')
  
  // Determine if the "Pago" checkbox should be shown
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
  
  // For Site Creator panels, don't pass selectedManager to avoid conflicts
  const managerForQuery = isSitesContext ? undefined : selectedManager
  
  const { clientes, loading, error, updateCliente, addCliente, refetch, currentManager, setClientes } = useManagerData(
    emailToUse, 
    isAdmin, 
    managerForQuery,
    filterType === 'sites-pendentes' ? 'sites-pendentes' : 
    filterType === 'sites-finalizados' ? 'sites-finalizados' : undefined
  )

  // Add the site pago update hook
  const { handleSitePagoChange } = useSitePagoUpdate(clientes, setClientes)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [podeAdicionarCliente, setPodeAdicionarCliente] = useState(false)
  const [loadingPermissoes, setLoadingPermissoes] = useState(true)
  const [addingClient, setAddingClient] = useState(false)
  const [editandoProblema, setEditandoProblema] = useState<string | null>(null)
  const [problemaDescricao, setProblemaDescricao] = useState('')

  const categorizarClientes = (clientesList: typeof clientes) => {
    console.log('📊 [ClientesTable] === CATEGORIZANDO CLIENTES (VERSÃO CORRIGIDA) ===')
    console.log('📊 [ClientesTable] Total de clientes recebidos:', clientesList.length)
    
    // Complete list of INACTIVE statuses - clients not actively progressing
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
    
    // Complete list of PROBLEM statuses that should be handled separately
    const statusProblemas = [
      'Problema'
    ]
    
    // Complete list of SAQUE PENDENTE statuses
    const statusSaquesPendentes = [
      'Saque Pendente',
      'Campanha Anual'
    ]
    
    // ACTIVE statuses - all statuses that represent clients actively progressing
    // This is the DEFAULT category - any status NOT in the above lists is considered ACTIVE
    const clientesAtivos = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return !statusInativos.includes(status) && 
             !statusProblemas.includes(status) && 
             !statusSaquesPendentes.includes(status)
    })
    
    const clientesInativos = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return statusInativos.includes(status)
    })
    
    const clientesProblemas = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return statusProblemas.includes(status)
    })
    
    const clientesSaquesPendentes = clientesList.filter(cliente => {
      const status = cliente.status_campanha || ''
      return statusSaquesPendentes.includes(status)
    })
    
    // Enhanced logging to identify all unique statuses
    const statusDistribution = clientesList.reduce((acc, cliente) => {
      const status = cliente.status_campanha || 'SEM_STATUS'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get all unique statuses for debugging
    const uniqueStatuses = Object.keys(statusDistribution).sort()
    
    console.log('📊 [ClientesTable] Todos os status únicos encontrados (', uniqueStatuses.length, '):', uniqueStatuses)
    console.log('📊 [ClientesTable] Distribuição completa por status:', statusDistribution)
    console.log('📊 [ClientesTable] Contagem após categorização corrigida:')
    console.log('   ✅ Ativos:', clientesAtivos.length)
    console.log('   ❌ Inativos:', clientesInativos.length)
    console.log('   ⚠️ Problemas:', clientesProblemas.length)
    console.log('   💰 Saques Pendentes:', clientesSaquesPendentes.length)
    console.log('   🧮 Soma total:', clientesAtivos.length + clientesInativos.length + clientesProblemas.length + clientesSaquesPendentes.length)
    console.log('   🎯 Total esperado:', clientesList.length)
    
    // Status categorization breakdown for debugging
    console.log('📋 [ClientesTable] Status por categoria:')
    console.log('   ✅ Status ATIVOS (por exclusão):', 
      uniqueStatuses.filter(s => 
        !statusInativos.includes(s) && 
        !statusProblemas.includes(s) && 
        !statusSaquesPendentes.includes(s)
      )
    )
    console.log('   ❌ Status INATIVOS:', statusInativos.filter(s => uniqueStatuses.includes(s)))
    console.log('   ⚠️ Status PROBLEMAS:', statusProblemas.filter(s => uniqueStatuses.includes(s)))
    console.log('   💰 Status SAQUES:', statusSaquesPendentes.filter(s => uniqueStatuses.includes(s)))
    
    // Validation: Check if all clients are accounted for
    const totalCategorizado = clientesAtivos.length + clientesInativos.length + clientesProblemas.length + clientesSaquesPendentes.length
    if (totalCategorizado !== clientesList.length) {
      console.error('🚨 [ClientesTable] ERRO CRÍTICO: Clientes não categorizados encontrados!')
      console.error('🚨 [ClientesTable] Diferença:', clientesList.length - totalCategorizado, 'clientes')
      
      // Find uncategorized clients - this should never happen with the new logic
      const clientesCategorizados = [...clientesAtivos, ...clientesInativos, ...clientesProblemas, ...clientesSaquesPendentes]
      const idsCategorizados = new Set(clientesCategorizados.map(c => c.id))
      const clientesOrfaos = clientesList.filter(c => !idsCategorizados.has(c.id))
      
      console.error('🚨 [ClientesTable] Clientes órfãos (não categorizados):')
      clientesOrfaos.forEach(cliente => {
        console.error(`   - ID: ${cliente.id}, Nome: ${cliente.nome_cliente}, Status: "${cliente.status_campanha}"`)
      })
      
      // Show toast warning to user
      toast({
        title: "⚠️ Erro de Categorização",
        description: `${clientesOrfaos.length} clientes não foram categorizados. Verifique os logs.`,
        variant: "destructive"
      })
    } else {
      console.log('✅ [ClientesTable] SUCESSO: Todos os', clientesList.length, 'clientes foram categorizados corretamente!')
      console.log('🎯 [ClientesTable] Resultado da correção:')
      console.log('   - Antes: 457 ativos + 21 inativos = 478 (faltavam 74)')
      console.log('   - Agora:', clientesAtivos.length, 'ativos +', clientesInativos.length, 'inativos =', totalCategorizado, '(todos incluídos)')
    }
    
    return {
      clientesAtivos,
      clientesInativos,
      clientesProblemas,
      clientesSaquesPendentes,
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
      
      return matchesSearch && matchesStatus && matchesSiteStatus
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
      case 'Saque Pendente':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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

    if (newStatus === 'Problema') {
      setEditandoProblema(clienteId)
      setProblemaDescricao('')
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
      
      // Find the current client to check the comissao field - FIX: Keep clienteId as string for consistent comparison
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

      // Toggle between "Pendente" and "Pago" based on current comissao value
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

  const handleComissionValueEdit = (clienteId: string, currentValue: number) => {
    setEditingComissionValue(clienteId)
    setComissionValueInput(currentValue.toFixed(2))
  }

  const handleComissionValueSave = async (clienteId: string, newValue: number) => {
    try {
      const success = await updateCliente(clienteId, 'valor_comissao', newValue)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Valor da comissão atualizado com sucesso",
        })
        setEditingComissionValue(null)
        setComissionValueInput('')
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar valor da comissão",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao salvar valor da comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar valor da comissão",
        variant: "destructive",
      })
    }
  }

  const handleComissionValueCancel = () => {
    setEditingComissionValue(null)
    setComissionValueInput('')
  }

  const handleProblemaDescricaoSave = async (clienteId: string, descricao: string) => {
    try {
      const statusSuccess = await updateCliente(clienteId, 'status_campanha', 'Problema')
      if (!statusSuccess) {
        toast({
          title: "Erro",
          description: "Falha ao alterar status para Problema",
          variant: "destructive",
        })
        return false
      }

      const descricaoSuccess = await updateCliente(clienteId, 'descricao_problema', descricao)
      if (!descricaoSuccess) {
        toast({
          title: "Erro",
          description: "Falha ao salvar descrição do problema",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Sucesso",
        description: "Problema registrado com sucesso",
      })
      
      return true
    } catch (error) {
      console.error('Erro ao salvar problema:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao registrar problema",
        variant: "destructive",
      })
      return false
    }
  }

  const handleProblemaDescricaoCancel = () => {
    setEditandoProblema(null)
    setProblemaDescricao('')
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
      {editandoProblema && (
        <ProblemaDescricao
          clienteId={editandoProblema}
          descricaoAtual={problemaDescricao}
          onSave={handleProblemaDescricaoSave}
          onCancel={handleProblemaDescricaoCancel}
        />
      )}
      
      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
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
                    editingComissionValue={editingComissionValue}
                    comissionValueInput={comissionValueInput}
                    setComissionValueInput={setComissionValueInput}
                    getStatusColor={getStatusColor}
                    onStatusChange={handleStatusChange}
                    onSiteStatusChange={handleSiteStatusChange}
                    onLinkEdit={handleLinkEdit}
                    onLinkSave={handleLinkSave}
                    onLinkCancel={handleLinkCancel}
                    onBMEdit={handleBMEdit}
                    onBMSave={handleBMSave}
                    onBMCancel={handleBMCancel}
                    onComissionToggle={
                      filterType === 'saques-pendentes' 
                        ? marcarPagamentoFeito 
                        : !isAdmin 
                          ? handleGestorSaqueRequest  
                          : handleComissionToggle     
                    }
                    onComissionValueEdit={handleComissionValueEdit}
                    onComissionValueSave={handleComissionValueSave}
                    onComissionValueCancel={handleComissionValueCancel}
                    onSitePagoChange={handleSitePagoChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
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
      
      // Validation for Admin panel - should show ALL clients when "Todos os Gestores"
      if (isAdmin && !isSitesContext && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes')) {
        console.log('👑 [ClientesTable] ADMIN GLOBAL VIEW - Verificando se mostra todos os clientes:')
        console.log('📈 [ClientesTable] Total de clientes exibidos:', clientes.length)
        console.log('🎯 [ClientesTable] Esperado: 552 clientes (total no Supabase)')
        
        if (clientes.length < 500) {
          console.warn('⚠️ [ClientesTable] POSSÍVEL PROBLEMA: Menos clientes que o esperado no painel Admin!')
        }
      }
      
      // Validation for Site Creator panels
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
      
      // Security validation for non-admin users
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

      // NEW LOGIC: Only admins can add clients
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
        {!isAdmin && !isSitesContext && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>🔒 Filtro de Segurança Ativo - Visualizando apenas seus clientes ({emailToUse})</span>
            </div>
          </div>
        )}
        
        {isSitesContext && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>🌐 Painel de Criação de Sites - Visualizando clientes aguardando sites</span>
            </div>
          </div>
        )}
        
        {/* Enhanced validation panel for Admin */}
        {isAdmin && !isSitesContext && (!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes') && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>👑 Painel Admin - Visualização Global de Todos os Clientes</span>
              </div>
              <div className="text-sm text-blue-600">
                Total: {clientesOriginais.length} | Ativos: {clientesAtivos.length} | Inativos: {clientesInativos.length}
              </div>
            </div>
            {clientesOriginais.length !== 552 && (
              <div className="mt-2 text-amber-600 text-xs">
                ⚠️ Atenção: Esperado 552 clientes, encontrados {clientesOriginais.length}
              </div>
            )}
          </div>
        )}
        
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
              
              {/* ONLY SHOW ADD CLIENT BUTTON FOR ADMINS */}
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
  } else if (filterType === 'saques-pendentes') {
    const { clientesSaquesPendentes } = categorizarClientes(clientes)
    clientesFiltrados = clientesSaquesPendentes
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
      {!isAdmin && !isSitesContext && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>🔒 Filtro de Segurança Ativo - Visualizando apenas seus clientes ({emailToUse})</span>
          </div>
        </div>
      )}

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
        
        {/* ONLY SHOW ADD CLIENT BUTTON FOR ADMINS */}
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
        getStatusColor={getStatusColor}
      />

      {renderClientesTable(filteredClientes, filterType === 'inativos')}
    </div>
  )
}
