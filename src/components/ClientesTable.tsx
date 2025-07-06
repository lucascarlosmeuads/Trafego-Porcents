
import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { useSitePagoUpdate } from '@/hooks/useSitePagoUpdate'
import { useTablePagination } from '@/hooks/useTablePagination'
import { supabase } from '@/lib/supabase'
import { RefreshCw, Users, UserX } from 'lucide-react'
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
import { TablePagination } from './ClientesTable/TablePagination'
import { useOptimizedFilters } from '@/hooks/useOptimizedFilters'

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

  // ETAPA 3: Usar filtros otimizados com debounce
  const { filteredClientes: optimizedFilteredClientes, isSearching } = useOptimizedFilters({
    clientes: clientes,
    searchTerm,
    statusFilter,
    siteStatusFilter,
    creativoFilter,
    bmFilter,
    clientesComCriativos
  })

  const fetchClientesComCriativos = async () => {
    try {
      console.log('🎨 [ClientesTable] Buscando clientes com criativos VISUAIS (imagens/vídeos) do gestor...')
      
      // Definir tipos de arquivo que são considerados criativos visuais
      const tiposCriativosVisuais = [
        // Imagens
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        // Vídeos
        'video/mp4',
        'video/mov',
        'video/avi',
        'video/quicktime',
        'video/webm',
        'video/mkv',
        'video/wmv',
        'video/flv'
      ]
      
      const { data: arquivos, error } = await supabase
        .from('arquivos_cliente')
        .select('email_cliente, tipo_arquivo, nome_arquivo')
        .eq('author_type', 'gestor')
        .in('tipo_arquivo', tiposCriativosVisuais)
        .not('email_cliente', 'is', null)
        .neq('email_cliente', '')
      
      if (error) {
        console.error('❌ [ClientesTable] Erro ao buscar arquivos criativos:', error)
        return
      }
      
      console.log('🔍 [ClientesTable] Arquivos brutos encontrados:', arquivos?.length || 0)
      
      // Filtrar e validar emails antes de adicionar ao Set
      const emailsValidos = new Set<string>()
      let emailsVaziosIgnorados = 0
      
      arquivos?.forEach(arquivo => {
        const email = arquivo.email_cliente?.trim()
        if (email && email !== '' && email !== 'null' && email !== 'undefined') {
          emailsValidos.add(email)
          console.log(`✅ [ClientesTable] Email válido encontrado: ${email} - Arquivo: ${arquivo.nome_arquivo} (${arquivo.tipo_arquivo})`)
        } else {
          emailsVaziosIgnorados++
          console.log(`❌ [ClientesTable] Email inválido ignorado: "${arquivo.email_cliente}" - Arquivo: ${arquivo.nome_arquivo}`)
        }
      })
      
      console.log('✅ [ClientesTable] Análise de criativos visuais FINAL:')
      console.log('   📊 Total de arquivos criativos encontrados:', arquivos?.length || 0)
      console.log('   📧 Emails vazios/inválidos ignorados:', emailsVaziosIgnorados)
      console.log('   👥 Clientes únicos com criativos visuais E email válido:', emailsValidos.size)
      console.log('   🎯 Tipos aceitos como criativos:', tiposCriativosVisuais.slice(0, 8).join(', '), '...')
      
      if (emailsValidos.size > 0) {
        console.log('   📧 Emails válidos com criativos:')
        Array.from(emailsValidos).slice(0, 10).forEach((email, index) => {
          console.log(`      ${index + 1}. ${email}`)
        })
        if (emailsValidos.size > 10) {
          console.log(`      ... e mais ${emailsValidos.size - 10} emails`)
        }
      }
      
      setClientesComCriativos(emailsValidos)
      
    } catch (error) {
      console.error('💥 [ClientesTable] Erro inesperado ao buscar criativos visuais:', error)
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

  // DEPRECATED: Manter getFilteredClientes para compatibilidade, mas usar versão otimizada
  const getFilteredClientes = (clientesList: typeof clientes) => {
    console.log('⚠️ [ClientesTable] Usando filtros legados - considere migrar para useOptimizedFilters')
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

  // Função para atualizar os dados após operações de comissão
  const handleComissionUpdate = () => {
    console.log('🔄 [ClientesTable] Atualizando dados após operação de comissão...')
    refetch()
  }

  const renderClientesTable = (clientesList: typeof clientes, isInactive = false) => {
    // ETAPA 3: Usar filtros otimizados quando possível
    const finalClientesList = clientesList === clientes ? optimizedFilteredClientes : getFilteredClientes(clientesList)
    
    const {
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedData,
      handlePageChange,
      handleItemsPerPageChange
    } = useTablePagination({ 
      data: finalClientesList,
      initialItemsPerPage: 50 
    })

    return (
      <div className="space-y-4">
        {/* Indicador de busca em tempo real */}
        {isSearching && searchTerm && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="flex items-center justify-center gap-2 text-blue-600 text-xs">
              <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Filtrando resultados...</span>
            </div>
          </div>
        )}

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
                  {paginatedData.length === 0 ? (
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
                    paginatedData.map((cliente, index) => (
                      <ClienteRow
                        key={`${emailToUse}-${cliente.id}-${currentPage}-${index}`}
                        cliente={cliente}
                        selectedManager={currentManager || selectedManager || 'Próprios dados'}
                        index={(currentPage - 1) * itemsPerPage + index}
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
                        getStatusColor={getStatusColor}
                        onStatusChange={handleStatusChange}
                        onSiteStatusChange={handleSiteStatusChange}
                        onLinkEdit={handleLinkEdit}
                        onLinkSave={handleLinkSave}
                        onLinkCancel={handleLinkCancel}
                        onBMEdit={handleBMEdit}
                        onBMSave={handleBMSave}
                        onBMCancel={handleBMCancel}
                        onComissionUpdate={handleComissionUpdate}
                        onSitePagoChange={handleSitePagoChange}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Add pagination controls */}
        {totalItems > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    )
  }

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
    
    // ETAPA 3: Usar filtros otimizados para as abas
    const { filteredClientes: filteredClientesAtivos } = useOptimizedFilters({
      clientes: clientesAtivos,
      searchTerm,
      statusFilter,
      siteStatusFilter,
      creativoFilter,
      bmFilter,
      clientesComCriativos
    })

    const { filteredClientes: filteredClientesInativos } = useOptimizedFilters({
      clientes: clientesInativos,
      searchTerm,
      statusFilter,
      siteStatusFilter,
      creativoFilter,
      bmFilter,
      clientesComCriativos
    })

    return (
      <div className="space-y-6 p-4 lg:p-0">
        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-1">
            <TabsTrigger 
              value="ativos" 
              className="relative h-12 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/10 text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"></div>
                  <Users className="h-4 w-4" />
                </div>
                <span>Clientes Ativos</span>
                <div className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md text-xs font-bold border border-emerald-500/30">
                  {clientesAtivos.length}
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="inativos"
              className="relative h-12 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500/20 data-[state=active]:to-gray-500/20 data-[state=active]:text-slate-300 data-[state=active]:border data-[state=active]:border-slate-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-500/10 text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full shadow-sm shadow-slate-400/50"></div>
                  <UserX className="h-4 w-4" />
                </div>
                <span>Clientes Inativos</span>
                <div className="bg-slate-500/20 text-slate-300 px-2 py-1 rounded-md text-xs font-bold border border-slate-500/30">
                  {clientesInativos.length}
                </div>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="space-y-4 mt-6">
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
              isSearching={isSearching}
            />

            {renderClientesTable(filteredClientesAtivos)}
          </TabsContent>

          <TabsContent value="inativos" className="space-y-4 mt-6">
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
              isSearching={isSearching}
            />

            {renderClientesTable(filteredClientesInativos, true)}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Para casos específicos (filterType), usar filtros otimizados
  if (!filterType) {
    return renderWithTabs(clientes)
  }

  // ETAPA 3: Usar filtros otimizados para casos específicos
  const finalFilteredClientes = optimizedFilteredClientes.filter(cliente => {
    if (filterType === 'ativos') {
      const { clientesAtivos } = categorizarClientes([cliente])
      return clientesAtivos.length > 0
    } else if (filterType === 'inativos') {
      const { clientesInativos } = categorizarClientes([cliente])
      return clientesInativos.length > 0
    } else if (filterType === 'problemas') {
      return cliente.status_campanha === 'Problema'
    } else if (filterType === 'sites-pendentes') {
      return cliente.site_status === 'aguardando_link'
    } else if (filterType === 'sites-finalizados') {
      return cliente.site_status === 'finalizado'
    }
    return true
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
          filteredClientesCount={finalFilteredClientes.length}
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
        isSearching={isSearching}
      />

      {renderClientesTable(finalFilteredClientes, filterType === 'inativos')}
    </div>
  )
}
