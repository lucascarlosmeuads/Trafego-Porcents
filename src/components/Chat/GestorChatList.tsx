
import { useState } from 'react'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MessageCircle, User } from 'lucide-react'
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold mb-3">Mensagens dos Clientes</h2>
        
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Tente buscar por outro termo' : 'Aguarde seus clientes iniciarem conversas'}
            </p>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <Button
              key={conversa.email_cliente}
              variant="ghost"
              className="w-full p-4 h-auto justify-start border-b rounded-none hover:bg-gray-50"
              onClick={() => setSelectedChat(conversa)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversa.nome_cliente}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conversa.mensagens_nao_lidas > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversa.mensagens_nao_lidas}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conversa.ultima_mensagem_data)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {conversa.status_campanha}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {conversa.ultima_mensagem}
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
