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
  filterType?: 'ativos' | 'inativos' | 'problemas' | 'saques-pendentes' | 'sites-pendentes' | 'sites-finalizados'
}

export function ClientesTable({ selectedManager, userEmail, filterType }: ClientesTableProps) {
  const { isAdmin, user } = useAuth()
  
  const emailToUse = userEmail || user?.email || ''
  const managerName = selectedManager || 'Próprios dados'
  
  // ✅ CORREÇÃO: Contexto de sites SEMPRE usa busca global
  const isSitesContext = filterType === 'sites-pendentes' || 
                        filterType === 'sites-finalizados' ||
                        emailToUse.includes('criador') || 
                        emailToUse.includes('site') || 
                        emailToUse.includes('webdesign')
  
  console.log('🔍 [ClientesTable] Configuração de acesso:', {
    isAdmin,
    emailToUse,
    selectedManager,
    userEmail: user?.email,
    filterType,
    isSitesContext
  })
  
  // ✅ CORREÇÃO: Para sites, passar o filterType específico
  const { clientes, loading, error, updateCliente, addCliente, refetch, currentManager } = useManagerData(
    emailToUse, 
    isAdmin, 
    selectedManager,
    filterType === 'sites-pendentes' ? 'sites-pendentes' : 
    filterType === 'sites-finalizados' ? 'sites-finalizados' : 
    undefined
  )
  
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

  let clientesFiltrados = clientes
  if (filterType === 'ativos') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha !== 'Cliente Sumiu' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema' &&
      cliente.status_campanha !== 'Saque Pendente' &&
      cliente.status_campanha !== 'Campanha Anual'
    )
  } else if (filterType === 'inativos') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha === 'Cliente Sumiu' || 
      cliente.status_campanha === 'Reembolso'
    )
  } else if (filterType === 'problemas') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha === 'Problema'
    )
  } else if (filterType === 'saques-pendentes') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.status_campanha === 'Saque Pendente' ||
      cliente.status_campanha === 'Campanha Anual'
    )
  } else if (filterType === 'sites-pendentes') {
    clientesFiltrados = clientes.filter(cliente => 
      cliente.site_status === 'aguardando_link'
    )
  } else if (filterType === 'sites-finalizados') {
    console.log('🌐 [ClientesTable] Aplicando filtro de sites finalizados - usando dados já filtrados do useManagerData')
    console.log('📊 [ClientesTable] Total de clientes recebidos do useManagerData:', clientes.length)
    clientesFiltrados = clientes
  } else {
    const clientesAtivos = clientes.filter(cliente => 
      cliente.status_campanha !== 'Cliente Sumiu' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema' &&
      cliente.status_campanha !== 'Saque Pendente' &&
      cliente.status_campanha !== 'Campanha Anual'
    )
    
    const clientesInativos = clientes.filter(cliente => 
      cliente.status_campanha === 'Cliente Sumiu' || 
      cliente.status_campanha === 'Reembolso'
    )

    return renderWithTabs(clientesAtivos, clientesInativos)
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
    const clientesAtivos = clientes.filter(cliente => 
      cliente.status_campanha !== 'Cliente Sumiu' && 
      cliente.status_campanha !== 'Reembolso' && 
      cliente.status_campanha !== 'Problema' &&
      cliente.status_campanha !== 'Saque Pendente' &&
      cliente.status_campanha !== 'Campanha Anual'
    )
    
    const clientesInativos = clientes.filter(cliente => 
      cliente.status_campanha === 'Cliente Sumiu' || 
      cliente.status_campanha === 'Reembolso'
    )

    return renderWithTabs(clientesAtivos, clientesInativos)
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
