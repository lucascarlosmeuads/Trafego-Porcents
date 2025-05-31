
import { useState, useEffect } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { ChatInterface } from './ChatInterface'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { useAuth } from '@/hooks/useAuth'
import { MessageCircle } from 'lucide-react'

export function ChatLayoutSplit() {
  const { conversas, loading } = useChatConversas()
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Selecionar primeiro chat automaticamente se não houver seleção
  useEffect(() => {
    if (!selectedChat && conversas.length > 0 && !isMobile) {
      setSelectedChat(conversas[0])
    }
  }, [conversas, selectedChat, isMobile])

  const handleSelectChat = (conversa: ChatConversaPreview) => {
    setSelectedChat(conversa)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
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

  // Layout mobile: mostrar lista ou chat
  if (isMobile) {
    if (selectedChat) {
      return (
        <div className="h-full">
          <ChatInterface
            emailCliente={selectedChat.email_cliente}
            emailGestor={user?.email || ''}
            nomeCliente={selectedChat.nome_cliente}
            statusCampanha={selectedChat.status_campanha}
            onBack={handleBackToList}
            showBackButton={true}
          />
        </div>
      )
    }

    return (
      <div className="h-full">
        <ChatSidebar
          conversas={conversas}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={loading}
        />
      </div>
    )
  }

  // Layout desktop: split view com proporções melhoradas
  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar esquerda - Lista de conversas - pode ter scroll livre */}
      <div className="w-80 border-r border-gray-700 flex-shrink-0 h-full overflow-hidden">
        <ChatSidebar
          conversas={conversas}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={loading}
        />
      </div>

      {/* Área principal - Chat ativo com altura controlada */}
      <div className="flex-1 bg-white flex flex-col h-full">
        {selectedChat ? (
          <ChatInterface
            emailCliente={selectedChat.email_cliente}
            emailGestor={user?.email || ''}
            nomeCliente={selectedChat.nome_cliente}
            statusCampanha={selectedChat.status_campanha}
            showBackButton={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-600 max-w-sm">
                Escolha uma conversa da lista à esquerda para começar a trocar mensagens com seus clientes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
