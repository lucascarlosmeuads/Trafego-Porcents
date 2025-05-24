
import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { checkRealtimeConnection } from '@/utils/realtimeUtils'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableFilters } from './ClientesTable/TableFilters'
import { TableActions } from './ClientesTable/TableActions'
import { ClienteRow } from './ClientesTable/ClienteRow'

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

  // Log para debug quando os dados mudarem
  useEffect(() => {
    console.log(`🔍 ClientesTable: Total de clientes carregados para ${selectedManager}:`, clientes.length)
    console.log(`📊 Lista completa de IDs:`, clientes.map(c => c.id))
    
    if (clientes.length > 0) {
      console.log(`📊 Primeiros 5 clientes:`, clientes.slice(0, 5).map(c => ({ id: c.id, nome: c.nome_cliente })))
      console.log(`📊 Últimos 5 clientes:`, clientes.slice(-5).map(c => ({ id: c.id, nome: c.nome_cliente })))
    }
  }, [clientes, selectedManager])

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Log adicional para debug dos filtros
  useEffect(() => {
    console.log(`🔍 FILTROS aplicados - Busca: "${searchTerm}", Status: "${statusFilter}"`)
    console.log(`📊 RESULTADO: ${filteredClientes.length} clientes exibidos de ${clientes.length} total`)
  }, [filteredClientes, clientes, searchTerm, statusFilter])

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
      statusAtual: clienteAtual.status_campanha
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
      <TableActions
        selectedManager={selectedManager}
        filteredClientesCount={filteredClientes.length}
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

      <div className="border rounded-lg overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <Table className="table-dark">
            <TableHeader />
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow className="border-border hover:bg-muted/20">
                  <TableCell colSpan={12} className="text-center py-8 text-white">
                    {clientes.length === 0 
                      ? `Nenhum cliente encontrado para ${selectedManager}`
                      : `Nenhum cliente corresponde aos filtros aplicados (${clientes.length} clientes no total)`
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente, index) => {
                  console.log(`🎯 Renderizando cliente ${index + 1}/${filteredClientes.length}:`, {
                    id: cliente.id,
                    nome: cliente.nome_cliente,
                    index
                  })
                  
                  return (
                    <ClienteRow
                      key={`${selectedManager}-${cliente.id}-${index}`}
                      cliente={cliente}
                      selectedManager={selectedManager}
                      index={index}
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
                      onLinkEdit={handleLinkEdit}
                      onLinkSave={handleLinkSave}
                      onLinkCancel={handleLinkCancel}
                      onBMEdit={handleBMEdit}
                      onBMSave={handleBMSave}
                      onBMCancel={handleBMCancel}
                      onComissionToggle={handleComissionToggle}
                    />
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Debug info para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Debug: {clientes.length} total no hook, {filteredClientes.length} após filtros, {filteredClientes.length} renderizados na tabela
        </div>
      )}
    </div>
  )
}
