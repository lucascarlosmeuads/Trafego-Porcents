import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { formatCliente, validateSecurityForNonAdmin } from '@/utils/clienteFormatter'
import { useClienteOperations } from '@/hooks/useClienteOperations'

interface AddClienteResult {
  success: boolean
  error?: string
  clientData?: any
  senhaDefinida?: boolean
}

interface UseManagerDataReturn {
  clientes: Cliente[]
  loading: boolean
  error: any
  totalClientes: number
  refetch: () => Promise<void>
  updateCliente: (clienteId: string, field: string, value: any) => Promise<boolean>
  addCliente: (clienteData: any) => Promise<AddClienteResult>
  currentManager: string | null
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>
}

export function useManagerData(
  userEmail?: string,
  isAdminUser?: boolean,
  selectedManager?: string,
  filterType?: 'sites-pendentes' | 'sites-finalizados'
): UseManagerDataReturn {
  // TODOS os hooks devem ser chamados primeiro, sem condições
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [totalClientes, setTotalClientes] = useState(0)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Hook de autenticação sempre chamado
  const { user, isAdmin } = useAuth()

  // Determine the actual user email and admin status
  const actualUserEmail = userEmail || user?.email || ''
  const actualIsAdmin = isAdminUser !== undefined ? isAdminUser : isAdmin
  const currentManager = selectedManager || null

  // Define refetch function
  const refetch = async () => {
    setForceUpdate(prev => prev + 1)
  }

  // Get client operations - agora com parâmetros válidos sempre
  const { updateCliente, addCliente } = useClienteOperations(
    actualUserEmail || 'fallback@example.com', 
    actualIsAdmin || false, 
    refetch
  )

  useEffect(() => {
    fetchClientes()
  }, [actualUserEmail, forceUpdate, selectedManager, filterType])

  const fetchClientes = async () => {
    if (!actualUserEmail) {
      console.log('🚫 [useManagerData] Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fetchedClientes = await fetchAllDataInChunks()
      setClientes(fetchedClientes)
      setTotalClientes(fetchedClientes.length)
      console.log(`✅ [useManagerData] Clientes carregados com sucesso: ${fetchedClientes.length}`)
    } catch (err: any) {
      setError(err)
      console.error('❌ [useManagerData] Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllDataInChunks = async (chunkSize: number = 1000) => {
    const allData: Cliente[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      console.log(`🔄 [useManagerData] Buscando chunk ${from} a ${from + chunkSize - 1}`)
      
      let query = supabase
        .from('todos_clientes')
        .select(`
          *,
          eh_ultimo_pago
        `)
        .range(from, from + chunkSize - 1)
        .order('created_at', { ascending: false })

      // Apply filters based on context
      if (filterType === 'sites-pendentes') {
        query = query.eq('site_status', 'aguardando_link')
      } else if (filterType === 'sites-finalizados') {
        query = query.eq('site_status', 'finalizado')
      } else if (!actualIsAdmin) {
        // Non-admin users only see their own clients
        query = query.eq('email_gestor', actualUserEmail)
      } else if (actualIsAdmin && selectedManager && selectedManager !== 'Todos os Gestores' && selectedManager !== 'Todos os Clientes') {
        // Admin viewing specific manager's clients
        query = query.eq('email_gestor', selectedManager)
      }

      const { data, error } = await query

      if (error) {
        console.error(`❌ [useManagerData] Erro no chunk ${from}:`, error)
        throw error
      }

      if (data && data.length > 0) {
        // CORREÇÃO 5: Log detalhado dos dados recebidos
        const clientesComUltimoPago = data.filter(cliente => cliente.eh_ultimo_pago === true)
        if (clientesComUltimoPago.length > 0) {
          console.log(`⭐ [useManagerData] Chunk ${from}: ${clientesComUltimoPago.length} clientes com último pago:`, 
            clientesComUltimoPago.map(c => ({ id: c.id, nome: c.nome_cliente, eh_ultimo_pago: c.eh_ultimo_pago }))
          )
        }
        
        allData.push(...data)
        console.log(`✅ [useManagerData] Chunk ${from}: ${data.length} registros`)
        
        if (data.length < chunkSize) {
          hasMore = false
        } else {
          from += chunkSize
        }
      } else {
        hasMore = false
      }
    }

    console.log(`🎯 [useManagerData] Total de registros carregados: ${allData.length}`)
    
    // CORREÇÃO 6: Log final dos clientes com último pago
    const totalUltimoPago = allData.filter(cliente => cliente.eh_ultimo_pago === true)
    console.log(`⭐ [useManagerData] Total de clientes com último pago carregados: ${totalUltimoPago.length}`)
    
    return allData
  }

  return {
    clientes,
    loading,
    error,
    totalClientes,
    refetch,
    updateCliente,
    addCliente,
    currentManager,
    setClientes,
  }
}
