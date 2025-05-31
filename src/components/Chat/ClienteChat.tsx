
import { useState, useEffect } from 'react'
import { ChatInterface } from './ChatInterface'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export function ClienteChat() {
  const { user } = useAuth()
  const [clienteData, setClienteData] = useState<{
    nome_cliente: string
    email_gestor: string
    status_campanha: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

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

  // Mobile: mostrar lista de chats ou chat específico
  if (!showChat) {
    return (
      <div className="h-full flex flex-col">
        {/* Header mobile */}
        <div className="bg-card border-b p-4 md:hidden">
          <h2 className="text-xl font-bold text-card-foreground">Conversas</h2>
          <p className="text-sm text-muted-foreground">
            Converse com seu gestor sobre sua campanha
          </p>
        </div>

        {/* Lista de conversas (por enquanto só uma) */}
        <div className="flex-1 p-4">
          <Button
            onClick={() => setShowChat(true)}
            className="w-full justify-start h-auto p-4 bg-card hover:bg-accent border border-border"
            variant="outline"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-card-foreground">
                  Conversa com Gestor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Status: {clienteData.status_campanha}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toque para abrir o chat
                </p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    )
  }

  // Chat específico
  return (
    <div className="h-full flex flex-col">
      {/* Header com botão voltar - mobile */}
      <div className="bg-card border-b p-3 flex items-center gap-3 md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowChat(false)}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-card-foreground truncate">
            Chat com Gestor
          </h2>
          <p className="text-xs text-muted-foreground">
            {clienteData.status_campanha}
          </p>
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          emailCliente={user?.email || ''}
          emailGestor={clienteData.email_gestor}
          nomeCliente={clienteData.nome_cliente}
          statusCampanha={clienteData.status_campanha}
          onBack={() => setShowChat(false)}
          showBackButton={false} // Já temos o header customizado
        />
      </div>
    </div>
  )
}
