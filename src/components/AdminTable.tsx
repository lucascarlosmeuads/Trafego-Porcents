
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { useAuth } from '@/hooks/useAuth'
import { AdminTableHeader } from './AdminTable/AdminTableHeader'
import { AdminMobileCards } from './AdminTable/AdminMobileCards'
import { AdminDesktopTable } from './AdminTable/AdminDesktopTable'
import { formatDate, getStatusColor } from './AdminTable/AdminTableUtils'

export function AdminTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [deletingCliente, setDeletingCliente] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()

  const fetchAllClientes = async () => {
    console.log('Carregando todos os clientes da tabela unificada...')
    try {
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        console.log('Dados carregados da tabela unificada:', data?.length || 0, 'registros')
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro na consulta:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const { deleteCliente } = useClienteOperations(user?.email || '', isAdmin, fetchAllClientes)

  useEffect(() => {
    fetchAllClientes()
  }, [])

  const handleDeleteCliente = async (clienteId: string): Promise<boolean> => {
    setDeletingCliente(clienteId)
    try {
      const success = await deleteCliente(clienteId)
      return success
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      return false
    } finally {
      setDeletingCliente(null)
    }
  }

  const updateField = async (id: string, field: keyof Cliente, value: string) => {
    try {
      console.log(`Atualizando cliente admin ${id}: ${field} = ${value}`)
      
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(prev => prev.map(cliente => 
          cliente.id === id ? { ...cliente, [field]: value } : cliente
        ))
        console.log('Campo atualizado com sucesso na tabela unificada')
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Admin alterando status do cliente ${id} para: ${newStatus}`)
    updateField(id, 'status_campanha', newStatus)
  }

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

  return (
    <Card className="w-full bg-card border-border">
      <AdminTableHeader 
        clientesCount={clientes.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClienteAdicionado={fetchAllClientes}
      />
      <CardContent className="p-0 sm:p-6">
        {/* Visualização em cartões para mobile */}
        {viewMode === 'cards' && (
          <AdminMobileCards
            clientes={clientes}
            onDeleteCliente={handleDeleteCliente}
            deletingCliente={deletingCliente}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Tabela para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'}`}>
          <AdminDesktopTable
            clientes={clientes}
            onDeleteCliente={handleDeleteCliente}
            deletingCliente={deletingCliente}
            onStatusChange={handleStatusChange}
            formatDate={formatDate}
          />
        </div>
        
        {clientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
