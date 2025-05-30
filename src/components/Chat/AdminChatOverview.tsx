
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatInterface } from './ChatInterface'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GestorData {
  email: string
  nome: string
}

interface ChatData {
  email_cliente: string
  nome_cliente: string
  status_campanha: string
  ultima_mensagem?: string
  ultima_mensagem_data?: string
  total_mensagens: number
}

export function AdminChatOverview() {
  const [gestores, setGestores] = useState<GestorData[]>([])
  const [selectedGestor, setSelectedGestor] = useState<string>('')
  const [chatsGestor, setChatsGestor] = useState<ChatData[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar gestores
  useEffect(() => {
    const carregarGestores = async () => {
      try {
        const { data, error } = await supabase
          .from('gestores')
          .select('email, nome')
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        setGestores(data || [])
      } catch (error) {
        console.error('Erro ao carregar gestores:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarGestores()
  }, [])

  // Carregar chats do gestor selecionado
  useEffect(() => {
    const carregarChatsGestor = async () => {
      if (!selectedGestor) {
        setChatsGestor([])
        return
      }

      try {
        // Buscar clientes do gestor
        const { data: clientes, error: clientesError } = await supabase
          .from('todos_clientes')
          .select('email_cliente, nome_cliente, status_campanha')
          .eq('email_gestor', selectedGestor)

        if (clientesError) throw clientesError

        // Para cada cliente, buscar dados de chat
        const chatsComDados = await Promise.all(
          (clientes || []).map(async (cliente) => {
            // Buscar última mensagem
            const { data: ultimaMensagem } = await supabase
              .from('chat_mensagens')
              .select('conteudo, created_at')
              .eq('email_cliente', cliente.email_cliente)
              .eq('email_gestor', selectedGestor)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            // Contar total de mensagens
            const { count: totalMensagens } = await supabase
              .from('chat_mensagens')
              .select('*', { count: 'exact', head: true })
              .eq('email_cliente', cliente.email_cliente)
              .eq('email_gestor', selectedGestor)

            return {
              email_cliente: cliente.email_cliente,
              nome_cliente: cliente.nome_cliente,
              status_campanha: cliente.status_campanha,
              ultima_mensagem: ultimaMensagem?.conteudo || '',
              ultima_mensagem_data: ultimaMensagem?.created_at || '',
              total_mensagens: totalMensagens || 0
            }
          })
        )

        setChatsGestor(chatsComDados)
      } catch (error) {
        console.error('Erro ao carregar chats do gestor:', error)
      }
    }

    carregarChatsGestor()
  }, [selectedGestor])

  const formatLastMessageTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: ptBR })
    } else {
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    }
  }

  if (selectedChat && selectedGestor) {
    return (
      <div className="h-full">
        <ChatInterface
          emailCliente={selectedChat.email_cliente}
          emailGestor={selectedGestor}
          nomeCliente={selectedChat.nome_cliente}
          statusCampanha={selectedChat.status_campanha}
          onBack={() => setSelectedChat(null)}
          showBackButton={true}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold mb-4">Visão Geral dos Chats</h2>
        
        {/* Seletor de gestor */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar Gestor:</label>
          <Select value={selectedGestor} onValueChange={setSelectedGestor}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um gestor para ver os chats" />
            </SelectTrigger>
            <SelectContent>
              {gestores.map((gestor) => (
                <SelectItem key={gestor.email} value={gestor.email}>
                  {gestor.nome} ({gestor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        {!selectedGestor ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Selecione um gestor para ver os chats</p>
          </div>
        ) : chatsGestor.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Este gestor ainda não possui conversas</p>
          </div>
        ) : (
          chatsGestor.map((chat) => (
            <Button
              key={chat.email_cliente}
              variant="ghost"
              className="w-full p-4 h-auto justify-start border-b rounded-none hover:bg-gray-50"
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.nome_cliente}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {chat.total_mensagens} msgs
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.ultima_mensagem_data || '')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {chat.status_campanha}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {chat.email_cliente}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {chat.ultima_mensagem || 'Nenhuma mensagem ainda'}
                  </p>
                </div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
