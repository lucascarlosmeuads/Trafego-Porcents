
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mensagens dos Clientes</h2>
        
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente buscar por outro termo' : 'Aguarde seus clientes iniciarem conversas'}
            </p>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <Card 
              key={conversa.email_cliente}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
              onClick={() => setSelectedChat(conversa)}
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
                          {conversa.nome_cliente}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatLastMessageTime(conversa.ultima_mensagem_data)}
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className="mb-3">
                        <Badge 
                          className={`text-sm font-semibold px-3 py-1 ${getStatusBadgeVariant(conversa.status_campanha)}`}
                        >
                          {conversa.status_campanha}
                        </Badge>
                      </div>
                      
                      {/* Última mensagem */}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lado direito - Indicadores */}
                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    {/* Badge de mensagens não lidas */}
                    {conversa.mensagens_nao_lidas > 0 && (
                      <Badge variant="destructive" className="text-xs font-bold px-2 py-1 min-w-[24px] h-6 flex items-center justify-center">
                        {conversa.mensagens_nao_lidas}
                      </Badge>
                    )}
                    
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
