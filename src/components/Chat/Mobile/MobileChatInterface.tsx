
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useChatProfiles } from '@/hooks/useChatProfiles'
import { MobileChatHeader } from './MobileChatHeader'
import { MobileMessagesList } from './MobileMessagesList'
import { MobileSmartInput } from './MobileSmartInput'
import { MobileTypingIndicator } from './MobileTypingIndicator'
import { toast } from '@/components/ui/sonner'

interface MobileChatInterfaceProps {
  emailCliente: string
  emailGestor: string
  nomeCliente: string
  statusCampanha?: string
  onBack?: () => void
}

export function MobileChatInterface({
  emailCliente,
  emailGestor,
  nomeCliente,
  statusCampanha,
  onBack
}: MobileChatInterfaceProps) {
  const { user, isCliente, isGestor, isAdmin } = useAuth()
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesListRef = useRef<HTMLDivElement>(null)

  // Determinar parâmetros corretos para o hook
  const emailClienteParam = emailCliente
  const emailGestorParam = isAdmin ? emailGestor : (isGestor ? user?.email || '' : emailGestor)

  const { mensagens, loading, enviarMensagem } = useChatMessages(emailClienteParam, emailGestorParam)
  const { gestorProfile, clienteProfile, loading: profilesLoading } = useChatProfiles(emailCliente, emailGestor)

  // Auto-scroll para nova mensagem
  useEffect(() => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight
    }
  }, [mensagens])

  // Simular indicador de digitação
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true)
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
    
    setTypingTimeout(timeout)
  }

  const handleSendMessage = async (content: string, type: 'texto' | 'audio' = 'texto') => {
    try {
      await enviarMensagem(content, type, emailCliente)
      setIsTyping(false)
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    }
  }

  // Obter dados do usuário atual
  const getCurrentUserData = () => {
    if (isCliente) {
      return {
        avatar: clienteProfile?.avatar_url,
        name: clienteProfile?.nome || 'Você',
        isOnline: true
      }
    } else {
      return {
        avatar: gestorProfile?.avatar_url,
        name: gestorProfile?.nome || 'Você',
        isOnline: true
      }
    }
  }

  // Obter dados do outro usuário
  const getOtherUserData = () => {
    if (isCliente) {
      return {
        avatar: gestorProfile?.avatar_url,
        name: gestorProfile?.nome || 'Gestor',
        isOnline: true
      }
    } else {
      return {
        avatar: clienteProfile?.avatar_url,
        name: nomeCliente || clienteProfile?.nome || 'Cliente',
        isOnline: true
      }
    }
  }

  if (loading || profilesLoading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trafego-accent-primary mx-auto mb-2"></div>
          <p className="text-white text-sm">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  const currentUser = getCurrentUserData()
  const otherUser = getOtherUserData()

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      <MobileChatHeader
        userName={otherUser.name}
        userAvatar={otherUser.avatar}
        isOnline={otherUser.isOnline}
        statusCampanha={statusCampanha}
        onBack={onBack}
      />

      <div 
        ref={messagesListRef}
        className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth"
        style={{ 
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent'
        }}
      >
        <MobileMessagesList
          mensagens={mensagens}
          currentUser={currentUser}
          otherUser={otherUser}
          isCliente={isCliente}
          isGestor={isGestor}
          isAdmin={isAdmin}
        />
        
        {isTyping && (
          <MobileTypingIndicator 
            userName={otherUser.name} 
            userAvatar={otherUser.avatar}
          />
        )}
      </div>

      <MobileSmartInput
        onSendMessage={handleSendMessage}
        onTyping={handleTypingStart}
        placeholder={
          isCliente 
            ? "Digite uma mensagem..." 
            : `Responder para ${nomeCliente}...`
        }
      />
    </div>
  )
}
