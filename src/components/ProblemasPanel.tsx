import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSitePagoUpdate } from '@/hooks/useSitePagoUpdate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableActions } from './ClientesTable/TableActions'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { ProblemaDescricao } from './ClientesTable/ProblemaDescricao'
import { checkRealtimeConnection } from '@/utils/realtimeUtils'

interface ClienteComProblema {
  id: string
  data_venda: string
  created_at: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  site_status: string
  data_limite: string
  link_briefing: string
  link_criativo: string
  link_site: string
  link_grupo: string
  numero_bm: string
  comissao_paga: boolean
  valor_comissao: number
  descricao_problema: string
  comissao: string
  saque_solicitado: boolean
  site_pago: boolean
}

interface ProblemasPanelProps {
  gestorMode?: boolean
}

export function ProblemasPanel({ gestorMode = false }: ProblemasPanelProps) {
  const { user, isAdmin } = useAuth()
  const [clientesComProblema, setClientesComProblema] = useState<ClienteComProblema[]>([])
  
  // Add the site pago update hook
  const { handleSitePagoChange } = useSitePagoUpdate(clientesComProblema, setClientesComProblema)
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [editandoProblema, setEditandoProblema] = useState<string | null>(null)
  const [problemaDescricao, setProblemaDescricao] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ clienteId: string, field: string } | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [editingBM, setEditingBM] = useState<string | null>(null)
  const [bmValue, setBmValue] = useState('')
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')

  const buscarClientesComProblema = async () => {
    try {
      console.log('🔍 [ProblemasPanel] Buscando clientes com status Problema...')
      
      let query = supabase
        .from('todos_clientes')
        .select(`
          id, data_venda, created_at, nome_cliente, telefone, email_cliente, vendedor,
          email_gestor, status_campanha, site_status, data_limite, link_briefing,
          link_criativo, link_site, link_grupo, numero_bm, comissao_paga, valor_comissao,
          descricao_problema, comissao, saque_solicitado, site_pago
        `)
        .eq('status_campanha', 'Problema')
        .order('id', { ascending: true })

      // Se for gestor mode (não admin), filtrar por email do usuário
      if (gestorMode && !isAdmin && user?.email) {
        query = query.eq('email_gestor', user.email)
        console.log('🔒 [ProblemasPanel] Filtro de gestor aplicado:', user.email)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [ProblemasPanel] Erro ao buscar clientes com problema:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes com problemas",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [ProblemasPanel] Clientes com problema encontrados:', data?.length || 0)
      setClientesComProblema(data || [])
    } catch (err) {
      console.error('💥 [ProblemasPanel] Erro na busca:', err)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCliente = async (clienteId: string, field: string, value: string | boolean | number) => {
    try {
      console.log('🔧 [ProblemasPanel] Atualizando cliente:', clienteId, 'campo:', field, 'valor:', value)
      
      const updates: any = { [field]: value }

      // Se está saindo do status Problema, limpar a descrição
      if (field === 'status_campanha' && value !== 'Problema') {
        updates.descricao_problema = null
      }

      const { error } = await supabase
        .from('todos_clientes')
        .update(updates)
        .eq('id', parseInt(clienteId))

      if (error) {
        console.error('❌ [ProblemasPanel] Erro ao atualizar cliente:', error)
        return false
      }

      console.log('✅ [ProblemasPanel] Cliente atualizado com sucesso')
      buscarClientesComProblema()
      return true
    } catch (err) {
      console.error('💥 [ProblemasPanel] Erro ao atualizar cliente:', err)
      return false
    }
  }

  const getFilteredClientes = () => {
    return clientesComProblema.filter(cliente => {
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

  const getStatusColor = (status: string) => {
    if (!status || status.trim() === '') {
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
    
    switch (status) {
      case 'Problema':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const handleStatusChange = async (clienteId: string, newStatus: string) => {
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
          description: `Status alterado para: ${newStatus}`
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao alterar status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro na atualização:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSiteStatusChange = async (clienteId: string, newStatus: string) => {
    setUpdatingStatus(clienteId)
    
    try {
      const success = await updateCliente(clienteId, 'site_status', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Status do site alterado`
        })
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do site",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro na atualização do status do site:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status do site",
        variant: "destructive"
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
      const success = await updateCliente(clienteId, 'link_site', linkValue)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Link atualizado com sucesso"
        })
        setEditingLink(null)
        setLinkValue('')
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar link",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar link",
        variant: "destructive"
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
          description: "Número BM atualizado com sucesso"
        })
        setEditingBM(null)
        setBmValue('')
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar número BM",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao salvar BM:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar número BM",
        variant: "destructive"
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
      const newStatus = !currentStatus
      const success = await updateCliente(clienteId, 'comissao_paga', newStatus)
      
      if (success) {
        toast({
          title: "Sucesso",
          description: newStatus ? "Comissão marcada como paga" : "Comissão marcada como não paga"
        })
        return true
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar comissão",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar comissão",
        variant: "destructive"
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
          description: "Valor da comissão atualizado com sucesso"
        })
        setEditingComissionValue(null)
        setComissionValueInput('')
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar valor da comissão",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao salvar valor da comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar valor da comissão",
        variant: "destructive"
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
          variant: "destructive"
        })
        return false
      }

      const descricaoSuccess = await updateCliente(clienteId, 'descricao_problema', descricao)
      if (!descricaoSuccess) {
        toast({
          title: "Erro",
          description: "Falha ao salvar descrição do problema",
          variant: "destructive"
        })
        return false
      }

      toast({
        title: "Sucesso",
        description: "Problema registrado com sucesso"
      })
      
      return true
    } catch (error) {
      console.error('Erro ao salvar problema:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao registrar problema",
        variant: "destructive"
      })
      return false
    }
  }

  const handleProblemaDescricaoCancel = () => {
    setEditandoProblema(null)
    setProblemaDescricao('')
  }

  const exportToCSV = () => {
    if (clientesComProblema.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum cliente para exportar"
      })
      return
    }

    const headers = [
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor',
      'Email Gestor', 'Status Campanha', 'Status Site', 'Data Limite',
      'Link Briefing', 'Link Criativo', 'Link Site', 
      'Número BM', 'Comissão Paga', 'Site Pago', 'Descrição Problema'
    ]
    
    const csvContent = [
      headers.join(','),
      ...clientesComProblema.map(cliente => [
        cliente.id || '',
        cliente.data_venda || '',
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.site_status || '',
        cliente.data_limite || '',
        cliente.link_briefing || '', 
        cliente.link_criativo || '', 
        cliente.link_site || '', 
        cliente.numero_bm || '',
        cliente.comissao_paga ? 'Pago' : 'Não Pago',
        cliente.site_pago ? 'Pago' : 'Não Pago',
        cliente.descricao_problema || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `problemas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso"
    })
  }

  useEffect(() => {
    buscarClientesComProblema()
    
    // Configurar realtime para atualizações automáticas
    const channel = supabase
      .channel('problemas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes',
          filter: 'status_campanha=eq.Problema'
        },
        () => {
          console.log('🔄 [ProblemasPanel] Mudança detectada, atualizando lista...')
          buscarClientesComProblema()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gestorMode, user?.email, isAdmin])

  useEffect(() => {
    const checkConnection = () => {
      const connected = checkRealtimeConnection()
      setRealtimeConnected(connected)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Problemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando problemas...
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredClientes = getFilteredClientes()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {gestorMode ? 'Meus Problemas' : 'Todos os Problemas'} ({clientesComProblema.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientesComProblema.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>Nenhum problema pendente!</p>
            <p className="text-sm">Todos os clientes estão em ordem.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {editandoProblema && (
              <ProblemaDescricao
                clienteId={editandoProblema}
                descricaoAtual={problemaDescricao}
                onSave={handleProblemaDescricaoSave}
                onCancel={handleProblemaDescricaoCancel}
              />
            )}

            <TableActions
              selectedManager={gestorMode ? (user?.email || 'Gestor') : 'Admin'}
              filteredClientesCount={filteredClientes.length}
              realtimeConnected={realtimeConnected}
              onRefresh={buscarClientesComProblema}
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

            <div className="border rounded-lg overflow-hidden bg-card border-border">
              <div className="overflow-x-auto">
                <Table className="table-dark">
                  <TableHeader isAdmin={isAdmin} showEmailGestor={true} />
                  <TableBody>
                    {filteredClientes.length === 0 ? (
                      <TableRow className="border-border hover:bg-muted/20">
                        <TableCell colSpan={12} className="text-center py-8 text-white">
                          Nenhum problema encontrado com os filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClientes.map((cliente, index) => (
                        <ClienteRow
                          key={`problema-${cliente.id}-${index}`}
                          cliente={cliente}
                          selectedManager={gestorMode ? (user?.email || 'Gestor') : 'Admin'}
                          index={index}
                          isAdmin={isAdmin}
                          showEmailGestor={true}
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
                          onComissionToggle={handleComissionToggle}
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
        )}
      </CardContent>
    </Card>
  )
}
