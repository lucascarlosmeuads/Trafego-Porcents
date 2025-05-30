
import { useState } from 'react'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MessageCircle, User, ArrowRight } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function GestorChatList() {
  const { conversas, loading } = useChatConversas()
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  const conversasFiltradas = conversas.filter(conversa =>
    conversa.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversa.email_cliente.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatLastMessageTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: ptBR })
    } else {
      return format(date, 'dd/MM', { locale: ptBR })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'otimização':
      case 'otimizacao':
        return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'agendamento':
        return 'bg-yellow-500 text-black hover:bg-yellow-600'
      case 'off':
        return 'bg-red-600 text-white hover:bg-red-700'
      case 'no ar':
        return 'bg-green-600 text-white hover:bg-green-700'
      case 'site':
        return 'bg-orange-600 text-white hover:bg-orange-700'
      case 'criativo':
        return 'bg-purple-600 text-white hover:bg-purple-700'
      case 'brief':
        return 'bg-indigo-600 text-white hover:bg-indigo-700'
      case 'problema':
        return 'bg-red-700 text-white hover:bg-red-800'
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700'
    }
  }

  if (selectedChat) {
    return (
      <div className="h-full">
        <ChatInterface
          emailCliente={selectedChat.email_cliente}
          emailGestor={user?.email || ''}
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
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Mensagens dos Clientes</h2>
        
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'Tente buscar por outro termo' : 'Aguarde seus clientes iniciarem conversas'}
            </p>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <Card 
              key={conversa.email_cliente}
              className="bg-gray-800 border-gray-700 hover:bg-gray-750 hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-400"
              onClick={() => setSelectedChat(conversa)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Lado esquerdo - Informações do cliente */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg md:h-14 md:w-14">
                      <User className="h-8 w-8 text-blue-300 md:h-7 md:w-7" />
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      {/* Nome e timestamp */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className="text-xl font-bold text-white truncate pr-2 mb-1 md:mb-0">
                          {conversa.nome_cliente}
                        </h3>
                        <span className="text-sm text-gray-400 flex-shrink-0">
                          {formatLastMessageTime(conversa.ultima_mensagem_data)}
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className="mb-4">
                        <Badge 
                          className={`text-base font-semibold px-4 py-2 ${getStatusBadgeVariant(conversa.status_campanha)}`}
                        >
                          {conversa.status_campanha}
                        </Badge>
                      </div>
                      
                      {/* Última mensagem */}
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lado direito - Indicadores */}
                  <div className="flex flex-col items-end gap-3 ml-4 flex-shrink-0">
                    {/* Badge de mensagens não lidas */}
                    {conversa.mensagens_nao_lidas > 0 && (
                      <Badge variant="destructive" className="text-sm font-bold px-3 py-2 min-w-[32px] h-8 flex items-center justify-center bg-red-600 text-white">
                        {conversa.mensagens_nao_lidas}
                      </Badge>
                    )}
                    
                    {/* Botão de chat */}
                    <div className="bg-blue-600 hover:bg-blue-700 hover:scale-105 rounded-full p-4 transition-all duration-200 shadow-lg">
                      <ArrowRight className="h-6 w-6 text-white" />
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
