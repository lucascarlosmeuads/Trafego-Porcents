
import { ChatMensagem } from '@/hooks/useChatMessages'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MobileAudioPlayer } from './MobileAudioPlayer'
import { Check, CheckCheck } from 'lucide-react'

interface MobileMessageBubbleProps {
  mensagem: ChatMensagem
  isOwn: boolean
  userData: {
    avatar?: string
    name: string
  }
  isFirstInSequence: boolean
  isLastInSequence: boolean
  showTimestamp?: boolean
}

export function MobileMessageBubble({
  mensagem,
  isOwn,
  userData,
  isFirstInSequence,
  isLastInSequence,
  showTimestamp = false
}: MobileMessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR })
  }

  const isAudio = mensagem.tipo === 'audio'

  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar - só mostrar na última mensagem da sequência */}
      <div className="w-8 h-8 flex-shrink-0">
        {!isOwn && isLastInSequence && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={userData.avatar || undefined} alt={userData.name} />
            <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Bolha da mensagem */}
      <div className={`max-w-[280px] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            px-3 py-2 rounded-2xl relative
            ${isOwn 
              ? 'bg-trafego-accent-primary text-white ml-auto' 
              : 'bg-gray-800 text-white'
            }
            ${isFirstInSequence && isOwn ? 'rounded-tr-md' : ''}
            ${isFirstInSequence && !isOwn ? 'rounded-tl-md' : ''}
            ${isLastInSequence && isOwn ? 'rounded-br-md' : ''}
            ${isLastInSequence && !isOwn ? 'rounded-bl-md' : ''}
          `}
        >
          {isAudio ? (
            <MobileAudioPlayer audioUrl={mensagem.conteudo} isOwn={isOwn} />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {mensagem.conteudo}
            </p>
          )}

          {/* Timestamp e status na própria bolha para mensagens próprias */}
          {isOwn && showTimestamp && (
            <div className="flex items-center gap-1 mt-1 justify-end">
              <span className="text-xs opacity-70">
                {formatTime(mensagem.created_at)}
              </span>
              {mensagem.lida ? (
                <CheckCheck className="w-3 h-3 opacity-70" />
              ) : (
                <Check className="w-3 h-3 opacity-70" />
              )}
            </div>
          )}
        </div>

        {/* Timestamp externo para mensagens de outros */}
        {!isOwn && showTimestamp && (
          <span className="text-xs text-gray-400 mt-1 px-1">
            {formatTime(mensagem.created_at)}
          </span>
        )}
      </div>
    </div>
  )
}
