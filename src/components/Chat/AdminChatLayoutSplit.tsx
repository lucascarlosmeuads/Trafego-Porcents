import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatConversas, ChatConversaPreview } from '@/hooks/useChatMessages'
import { ChatSidebar } from './ChatSidebar'
import { ChatInterface } from './ChatInterface'
import { ManagerSelector } from '@/components/ManagerSelector'
import { MessageCircle, Shield, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

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

  // DEBUG: Vamos investigar os emails da Andreza especificamente
  useEffect(() => {
    const investigarEmailsAndreza = async () => {
      if (selectedGestor && selectedGestor.includes('andreza')) {
        console.log('🔍 [AdminChatLayoutSplit] === INVESTIGAÇÃO ANDREZA ===')
        console.log('🔍 [AdminChatLayoutSplit] Gestor selecionado:', selectedGestor)
        
        // Verificar na tabela gestores
        const { data: gestores } = await supabase
          .from('gestores')
          .select('email, nome')
          .ilike('email', '%andreza%')
        
        console.log('👥 [AdminChatLayoutSplit] Gestores Andreza encontrados:', gestores)
        
        // Verificar na tabela todos_clientes
        const { data: clientes } = await supabase
          .from('todos_clientes')
          .select('email_gestor, nome_cliente, email_cliente')
          .ilike('email_gestor', '%andreza%')
        
        console.log('👤 [AdminChatLayoutSplit] Clientes da Andreza encontrados:', clientes?.length)
        console.log('👤 [AdminChatLayoutSplit] Primeiros 3 clientes:', clientes?.slice(0, 3))
        
        // Verificar mensagens especificamente
        const { data: mensagens } = await supabase
          .from('chat_mensagens')
          .select('email_gestor, email_cliente, conteudo')
          .ilike('email_gestor', '%andreza%')
          .limit(5)
        
        console.log('💬 [AdminChatLayoutSplit] Mensagens da Andreza encontradas:', mensagens?.length)
        console.log('💬 [AdminChatLayoutSplit] Primeiras mensagens:', mensagens)
      }
    }
    
    investigarEmailsAndreza()
  }, [selectedGestor])

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
    console.log('🔍 [AdminChatLayoutSplit] Selecionando conversa:', {
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
              <p className="text-gray-600 max-w-sm mb-4">
                {conversas.length === 0 
                  ? selectedGestor 
                    ? 'Nenhuma conversa encontrada para o gestor selecionado'
                    : 'Nenhuma conversa encontrada no sistema'
                  : 'Selecione uma conversa da lista à esquerda para monitorar a comunicação'
                }
              </p>
              {conversas.length > 0 && (
                <div className="text-sm text-gray-500">
                  {getTotalConversas()} conversa{getTotalConversas() !== 1 ? 's' : ''} disponível{getTotalConversas() !== 1 ? 'is' : ''}
                </div>
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
