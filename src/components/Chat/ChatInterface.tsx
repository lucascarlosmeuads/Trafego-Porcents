
import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useChatMessages, ChatMensagem } from '@/hooks/useChatMessages'
import { useChatProfiles } from '@/hooks/useChatProfiles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface ChatInterfaceProps {
  emailCliente: string
  emailGestor: string
  nomeCliente: string
  statusCampanha?: string
  onBack?: () => void
  showBackButton?: boolean
}

export function ChatInterface({
  emailCliente,
  emailGestor,
  nomeCliente,
  statusCampanha,
  onBack,
  showBackButton = false
}: ChatInterfaceProps) {
  const { user, isCliente, isGestor, isAdmin } = useAuth()
  
  console.log('🔍 [ChatInterface] Props recebidas:', {
    emailCliente,
    emailGestor,
    nomeCliente,
    statusCampanha,
    userEmail: user?.email,
    isAdmin,
    isGestor,
    isCliente
  })

  // Determinar os emails corretos para o hook baseado no tipo de usuário
  const emailClienteParam = emailCliente
  // CORREÇÃO: Para admin, sempre usar o emailGestor original passado como prop
  // Para gestor, usar o email do usuário logado
  const emailGestorParam = isAdmin ? emailGestor : (isGestor ? user?.email || '' : emailGestor)

  console.log('🔍 [ChatInterface] Parâmetros corrigidos para useChatMessages:', {
    emailClienteParam,
    emailGestorParam,
    isAdmin,
    isGestor,
    userEmail: user?.email
  })

  const { mensagens, loading, enviarMensagem } = useChatMessages(emailClienteParam, emailGestorParam)
  const { gestorProfile, clienteProfile, loading: profilesLoading } = useChatProfiles(emailCliente, emailGestor)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const handleSendMessage = async (content: string, type: 'texto' | 'audio' = 'texto') => {
    await enviarMensagem(content, type, emailCliente)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Função para obter dados do remetente da mensagem
  const getSenderData = (mensagem: ChatMensagem) => {
    if (mensagem.remetente === 'gestor') {
      return {
        avatar: gestorProfile?.avatar_url,
        name: gestorProfile?.nome
      }
    } else {
      return {
        avatar: clienteProfile?.avatar_url,
        name: clienteProfile?.nome
      }
    }
  }

  // Função para obter dados do próprio usuário
  const getOwnUserData = () => {
    if (isCliente) {
      return {
        avatar: clienteProfile?.avatar_url,
        name: clienteProfile?.nome
      }
    } else {
      return {
        avatar: gestorProfile?.avatar_url,
        name: gestorProfile?.nome
      }
    }
  }

  if (loading || profilesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {(showBackButton || window.innerWidth >= 768) && (
        <div className="border-b bg-card p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={clienteProfile?.avatar_url || undefined} alt={nomeCliente} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(nomeCliente)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{nomeCliente}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{emailCliente}</span>
                  {statusCampanha && (
                    <Badge variant="secondary" className="text-xs">
                      {statusCampanha}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 min-h-0">
        {mensagens.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">💬</div>
            <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-sm text-muted-foreground">
              {isCliente ? 'Inicie uma conversa com seu gestor!' : 'Aguardando mensagem do cliente'}
            </p>
          </div>
        ) : (
          mensagens.map((mensagem) => {
            const isOwn = (isCliente && mensagem.remetente === 'cliente') ||
                          ((isGestor || isAdmin) && mensagem.remetente === 'gestor')
            
            const senderData = getSenderData(mensagem)
            const ownData = getOwnUserData()
            
            return (
              <MessageItem
                key={mensagem.id}
                mensagem={mensagem}
                isOwn={isOwn}
                senderAvatar={isOwn ? ownData.avatar : senderData.avatar}
                senderName={isOwn ? ownData.name : senderData.name}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 bg-card border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={
            isCliente 
              ? "Digite sua mensagem para o gestor..." 
              : `Digite sua mensagem para ${nomeCliente}...`
          }
        />
      </div>
    </div>
  )
}
