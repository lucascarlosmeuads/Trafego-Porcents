
import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useChatMessages } from '@/hooks/useChatMessages'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const emailGestorParam = isGestor ? user?.email || '' : emailGestor

  console.log('🔍 [ChatInterface] Parâmetros para useChatMessages:', {
    emailClienteParam,
    emailGestorParam
  })

  const { mensagens, loading, enviarMensagem } = useChatMessages(emailClienteParam, emailGestorParam)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const handleSendMessage = async (content: string, type: 'texto' | 'audio' = 'texto') => {
    await enviarMensagem(content, type, emailCliente)
  }

  if (loading) {
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
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              
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
          mensagens.map((mensagem) => (
            <MessageItem
              key={mensagem.id}
              mensagem={mensagem}
              isOwn={
                (isCliente && mensagem.remetente === 'cliente') ||
                ((isGestor || isAdmin) && mensagem.remetente === 'gestor')
              }
            />
          ))
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
