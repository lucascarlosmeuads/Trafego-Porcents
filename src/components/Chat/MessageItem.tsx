
import { ChatMensagem } from '@/hooks/useChatMessages'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Bot } from 'lucide-react'

interface MessageItemProps {
  mensagem: ChatMensagem
  isOwn: boolean
  showTimestamp?: boolean
}

export function MessageItem({ mensagem, isOwn, showTimestamp = false }: MessageItemProps) {
  const isGestorMessage = mensagem.remetente === 'gestor'
  
  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
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
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  )
}
