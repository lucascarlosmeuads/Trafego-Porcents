
import { useState, useEffect } from 'react'
import { ChatInterface } from './ChatInterface'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export function ClienteChat() {
  const { user } = useAuth()
  const [clienteData, setClienteData] = useState<{
    nome_cliente: string
    email_gestor: string
    status_campanha: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDadosCliente = async () => {
      if (!user?.email) return

      try {
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('nome_cliente, email_gestor, status_campanha')
          .eq('email_cliente', user.email)
          .single()

        if (error) throw error
        setClienteData(data)
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosCliente()
  }, [user?.email])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando chat...</p>
        </div>
      </div>
    )
  }

  if (!clienteData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Dados do cliente não encontrados</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatInterface
        emailCliente={user?.email || ''}
        emailGestor={clienteData.email_gestor}
        nomeCliente={clienteData.nome_cliente}
        statusCampanha={clienteData.status_campanha}
      />
    </div>
  )
}
