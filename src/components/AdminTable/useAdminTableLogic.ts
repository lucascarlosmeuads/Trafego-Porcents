import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useAdminTableLogic() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [gestores, setGestores] = useState<Array<{ email: string, nome: string }>>([])
  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAllClientes()
    fetchGestores()
  }, [])

  const ensureCarolInGestoresList = (gestoresList: Array<{ email: string, nome: string }>) => {
    const hasCarol = gestoresList.some(g => g.email === 'carol@trafegoporcents.com')
    
    if (!hasCarol) {
      console.log('⚠️ [AdminTable] Carol não encontrada na lista, adicionando...')
      gestoresList.push({
        email: 'carol@trafegoporcents.com',
        nome: 'Carol'
      })
    }
    
    return gestoresList
  }

  const fetchGestores = async () => {
    try {
      console.log('🔍 [AdminTable] Buscando gestores ativos...')
      
      const { data, error } = await supabase
        .from('gestores')
        .select('email, nome')
        .eq('ativo', true)
        .order('nome')

      if (error) {
        console.error('❌ [AdminTable] Erro ao buscar gestores:', error)
        // Fallback com gestores essenciais
        const fallbackGestores = [
          { email: 'carol@trafegoporcents.com', nome: 'Carol' },
          { email: 'andreza@trafegoporcents.com', nome: 'Andreza' }
        ]
        console.log('🔄 [AdminTable] Usando fallback de gestores:', fallbackGestores)
        setGestores(fallbackGestores)
      } else {
        const gestoresData = data || []
        console.log('✅ [AdminTable] Gestores carregados:', gestoresData.length)
        console.log('📋 [AdminTable] Lista de gestores:', gestoresData)
        
        // Garantir que Carol está sempre na lista
        const gestoresComCarol = ensureCarolInGestoresList([...gestoresData])
        console.log('✅ [AdminTable] Lista final com Carol:', gestoresComCarol)
        
        setGestores(gestoresComCarol)
      }
    } catch (error) {
      console.error('💥 [AdminTable] Erro na consulta de gestores:', error)
      // Fallback em caso de erro
      const fallbackGestores = [
        { email: 'carol@trafegoporcents.com', nome: 'Carol' },
        { email: 'andreza@trafegoporcents.com', nome: 'Andreza' }
      ]
      console.log('🔄 [AdminTable] Usando fallback após erro:', fallbackGestores)
      setGestores(fallbackGestores)
    }
  }

  const fetchAllClientes = async () => {
    try {
      console.log('🔍 [AdminTable] Iniciando busca de TODOS os clientes...')
      setLoading(true)
      
      // Buscar o total de clientes primeiro para saber quantos temos
      const { count, error: countError } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('❌ Erro ao contar clientes:', countError)
      } else {
        console.log(`📊 [AdminTable] Total de clientes no banco: ${count}`)
      }

      // Buscar TODOS os clientes sem limite
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })
        // Remover qualquer limite implícito usando range para garantir que pegamos todos
        .range(0, 10000) // Aumentar significativamente o range para cobrir todos os clientes

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        // Properly format the data to ensure consistent date handling
        const formattedClientes = (data || []).map(cliente => ({
          ...cliente,
          // Ensure data_venda is properly formatted as string (YYYY-MM-DD)
          data_venda: cliente.data_venda ? String(cliente.data_venda) : null,
          // Ensure created_at is properly formatted as string
          created_at: cliente.created_at ? String(cliente.created_at) : null,
          // Ensure status_campanha is a string
          status_campanha: cliente.status_campanha ? String(cliente.status_campanha) : ''
        }))
        
        console.log(`✅ [AdminTable] Clientes carregados com sucesso: ${formattedClientes.length}`)
        console.log(`📋 [AdminTable] Comparação - Esperado: ${count || 'N/A'}, Carregado: ${formattedClientes.length}`)
        
        // Verificar se há discrepância
        if (count && formattedClientes.length < count) {
          console.warn(`⚠️ [AdminTable] ATENÇÃO: Carregados ${formattedClientes.length} de ${count} clientes totais`)
          toast({
            title: "Aviso",
            description: `Carregados ${formattedClientes.length} de ${count} clientes. Alguns podem não ter sido exibidos.`,
            variant: "default"
          })
        }
        
        setClientes(formattedClientes)
      }
    } catch (error) {
      console.error('❌ Erro na consulta:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = async (id: string, field: keyof Cliente, value: string) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(prev => prev.map(cliente => 
          cliente.id === id ? { ...cliente, [field]: value } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    }
  }

  const handleTransferirCliente = async (clienteId: string, novoEmailGestor: string) => {
    setTransferindoCliente(clienteId)
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ email_gestor: novoEmailGestor })
        .eq('id', clienteId)

      if (error) {
        console.error('❌ Erro ao transferir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao transferir cliente: ${error.message}`,
          variant: "destructive"
        })
      } else {
        setClientes(prev => prev.map(cliente => 
          cliente.id === clienteId ? { ...cliente, email_gestor: novoEmailGestor } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Cliente transferido com sucesso"
        })
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao transferir cliente",
        variant: "destructive"
      })
    } finally {
      setTransferindoCliente(null)
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    updateField(id, 'status_campanha', newStatus)
  }

  return {
    clientes,
    loading,
    gestores,
    transferindoCliente,
    handleTransferirCliente,
    handleStatusChange
  }
}
