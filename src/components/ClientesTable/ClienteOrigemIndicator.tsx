
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Bot, User } from 'lucide-react'

interface ClienteOrigemIndicatorProps {
  origem: 'appmax' | 'manual'
  createdAt?: string
  pedidoId?: string
  compact?: boolean
}

export function ClienteOrigemIndicator({ 
  origem, 
  createdAt, 
  pedidoId, 
  compact = false 
}: ClienteOrigemIndicatorProps) {
  const isAppMax = origem === 'appmax'
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return null
    }
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center">
              {isAppMax ? (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-2.5 h-2.5 text-white" />
                </div>
              ) : (
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">
                {isAppMax ? '🤖 AppMax (Automático)' : '👤 Manual'}
              </p>
              {isAppMax && createdAt && (
                <p className="text-xs text-muted-foreground">
                  Criado em: {formatDate(createdAt)}
                </p>
              )}
              {isAppMax && pedidoId && (
                <p className="text-xs text-muted-foreground">
                  Pedido: {pedidoId}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Badge 
      variant={isAppMax ? "default" : "secondary"}
      className={`${isAppMax ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
    >
      {isAppMax ? (
        <span className="flex items-center gap-1">
          <Bot className="w-3 h-3" /> AppMax
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" /> Manual
        </span>
      )}
    </Badge>
  )
}
