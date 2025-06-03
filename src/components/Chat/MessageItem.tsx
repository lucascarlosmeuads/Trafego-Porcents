
import { ChatMensagem } from '@/hooks/useChatMessages'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'

interface MessageItemProps {
  mensagem: ChatMensagem
  isOwn: boolean
  showTimestamp?: boolean
  senderAvatar?: string | null
  senderName?: string
}

export function MessageItem({ 
  mensagem, 
  isOwn, 
  showTimestamp = false,
  senderAvatar,
  senderName 
}: MessageItemProps) {
  const isGestorMessage = mensagem.remetente === 'gestor'
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar || undefined} alt={senderName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {senderName ? getInitials(senderName) : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
        <Card className={`p-3 ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={isGestorMessage ? 'default' : 'secondary'} className="text-xs">
              {isGestorMessage ? 'Gestor' : 'Cliente'}
            </Badge>
            {showTimestamp && (
              <span className="text-xs opacity-70">
                {format(new Date(mensagem.created_at), 'dd/MM HH:mm', { locale: ptBR })}
              </span>
            )}
          </div>
          
          <p className="text-sm leading-relaxed">
            {mensagem.conteudo}
          </p>
        </Card>
      </div>
      
      {isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar || undefined} alt={senderName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {senderName ? getInitials(senderName) : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
