
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatInterface } from './ChatInterface'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, User, ArrowRight, Users } from 'lucide-react'
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'otimização':
      case 'otimizacao':
        return 'bg-blue-500 text-white hover:bg-blue-600'
      case 'agendamento':
        return 'bg-yellow-500 text-white hover:bg-yellow-600'
      case 'off':
        return 'bg-red-500 text-white hover:bg-red-600'
      case 'no ar':
        return 'bg-green-500 text-white hover:bg-green-600'
      case 'site':
        return 'bg-orange-500 text-white hover:bg-orange-600'
      case 'criativo':
        return 'bg-purple-500 text-white hover:bg-purple-600'
      case 'brief':
        return 'bg-indigo-500 text-white hover:bg-indigo-600'
      case 'problema':
        return 'bg-red-600 text-white hover:bg-red-700'
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600'
    }
  }

  const getGestorNome = () => {
    const gestor = gestores.find(g => g.email === selectedGestor)
    return gestor ? gestor.nome : selectedGestor
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Visão Geral dos Chats</h2>
        
        {/* Seletor de gestor */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Selecionar Gestor:</label>
          <Select value={selectedGestor} onValueChange={setSelectedGestor}>
            <SelectTrigger className="h-12 text-base">
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

        {/* Info do gestor selecionado */}
        {selectedGestor && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Conversas de {getGestorNome()}
              </span>
              <Badge variant="outline" className="ml-2">
                {chatsGestor.length} cliente{chatsGestor.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedGestor ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecione um gestor
            </h3>
            <p className="text-gray-500">
              Escolha um gestor acima para visualizar as conversas
            </p>
          </div>
        ) : chatsGestor.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-gray-500">
              Este gestor ainda não possui conversas
            </p>
          </div>
        ) : (
          chatsGestor.map((chat) => (
            <Card 
              key={chat.email_cliente}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
              onClick={() => setSelectedChat(chat)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Lado esquerdo - Informações do cliente */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="h-7 w-7 text-blue-600" />
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      {/* Nome e timestamp */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
                          {chat.nome_cliente}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatLastMessageTime(chat.ultima_mensagem_data || '')}
                        </span>
                      </div>
                      
                      {/* Status e email */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge 
                          className={`text-sm font-semibold px-3 py-1 ${getStatusBadgeVariant(chat.status_campanha)}`}
                        >
                          {chat.status_campanha}
                        </Badge>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {chat.email_cliente}
                        </span>
                      </div>
                      
                      {/* Última mensagem */}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {chat.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lado direito - Indicadores */}
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    {/* Total de mensagens */}
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
                      {chat.total_mensagens} msg{chat.total_mensagens !== 1 ? 's' : ''}
                    </Badge>
                    
                    {/* Ícone de chat */}
                    <div className="bg-blue-50 hover:bg-blue-100 rounded-full p-2 transition-colors">
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
