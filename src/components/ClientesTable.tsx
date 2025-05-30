
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { TableHeader } from './ClientesTable/TableHeader'
import { TableFilters } from './ClientesTable/TableFilters'
import { AddClientModal } from './ClientesTable/AddClientModal'
import { AddClientRow } from './ClientesTable/AddClientRow'
import { ClienteRow } from './ClientesTable/ClienteRow'
import { BriefingModal } from './ClientesTable/BriefingModal'
import { BriefingMaterialsModal } from './ClientesTable/BriefingMaterialsModal'
import { ClienteComentariosModal } from './ClientesTable/ClienteComentariosModal'
import { ComissaoButton } from './ClientesTable/ComissaoButton'
import { useToast } from '@/hooks/use-toast'
import { useClienteData } from '@/hooks/useClienteData'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { RealtimeStatus } from './ClientesTable/RealtimeStatus'

interface ClientesTableProps {
  userEmail: string
  isAdmin: boolean
  isGestorDashboard?: boolean
}

export function ClientesTable({ userEmail, isAdmin, isGestorDashboard = false }: ClientesTableProps) {
  const { toast } = useToast()
  const { 
    clientes, 
    loading, 
    error, 
    refetchData, 
    totalClientes,
    isConnected 
  } = useClienteData(userEmail, isAdmin, isGestorDashboard)
  
  const { updateCliente } = useClienteOperations(userEmail, isAdmin, refetchData)

  // Estados para modais e operações
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedBriefingCliente, setSelectedBriefingCliente] = useState<string | null>(null)
  const [selectedMaterialsCliente, setSelectedMaterialsCliente] = useState<string | null>(null)
  const [selectedComentariosCliente, setSelectedComentariosCliente] = useState<{ id: string; nome: string } | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')

  // Estados para comissão
  const [updatingComission, setUpdatingComission] = useState<string | null>(null)
  const [editingComissionValue, setEditingComissionValue] = useState<string | null>(null)
  const [comissionValueInput, setComissionValueInput] = useState('')

  // FUNÇÃO PRINCIPAL PARA TOGGLE DE COMISSÃO COM MÁXIMA SEGURANÇA
  const handleComissionToggle = async (clienteId: string, currentStatus: boolean): Promise<boolean> => {
    console.log('🚀 [ClientesTable] === INICIANDO TOGGLE COMISSÃO ===')
    console.log('📋 [ClientesTable] Parâmetros recebidos:', {
      clienteId,
      clienteIdType: typeof clienteId,
      currentStatus,
      timestamp: new Date().toISOString()
    })
    
    // VALIDAÇÃO CRÍTICA: Verificar se o cliente existe ANTES de qualquer operação
    const clienteIdNum = parseInt(clienteId)
    if (isNaN(clienteIdNum)) {
      console.error('❌ [ClientesTable] ID do cliente inválido:', clienteId)
      toast({
        title: "Erro",
        description: "ID do cliente inválido",
        variant: "destructive",
      })
      return false
    }

    console.log('🔍 [ClientesTable] Buscando cliente na lista:', {
      clienteId,
      clienteIdNum,
      totalClientes: clientes.length,
      primeiros5Clientes: clientes.slice(0, 5).map(c => ({ 
        id: c.id, 
        nome: c.nome_cliente, 
        comissao: c.comissao 
      }))
    })
    
    // BUSCA SEGURA DO CLIENTE
    const cliente = clientes.find(c => c.id === clienteIdNum)
    if (!cliente) {
      console.error('❌ [ClientesTable] Cliente não encontrado na lista:', {
        clienteIdBuscado: clienteIdNum,
        idsDisponiveis: clientes.map(c => ({ id: c.id, nome: c.nome_cliente }))
      })
      toast({
        title: "Erro",
        description: "Cliente não encontrado na lista atual",
        variant: "destructive",
      })
      return false
    }

    // VALIDAÇÃO DUPLA: Verificar se o estado atual corresponde ao esperado
    const isCurrentlyPago = cliente.comissao === 'Pago'
    console.log('🔍 [ClientesTable] Validação do estado atual:', {
      clienteNome: cliente.nome_cliente,
      comissaoAtual: cliente.comissao,
      isCurrentlyPago,
      currentStatusParam: currentStatus,
      estadosCorrespondem: isCurrentlyPago === currentStatus
    })

    if (isCurrentlyPago !== currentStatus) {
      console.warn('⚠️ [ClientesTable] Estado divergente detectado - continuando com estado atual da base')
    }

    // Determinar novo status baseado no estado REAL do cliente
    const newComissaoStatus = isCurrentlyPago ? 'Pendente' : 'Pago'
    
    console.log('💰 [ClientesTable] Executando alteração:', {
      clienteId,
      clienteNome: cliente.nome_cliente,
      comissaoAtual: cliente.comissao,
      novoStatus: newComissaoStatus,
      operacao: isCurrentlyPago ? 'Pago → Pendente' : 'Pendente → Pago'
    })

    setUpdatingComission(clienteId)
    
    try {
      // EXECUTAR ATUALIZAÇÃO COM VALIDAÇÃO TRIPLA
      const success = await updateCliente(clienteId, 'comissao', newComissaoStatus)
      
      if (success) {
        console.log('✅ [ClientesTable] Comissão atualizada com sucesso!')
        console.log('📊 [ClientesTable] Resultado:', {
          clienteId,
          clienteNome: cliente.nome_cliente,
          statusAnterior: cliente.comissao,
          statusNovo: newComissaoStatus,
          timestamp: new Date().toISOString()
        })
        
        toast({
          title: "Sucesso",
          description: `Comissão ${newComissaoStatus.toLowerCase()} para ${cliente.nome_cliente}`,
        })

        // REFRESH FORÇADO DOS DADOS APÓS SUCESSO
        setTimeout(() => {
          console.log('🔄 [ClientesTable] Executando refresh forçado...')
          refetchData()
        }, 500)
        
        return true
      } else {
        console.error('❌ [ClientesTable] Falha na atualização da comissão')
        return false
      }
    } catch (error) {
      console.error('💥 [ClientesTable] Erro crítico ao atualizar comissão:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar comissão",
        variant: "destructive",
      })
      return false
    } finally {
      setUpdatingComission(null)
      console.log('🏁 [ClientesTable] === TOGGLE COMISSÃO FINALIZADO ===')
    }
  }

  // FUNÇÃO PARA EDITAR VALOR DA COMISSÃO
  const handleComissionValueEdit = (clienteId: string, currentValue: number) => {
    console.log('✏️ [ClientesTable] Iniciando edição de valor:', {
      clienteId,
      currentValue,
      timestamp: new Date().toISOString()
    })
    
    setEditingComissionValue(clienteId)
    setComissionValueInput(currentValue.toString())
  }

  // FUNÇÃO PARA SALVAR NOVO VALOR DA COMISSÃO
  const handleComissionValueSave = async (clienteId: string, newValue: number) => {
    console.log('💾 [ClientesTable] Salvando novo valor de comissão:', {
      clienteId,
      newValue,
      timestamp: new Date().toISOString()
    })

    const success = await updateCliente(clienteId, 'valor_comissao', newValue)
    if (success) {
      setEditingComissionValue(null)
      setComissionValueInput('')
      
      toast({
        title: "Sucesso",
        description: `Valor da comissão atualizado para R$ ${newValue.toFixed(2)}`,
      })

      // Refresh dos dados
      setTimeout(() => {
        refetchData()
      }, 500)
    }
  }

  // FUNÇÃO PARA CANCELAR EDIÇÃO DE VALOR
  const handleComissionValueCancel = () => {
    console.log('❌ [ClientesTable] Cancelando edição de valor')
    setEditingComissionValue(null)
    setComissionValueInput('')
  }

  // Filtros e ordenação
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch = cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.telefone?.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
      const matchesManager = managerFilter === 'all' || cliente.email_gestor === managerFilter
      
      return matchesSearch && matchesStatus && matchesManager
    })
  }, [clientes, searchTerm, statusFilter, managerFilter])

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl text-card-foreground">
              Lista de Clientes ({filteredClientes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <RealtimeStatus isConnected={isConnected} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            managerFilter={managerFilter}
            setManagerFilter={setManagerFilter}
            clientes={clientes}
            onAddClient={() => setIsAddModalOpen(true)}
            onAddClientRow={() => setShowAddRow(true)}
            isAdmin={isAdmin}
            isGestorDashboard={isGestorDashboard}
          />
          
          <div className="rounded-md border border-border bg-background">
            <TableHeader />
            
            <div className="divide-y divide-border">
              {showAddRow && (
                <AddClientRow 
                  userEmail={userEmail} 
                  isAdmin={isAdmin}
                  onCancel={() => setShowAddRow(false)}
                  onSuccess={() => {
                    setShowAddRow(false)
                    refetchData()
                  }}
                />
              )}
              
              {filteredClientes.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  isAdmin={isAdmin}
                  isGestorDashboard={isGestorDashboard}
                  onBriefingClick={(clienteEmail) => setSelectedBriefingCliente(clienteEmail)}
                  onMaterialsClick={(clienteEmail) => setSelectedMaterialsCliente(clienteEmail)}
                  onComentariosClick={(clienteId, clienteNome) => 
                    setSelectedComentariosCliente({ id: clienteId, nome: clienteNome })
                  }
                  userEmail={userEmail}
                  refetchData={refetchData}
                  comissaoButton={
                    <ComissaoButton
                      cliente={cliente}
                      isGestorDashboard={isGestorDashboard}
                      updatingComission={updatingComission}
                      editingComissionValue={editingComissionValue}
                      comissionValueInput={comissionValueInput}
                      setComissionValueInput={setComissionValueInput}
                      onComissionToggle={handleComissionToggle}
                      onComissionValueEdit={handleComissionValueEdit}
                      onComissionValueSave={handleComissionValueSave}
                      onComissionValueCancel={handleComissionValueCancel}
                    />
                  }
                />
              ))}
              
              {filteredClientes.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onSuccess={refetchData}
      />

      {selectedBriefingCliente && (
        <BriefingModal
          clienteEmail={selectedBriefingCliente}
          onClose={() => setSelectedBriefingCliente(null)}
        />
      )}

      {selectedMaterialsCliente && (
        <BriefingMaterialsModal
          clienteEmail={selectedMaterialsCliente}
          onClose={() => setSelectedMaterialsCliente(null)}
        />
      )}

      {selectedComentariosCliente && (
        <ClienteComentariosModal
          clienteId={selectedComentariosCliente.id}
          clienteNome={selectedComentariosCliente.nome}
          onClose={() => setSelectedComentariosCliente(null)}
        />
      )}
    </div>
  )
}
