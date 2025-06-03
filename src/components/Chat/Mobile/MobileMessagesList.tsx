
import { ChatMensagem } from '@/hooks/useChatMessages'
import { MobileMessageBubble } from './MobileMessageBubble'

interface MobileMessagesListProps {
  mensagens: ChatMensagem[]
  currentUser: {
    avatar?: string
    name: string
    isOnline: boolean
  }
  otherUser: {
    avatar?: string
    name: string
    isOnline: boolean
  }
  isCliente: boolean
  isGestor: boolean
  isAdmin: boolean
}

export function MobileMessagesList({
  mensagens,
  currentUser,
  otherUser,
  isCliente,
  isGestor,
  isAdmin
}: MobileMessagesListProps) {
  if (mensagens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-3xl">💬</span>
        </div>
        <h3 className="text-white font-medium mb-2">Nenhuma mensagem ainda</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          {isCliente 
            ? 'Inicie uma conversa com seu gestor! Envie sua primeira mensagem.'
            : `Aguardando primeira mensagem de ${otherUser.name}`
          }
        </p>
      </div>
    )
  }

  // Agrupar mensagens por data
  const groupedMessages = mensagens.reduce((groups, mensagem) => {
    const date = new Date(mensagem.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(mensagem)
    return groups
  }, {} as Record<string, ChatMensagem[]>)

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })
    }
  }

  return (
    <div className="space-y-1 pb-4">
      {Object.entries(groupedMessages).map(([dateString, dayMessages]) => (
        <div key={dateString}>
          {/* Header da data */}
          <div className="flex justify-center my-4">
            <div className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-gray-300 text-xs font-medium">
                {formatDateHeader(dateString)}
              </span>
            </div>
          </div>

          {/* Mensagens do dia */}
          {dayMessages.map((mensagem, index) => {
            const isOwn = (isCliente && mensagem.remetente === 'cliente') ||
                          ((isGestor || isAdmin) && mensagem.remetente === 'gestor')
            
            const userData = isOwn ? currentUser : otherUser
            
            // Verificar se é a primeira mensagem de uma sequência
            const prevMessage = index > 0 ? dayMessages[index - 1] : null
            const isFirstInSequence = !prevMessage || prevMessage.remetente !== mensagem.remetente
            
            // Verificar se é a última mensagem de uma sequência
            const nextMessage = index < dayMessages.length - 1 ? dayMessages[index + 1] : null
            const isLastInSequence = !nextMessage || nextMessage.remetente !== mensagem.remetente
            
            return (
              <MobileMessageBubble
                key={mensagem.id}
                mensagem={mensagem}
                isOwn={isOwn}
                userData={userData}
                isFirstInSequence={isFirstInSequence}
                isLastInSequence={isLastInSequence}
                showTimestamp={isLastInSequence}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
