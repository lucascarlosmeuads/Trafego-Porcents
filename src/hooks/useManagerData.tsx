
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { determineManager } from '@/utils/managerUtils'
import { formatCliente, validateSecurityForNonAdmin } from '@/utils/clienteFormatter'
import { useClienteOperations } from '@/hooks/useClienteOperations'

export function useManagerData(userEmail: string, isAdmin: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string>('')

  const fetchClientes = async (showToast = false) => {
    if (!userEmail) return

    setLoading(true)
    setError(null)

    try {
      const { manager } = await determineManager(userEmail, selectedManager, isAdmin)
      
      setCurrentManager(manager)
      
      console.log('🔍 [useManagerData] Buscando dados da tabela todos_clientes:', { 
        userEmail, 
        manager, 
        selectedManager, 
        isAdmin 
      })
      
      // Construir query da tabela unificada todos_clientes
      let query = supabase
        .from('todos_clientes')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      // FILTRO CRÍTICO: Se não for admin, filtrar SEMPRE por email_gestor = email logado
      if (!isAdmin) {
        query = query.eq('email_gestor', userEmail)
        console.log('🔒 [useManagerData] APLICANDO FILTRO RLS OBRIGATÓRIO por email_gestor:', userEmail)
      } else {
        console.log('👑 [useManagerData] Admin - sem filtro de email_gestor')
      }

      const { data, error, count } = await query

      console.log('📊 [useManagerData] Resposta do Supabase (tabela todos_clientes):', {
        data: data?.length || 0,
        count,
        error,
        manager,
        filteredBy: !isAdmin ? userEmail : 'sem filtro (admin)',
        isAdmin
      })

      if (error) {
        console.error('❌ [useManagerData] Erro ao buscar clientes:', error)
        setError(`Erro ao carregar dados: ${error.message}`)
        setClientes([])
        if (showToast) {
          toast({
            title: "Erro",
            description: `Erro ao atualizar dados`,
            variant: "destructive"
          })
        }
      } else {
        console.log(`✅ [useManagerData] Dados recebidos para ${manager}:`, data?.length || 0)
        
        // VALIDAÇÃO DE SEGURANÇA: Para não-admins, verificar se todos os registros têm o email correto
        if (!validateSecurityForNonAdmin(data, userEmail, isAdmin)) {
          setError('Erro de segurança: dados inconsistentes detectados')
          setClientes([])
          return
        }
        
        const clientesFormatados = (data || []).map(formatCliente).filter(Boolean) as Cliente[]
        
        console.log(`🎯 [useManagerData] RESULTADO FINAL: ${clientesFormatados.length} clientes válidos para ${manager}`)
        
        if (clientesFormatados.length === 0 && !isAdmin) {
          console.log('ℹ️ [useManagerData] Nenhum cliente encontrado para este gestor')
          setError('Nenhum cliente atribuído a este gestor ainda.')
        }
        
        setClientes(clientesFormatados)
        
        if (showToast) {
          toast({
            title: "Sucesso",
            description: `Dados atualizados - ${clientesFormatados.length} registros`
          })
        }
      }
    } catch (err) {
      console.error('💥 [useManagerData] Erro na busca:', err)
      setError(`Erro ao carregar dados`)
      setClientes([])
      if (showToast) {
        toast({
          title: "Erro",
          description: `Erro ao atualizar dados`,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const { updateCliente, addCliente } = useClienteOperations(userEmail, isAdmin, () => fetchClientes())

  // Update local state after successful update
  const updateClienteWithLocalState = async (id: string, field: string, value: string | boolean | number) => {
    const success = await updateCliente(id, field, value)
    if (success) {
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id 
            ? { ...cliente, [field]: value }
            : cliente
        )
      )
    }
    return success
  }

  // Configurar listener de realtime para atualizações automáticas
  useEffect(() => {
    if (!userEmail) return

    const setupRealtime = async () => {
      const { manager } = await determineManager(userEmail, selectedManager, isAdmin)
      
      console.log('🔴 [useManagerData] Configurando realtime para tabela todos_clientes:', { userEmail, manager, selectedManager, isAdmin })

      // Buscar dados iniciais
      fetchClientes()

      // Configurar canal de realtime para a tabela unificada
      const channel = supabase
        .channel(`public:todos_clientes-${userEmail}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos_clientes'
          },
          (payload) => {
            console.log('🔄 [useManagerData] Mudança detectada na tabela todos_clientes:', payload)
            
            // FILTRO CRÍTICO: Se não for admin, verificar se a mudança é relevante para este gestor
            if (!isAdmin && payload.new && typeof payload.new === 'object' && 'email_gestor' in payload.new && payload.new.email_gestor !== userEmail) {
              console.log('🚫 [useManagerData] Mudança não relevante para este gestor - filtro de segurança aplicado')
              return
            }
            
            // Refresh data when changes occur
            fetchClientes()
          }
        )
        .subscribe((status) => {
          console.log(`📡 [useManagerData] Status do realtime para todos_clientes:`, status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ [useManagerData] Realtime conectado com sucesso!')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [useManagerData] Erro no canal de realtime')
            setTimeout(() => {
              console.log('🔄 [useManagerData] Tentando reconectar realtime...')
              fetchClientes()
            }, 2000)
          }
        })

      return () => {
        console.log('🧹 [useManagerData] Removendo canal de realtime para todos_clientes')
        supabase.removeChannel(channel)
      }
    }

    setupRealtime()
  }, [userEmail, selectedManager, isAdmin])

  const refetchWithToast = () => fetchClientes(true)

  return {
    clientes,
    loading,
    error,
    updateCliente: updateClienteWithLocalState,
    addCliente,
    refetch: refetchWithToast,
    currentManager
  }
}
