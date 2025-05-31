
import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'
import { MessageInput } from './MessageInput'
import { useChatMessages } from '@/hooks/useChatMessages'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, CheckCheck } from 'lucide-react'
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
  const { user, isCliente, isGestor } = useAuth()
  const { mensagens, loading, enviarMensagem, marcarTodasComoLidas } = useChatMessages(emailCliente, emailGestor)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const handleSendMessage = async (content: string, type: 'texto' | 'audio' = 'texto') => {
    await enviarMensagem(content, type, emailCliente)
  }

  const handleMarcarTodasLidas = async () => {
    await marcarTodasComoLidas()
  }

  // Verificar se há mensagens não lidas do outro usuário
  const mensagensNaoLidas = mensagens.filter(msg => 
    !msg.lida && 
    ((isCliente && msg.remetente === 'gestor') || 
     (isGestor && msg.remetente === 'cliente'))
  ).length

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
      {/* Header do chat - apenas para desktop ou quando showBackButton = true */}
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

            {/* Botão marcar como lida */}
            {mensagensNaoLidas > 0 && !isCliente && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarcarTodasLidas}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Marcar como lida</span>
                <span className="sm:hidden">({mensagensNaoLidas})</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Área de mensagens - ocupa todo espaço disponível */}
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
                (isGestor && mensagem.remetente === 'gestor')
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem - sempre visível, otimizado para mobile */}
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
