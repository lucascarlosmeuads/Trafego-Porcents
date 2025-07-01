
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ClienteOrigem {
  cliente_id: string
  origem: 'appmax' | 'manual'
  created_at?: string
  pedido_id?: string
}

export function useClienteOrigem() {
  const [origens, setOrigens] = useState<Map<string, ClienteOrigem>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrigens()
  }, [])

  const fetchOrigens = async () => {
    try {
      console.log('🔍 [useClienteOrigem] Buscando origens dos clientes...')
      
      // Buscar todos os clientes criados via AppMax
      const { data: appMaxClientes, error } = await supabase
        .from('max_integration_logs')
        .select('cliente_criado_id, created_at, pedido_id')
        .not('cliente_criado_id', 'is', null)

      if (error) {
        console.error('❌ [useClienteOrigem] Erro ao buscar logs do AppMax:', error)
        return
      }

      const origensMap = new Map<string, ClienteOrigem>()

      // Mapear clientes do AppMax
      if (appMaxClientes) {
        appMaxClientes.forEach(log => {
          if (log.cliente_criado_id) {
            origensMap.set(log.cliente_criado_id.toString(), {
              cliente_id: log.cliente_criado_id.toString(),
              origem: 'appmax',
              created_at: log.created_at,
              pedido_id: log.pedido_id
            })
          }
        })
      }

      console.log(`✅ [useClienteOrigem] Encontrados ${origensMap.size} clientes do AppMax`)
      setOrigens(origensMap)
    } catch (error) {
      console.error('💥 [useClienteOrigem] Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const getClienteOrigem = (clienteId: string): ClienteOrigem => {
    return origens.get(clienteId) || {
      cliente_id: clienteId,
      origem: 'manual'
    }
  }

  return {
    origens,
    loading,
    getClienteOrigem,
    refetch: fetchOrigens
  }
}
