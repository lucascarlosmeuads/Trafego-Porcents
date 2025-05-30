
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { ChatSidebar } from './ChatSidebar'
import { ChatInterface } from './ChatInterface'
import { ManagerSelector } from '@/components/ManagerSelector'
import { MessageCircle, Shield, Filter, FilterX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function AdminChatLayoutSplit() {
  const [selectedGestor, setSelectedGestor] = useState<string | null>(null)
  const { conversas, loading } = useChatConversas(selectedGestor)
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

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

  // Reset selected chat when changing manager filter
  useEffect(() => {
    setSelectedChat(null)
  }, [selectedGestor])

  const handleSelectChat = (conversa: ChatConversaPreview) => {
    setSelectedChat(conversa)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  const handleManagerSelect = (manager: string | null) => {
    setSelectedGestor(manager)
  }

  // Filtrar conversas
  const conversasFiltradas = conversas.filter(conversa => 
    showOnlyUnread ? conversa.tem_mensagens_nao_lidas : true
  )

  // Contador de não lidas
  const totalNaoLidas = conversas.filter(c => c.tem_mensagens_nao_lidas).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
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
        <div className="h-screen">
          <ChatInterface
            emailCliente={selectedChat.email_cliente}
            emailGestor={selectedChat.email_gestor || ''}
            nomeCliente={selectedChat.nome_cliente}
            statusCampanha={selectedChat.status_campanha}
            onBack={handleBackToList}
            showBackButton={true}
          />
        </div>
      )
    }

    return (
      <div className="h-screen">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Admin - Monitoramento de Chat</h2>
            {totalNaoLidas > 0 && (
              <Badge variant="destructive" className="bg-red-600 text-white ml-auto">
                {totalNaoLidas} não lidas
              </Badge>
            )}
          </div>
          
          {/* Manager Selector - Mobile */}
          <div className="bg-gray-700 rounded-lg p-3 mb-3">
            <ManagerSelector 
              selectedManager={selectedGestor}
              onManagerSelect={handleManagerSelect}
              isAdminContext={true}
            />
          </div>

          {/* Filtro de não lidas - Mobile */}
          <Button
            variant={showOnlyUnread ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`w-full justify-start ${
              showOnlyUnread 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {showOnlyUnread ? <FilterX className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {showOnlyUnread ? 'Mostrar todas' : 'Apenas não lidas'}
            {showOnlyUnread && totalNaoLidas > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalNaoLidas}
              </Badge>
            )}
          </Button>
        </div>
        <ChatSidebar
          conversas={conversasFiltradas}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={loading}
        />
      </div>
    )
  }

  // Layout desktop: split view otimizado para tela cheia
  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar esquerda - Lista de conversas */}
      <div className="w-80 border-r border-gray-700 flex-shrink-0 h-full flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-white">Admin - Chat Monitor</h2>
            {totalNaoLidas > 0 && (
              <Badge variant="destructive" className="bg-red-600 text-white ml-auto">
                {totalNaoLidas}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">Monitoramento de todas as conversas</p>
          
          {/* Manager Selector - Desktop */}
          <div className="bg-gray-700 rounded-lg p-3 mb-3">
            <ManagerSelector 
              selectedManager={selectedGestor}
              onManagerSelect={handleManagerSelect}
              isAdminContext={true}
            />
          </div>

          {/* Filtro de não lidas - Desktop */}
          <Button
            variant={showOnlyUnread ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`w-full justify-start ${
              showOnlyUnread 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {showOnlyUnread ? <FilterX className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {showOnlyUnread ? 'Mostrar todas' : 'Apenas não lidas'}
            {showOnlyUnread && totalNaoLidas > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalNaoLidas}
              </Badge>
            )}
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatSidebar
            conversas={conversasFiltradas}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
        </div>
      </div>

      {/* Área principal - Chat ativo ocupando altura total */}
      <div className="flex-1 bg-white flex flex-col h-full">
        {selectedChat ? (
          <ChatInterface
            emailCliente={selectedChat.email_cliente}
            emailGestor={selectedChat.email_gestor || ''}
            nomeCliente={selectedChat.nome_cliente}
            statusCampanha={selectedChat.status_campanha}
            showBackButton={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Modo Administrador
              </h3>
              <p className="text-gray-600 max-w-sm">
                {selectedGestor 
                  ? 'Selecione uma conversa da lista à esquerda para monitorar a comunicação do gestor selecionado'
                  : 'Selecione uma conversa da lista à esquerda para monitorar a comunicação entre gestores e clientes'
                }
              </p>
              {conversasFiltradas.length === 0 && selectedGestor && (
                <p className="text-gray-500 text-sm mt-2">
                  {showOnlyUnread 
                    ? 'Nenhuma conversa não lida encontrada para o gestor selecionado'
                    : 'Nenhuma conversa encontrada para o gestor selecionado'
                  }
                </p>
              )}
              {conversasFiltradas.length === 0 && showOnlyUnread && !selectedGestor && (
                <p className="text-gray-500 text-sm mt-2">
                  Nenhuma conversa não lida encontrada
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add default export for lazy loading
export default AdminChatLayoutSplit
