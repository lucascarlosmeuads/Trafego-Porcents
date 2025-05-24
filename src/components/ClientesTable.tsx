import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
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
  filterType?: 'ativos' | 'inativos' | 'problemas'
}

export function ClientesTable({ selectedManager, userEmail, filterType }: ClientesTableProps) {
  const { isAdmin, user } = useAuth()
  
  // FILTRO CRÍTICO: Para admin: usa selectedManager; para gestor: usa email do usuário
  const emailToUse = userEmail || user?.email || ''
  const managerName = selectedManager || 'Próprios dados'
  
  console.log('🔍 [ClientesTable] Configuração de acesso:', {
    isAdmin,
    emailToUse,
    selectedManager,
    userEmail: user?.email,
    filterType
  })
  
  const { clientes, loading, error, updateCliente, addCliente, refetch, currentManager } = useManagerData(
    emailToUse, 
    isAdmin, 
    selectedManager
  )
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

  // Define utility functions first, before they're used
  const getFilteredClientes = (clientesList: typeof clientes) => {
    return clientesList.filter(cliente => {
      const matchesSearch = 
        cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm) ||
        cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
      
      return matchesSearch && matchesStatus
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
      'Link Grupo', 'Link Briefing', 'Link Criativo', 'Link Site', 
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
      case 'Problema':
        return 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
      case 'Off':
        return 'bg-slate-500/20 text-slate-700 border border-slate-500/30'
      case 'Reembolso':
        return 'bg-red-500/20 text-red-700 border border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
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

  const renderClientesTable = (clientesList: typeof clientes, isInactive = false) => (
    <div className="space-y-4">
      {/* Campo de descrição do problema */}
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
            <TableHeader />
            <TableBody>
              {clientesList.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/20">
                  <TableCell colSpan={15} className="text-center py-8 text-white">
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
                    selectedManager={currentManager || managerName}
                    index={index}
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
                    onLinkEdit={handleLinkEdit}
                    onLinkSave={handleLinkSave}
                    onLinkCancel={handleLinkCancel}
                    onBMEdit={handleBMEdit}
                    onBMSave={handleBMSave}
                    onBMCancel={handleBMCancel}
                    onComissionToggle={handleComissionToggle}
                    onComissionValueEdit={handleComissionValueEdit}
                    onComissionValueSave={handleComissionValueSave}
                    onComissionValueCancel={handleComissionValueCancel}
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
    console.log(`🔍 [ClientesTable] Total de clientes carregados:`, clientes.length)
    console.log(`📊 Manager atual:`, currentManager)
    console.log(`📊 Email usado:`, emailToUse)
    console.log(`📊 Selected Manager:`, selectedManager)
    console.log(`🔒 IsAdmin:`, isAdmin)
    
    if (clientes.length > 0) {
      console.log(`📊 Primeiros 5 clientes:`, clientes.slice(0, 5).map(c => ({ 
        id: c.id, 
        nome: c.nome_cliente, 
        email_gestor: c.email_gestor 
      })))
      
      // VALIDAÇÃO DE SEGURANÇA: Para não-admins, verificar se todos os clientes pertencem ao gestor
      if (!isAdmin) {
        const clientesInvalidos = clientes.filter(c => c.email_gestor !== emailToUse)
        if (clientesInvalidos.length > 0) {
          console.error('🚨 [ClientesTable] ERRO DE SEGURANÇA: Clientes com email_gestor incorreto detectados!', {
            emailToUse,
            clientesInvalidos: clientesInvalidos.map(c => ({ id: c.id, email_gestor: c.email_gestor }))
          })
          toast({
            title: "Erro de Segurança",
            description: "Dados inconsistentes detectados. Recarregando...",
            variant: "destructive"
          })
          refetch()
          return
        }
        console.log('✅ [ClientesTable] Validação de segurança: todos os clientes pertencem ao gestor correto')
      }
    }
  }, [clientes, currentManager, emailToUse, selectedManager, isAdmin])

  // Verificar permissões do gestor
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
        console.log('✅ Usuário é admin - pode adicionar')
        setPodeAdicionarCliente(true)
        setLoadingPermissoes(false)
        return
      }

      setLoadingPermissoes(true)
      try {
        const { data, error } = await supabase
          .from('gestores')
          .select('pode_adicionar_cliente, ativo')
          .eq('email', user.email)
          .single()

        if (error) {
          console.log('⚠️ Gestor não encontrado na tabela gestores:', error)
          setPodeAdicionarCliente(false)
        } else {
          const canAdd = data.pode_adicionar_cliente && data.ativo
          console.log('📊 Permissões do gestor:', { 
            email: user.email, 
            pode_adicionar_cliente: data.pode_adicionar_cliente, 
            ativo: data.ativo,
            canAdd 
          })
          setPodeAdicionarCliente(canAdd)
        }
      } catch (error) {
        console.error('💥 Erro ao verificar permissões:', error)
        setPodeAdicionarCliente(false)
      } finally {
        setLoadingPermissoes(false)
      }
    }

    verificarPermissoes()
  }, [user?.email, isAdmin])

  const handleLinkSave = async (clienteId: string, field: string) => {
    try {
      // Para link_site, usar o valor do input interno da linha
      let valueToSave = linkValue
      
      // Se for campo link_site e estamos editando internamente, pegar o valor do estado da linha
      if (field === 'link_site') {
        // O valor já será passado corretamente pelo siteLinkInput via setLinkValue
        valueToSave = linkValue
      }
      
      console.log('💾 Salvando campo:', field, 'com valor:', valueToSave)
      
      const success = await updateCliente(clienteId, field, valueToSave)
      
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

    // Se o status é "Problema", abrir o campo de descrição
    if (newStatus === 'Problema') {
      setEditandoProblema(clienteId)
      setProblemaDescricao('')
      return
    }

    // Determinar se é status de campanha ou status de site
    const isSiteStatus = ['pendente', 'aguardando_link', 'nao_precisa', 'finalizado'].includes(newStatus)
    const field = isSiteStatus ? 'site_status' : 'status_campanha'
    
    console.log(`📋 Campo a ser atualizado: ${field}`)

    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, field, newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: isSiteStatus 
            ? `Status do site alterado para: ${getDisplaySiteStatus(newStatus)}`
            : `Status da campanha alterado para: ${newStatus}`,
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

  const handleProblemaDescricaoSave = async (clienteId: string, descricao: string) => {
    try {
      // Primeiro, atualizar o status para Problema
      const statusSuccess = await updateCliente(clienteId, 'status_campanha', 'Problema')
      if (!statusSuccess) {
        toast({
          title: "Erro",
          description: "Falha ao alterar status para Problema",
          variant: "destructive",
        })
        return false
      }

      // Depois, salvar a descrição do problema
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

  const handleLinkEdit = (clienteId: string, field: string, currentValue: string) => {
    setEditingLink({ clienteId, field })
    setLinkValue(currentValue || '')
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
    setUpdatingComission(clienteId)
    
    try {
      // Toggle the current status - if it's paid, make it unpaid, and vice versa
      const newStatus = !currentStatus
      const success = await updateCliente(clienteId, 'comissao_paga', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: newStatus ? "Comissão marcada como paga" : "Comissão marcada como não paga",
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

  const handleLinkCancel = () => {
    setEditingLink(null)
    setLinkValue('')
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

  function renderWithTabs(clientesAtivos: typeof clientes, clientesInativos: typeof clientes) {
    const filteredClientesAtivos = getFilteredClientes(clientesAtivos)
    const filteredClientesInativos = getFilteredClientes(clientesInativos)

    return (
      <div className="space-y-4 p-4 lg:p-0">
        {/* Indicador de Segurança para Gestores */}
        {!isAdmin && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>🔒 Filtro de Segurança Ativo - Visualizando apenas seus clientes ({emailToUse})</span>
            </div>
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
                selectedManager={currentManager || managerName}
                filteredClientesCount={filteredClientesAtivos.length}
                realtimeConnected={realtimeConnected}
                onRefresh={refetch}
                onExport={exportToCSV}
              />
              
              {podeAdicionarCliente && !loadingPermissoes && (
                <AddClientModal
                  selectedManager={currentManager || managerName}
                  onClienteAdicionado={refetch}
                />
              )}
            </div>

            <TableFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              getStatusColor={getStatusColor}
            />

            {renderClientesTable(filteredClientesAtivos)}
          </TabsContent>

          <TabsContent value="inativos" className="space-y-4">
            <TableActions
              selectedManager={currentManager || managerName}
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
              getStatusColor={getStatusColor}
            />

            {renderClientesTable(filteredClientesInativos, true)}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Filtrar clientes baseado no filterType
  let clientesFiltrados = clientes
  if (filterType === 'ativos') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema'
    )
  } else if (filterType === 'inativos') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha === 'Off' || cliente.status_campanha === 'Reembolso'
    )
  } else if (filterType === 'problemas') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha === 'Problema'
    )
  } else {
    // Comportamento padrão (manter as abas existentes)
    const clientesAtivos = clientes.filter(cliente => 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema'
    )
    
    const clientesInativos = clientes.filter(cliente => 
      cliente.status_campanha === 'Off' || cliente.status_campanha === 'Reembolso'
    )

    return renderWithTabs(clientesAtivos, clientesInativos)
  }

  const filteredClientes = getFilteredClientes(clientesFiltrados)

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

  // Se não é um filterType específico, renderizar com abas
  if (!filterType) {
    const clientesAtivos = clientes.filter(cliente => 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema'
    )
    
    const clientesInativos = clientes.filter(cliente => 
      cliente.status_campanha === 'Off' || cliente.status_campanha === 'Reembolso'
    )

    return renderWithTabs(clientesAtivos, clientesInativos)
  }

  // Renderizar tabela simples para filterType específico
  return (
    <div className="space-y-4 p-4 lg:p-0">
      {/* Indicador de Segurança para Gestores */}
      {!isAdmin && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>🔒 Filtro de Segurança Ativo - Visualizando apenas seus clientes ({emailToUse})</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TableActions
          selectedManager={currentManager || managerName}
          filteredClientesCount={filteredClientes.length}
          realtimeConnected={realtimeConnected}
          onRefresh={refetch}
          onExport={exportToCSV}
        />
        
        {podeAdicionarCliente && !loadingPermissoes && filterType === 'ativos' && (
          <AddClientModal
            selectedManager={currentManager || managerName}
            onClienteAdicionado={refetch}
          />
        )}
      </div>

      <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        getStatusColor={getStatusColor}
      />

      {renderClientesTable(filteredClientes, filterType === 'inativos')}
    </div>
  )
}
