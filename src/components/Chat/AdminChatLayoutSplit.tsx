
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { ChatSidebar } from './ChatSidebar'
import { ChatInterface } from './ChatInterface'
import { AdminGestorOverview } from './AdminGestorOverview'
import { ManagerSelector } from '@/components/ManagerSelector'
import { MessageCircle, Shield, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AdminChatLayoutSplit() {
  const [selectedGestor, setSelectedGestor] = useState<string | null>(null)
  const { conversas, loading } = useChatConversas(selectedGestor)
  const [selectedChat, setSelectedChat] = useState<ChatConversaPreview | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  console.log('🔍 [AdminChatLayoutSplit] Estado atual:', {
    selectedGestor,
    conversasCount: conversas.length,
    selectedChat: selectedChat ? {
      email_cliente: selectedChat.email_cliente,
      email_gestor: selectedChat.email_gestor,
      nome_cliente: selectedChat.nome_cliente
    } : null,
    loading
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!selectedChat && conversas.length > 0 && !isMobile) {
      setSelectedChat(conversas[0])
    }
  }, [conversas, selectedChat, isMobile])

  useEffect(() => {
    setSelectedChat(null)
  }, [selectedGestor])

  const handleSelectChat = (conversa: ChatConversaPreview) => {
    console.log('🔍 [AdminChatLayoutSplit] Selecionando conversa específica:', {
      email_cliente: conversa.email_cliente,
      email_gestor: conversa.email_gestor,
      nome_cliente: conversa.nome_cliente
    })
    setSelectedChat(conversa)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  const handleManagerSelect = (manager: string | null) => {
    console.log('🔍 [AdminChatLayoutSplit] === MUDANÇA DE GESTOR ===')
    console.log('🔍 [AdminChatLayoutSplit] Gestor anterior:', selectedGestor)
    console.log('🔍 [AdminChatLayoutSplit] Novo gestor selecionado:', manager)
    setSelectedGestor(manager)
  }

  const getTotalConversas = () => {
    return conversas.length
  }

  const getFilterText = () => {
    if (!selectedGestor) {
      return 'Todas as conversas'
    }
    return `Conversas filtradas`
  }

  const getSelectedGestorName = () => {
    if (!selectedGestor) return null
    // Extrair nome do email do gestor para exibição
    const nomeGestor = selectedGestor.split('@')[0]
    return nomeGestor.charAt(0).toUpperCase() + nomeGestor.slice(1)
  }

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
          </div>
          
          {/* Status das conversas */}
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">{getFilterText()}</span>
            <Badge variant="outline" className="bg-blue-800 text-blue-100 border-blue-600">
              {getTotalConversas()} conversa{getTotalConversas() !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Manager Selector - Mobile */}
          <div className="bg-gray-700 rounded-lg p-3 mb-3">
            <ManagerSelector 
              selectedManager={selectedGestor}
              onManagerSelect={handleManagerSelect}
              isAdminContext={true}
            />
          </div>
        </div>
        <ChatSidebar
          conversas={conversas}
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
          </div>
          
          {/* Status das conversas */}
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">{getFilterText()}</span>
            <Badge variant="outline" className="bg-blue-800 text-blue-100 border-blue-600">
              {getTotalConversas()} conversa{getTotalConversas() !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Manager Selector - Desktop */}
          <div className="bg-gray-700 rounded-lg p-3 mb-3">
            <ManagerSelector 
              selectedManager={selectedGestor}
              onManagerSelect={handleManagerSelect}
              isAdminContext={true}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatSidebar
            conversas={conversas}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
        </div>
      </div>

      {/* Área principal - Chat ativo ocupando altura total */}
      <div className="flex-1 bg-white flex flex-col h-full">
        {selectedChat ? (
          // Conversa específica selecionada
          <ChatInterface
            emailCliente={selectedChat.email_cliente}
            emailGestor={selectedChat.email_gestor || ''}
            nomeCliente={selectedChat.nome_cliente}
            statusCampanha={selectedChat.status_campanha}
            showBackButton={false}
          />
        ) : selectedGestor ? (
          // Gestor selecionado mas nenhuma conversa específica - mostrar overview
          <AdminGestorOverview
            emailGestor={selectedGestor}
            nomeGestor={getSelectedGestorName() || selectedGestor}
          />
        ) : (
          // Nenhum gestor selecionado
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Modo Administrador
              </h3>
              <p className="text-gray-600 max-w-sm mb-4">
                Selecione um gestor à esquerda para monitorar todas as suas conversas, ou clique em uma conversa específica para ver os detalhes
              </p>
              <div className="text-sm text-gray-500">
                Sistema de monitoramento de chat ativo
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add default export for lazy loading
export default AdminChatLayoutSplit
