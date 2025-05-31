
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/lib/supabase'

export function useMultipleCreativeFiles(clientes: Cliente[]) {
  const [clientesWithCreatives, setClientesWithCreatives] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCreativeFiles = async () => {
      if (!clientes || clientes.length === 0) {
        setClientesWithCreatives({})
        setLoading(false)
        return
      }

      try {
        const emailsClientes = clientes
          .map(c => c.email_cliente)
          .filter(email => email && email.trim() !== '')

        if (emailsClientes.length === 0) {
          setClientesWithCreatives({})
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('arquivos_cliente')
          .select('email_cliente')
          .in('email_cliente', emailsClientes)
          .eq('author_type', 'gestor')
          .in('tipo_arquivo', ['image', 'video', 'pdf'])

        if (error) {
          console.error('Erro ao buscar arquivos criativos:', error)
          setClientesWithCreatives({})
        } else {
          const creativesMap: Record<string, boolean> = {}
          
          // Inicializar todos os clientes como false
          emailsClientes.forEach(email => {
            creativesMap[email] = false
          })
          
          // Marcar como true os que têm arquivos
          if (data) {
            data.forEach(arquivo => {
              if (arquivo.email_cliente) {
                creativesMap[arquivo.email_cliente] = true
              }
            })
          }
          
          setClientesWithCreatives(creativesMap)
        }
      } catch (error) {
        console.error('Erro ao buscar arquivos criativos:', error)
        setClientesWithCreatives({})
      } finally {
        setLoading(false)
      }
    }

    fetchCreativeFiles()
  }, [clientes])

  return { clientesWithCreatives, loading }
}
